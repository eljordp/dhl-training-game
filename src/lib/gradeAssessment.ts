import type { AssessmentQuestion, AssessmentTier } from "../data/assessment";
import { assessmentRubrics } from "../data/assessmentRubrics";

export const PASS_SCORE = 70;
export const GRADING_VERSION = "concept-rubrics-v2";
export interface GradedAnswer {
  questionId: string;
  tier: AssessmentTier;
  userAnswer: string;
  score: number;
  matchedPoints: number;
  totalPoints: number;
  feedback: string[];
  evidence: (string | null)[];
  reviewRequired: boolean;
  reviewReason?: string;
}
export interface AssessmentGradeResult {
  overallScore: number;
  totalCorrect: number;
  totalQuestions: number;
  reviewCount: number;
  tierScores: Record<string, { score: number; total: number; passed: number }>;
  gradedAnswers: GradedAnswer[];
}
export function normalizeAnswer(answer: string): string {
  return answer.normalize("NFKC").toLowerCase()
    .replace(/[’‘]/g, "'").replace(/[–—]/g, "-").replace(/×/g, "x").replace(/÷/g, "/")
    .replace(/\b(don't|doesn't|can't|won't|shouldn't|mustn't)\b/g, (s) => ({
      "don't":"do not", "doesn't":"does not", "can't":"cannot", "won't":"will not", "shouldn't":"should not", "mustn't":"must not",
    }[s]!))
    .replace(/\s+/g, " ").trim();
}

/** A contradiction is a review flag, never a score awarded for matching words.
 * Negated bad actions ("do not invent a phone number") must not trigger it.
 */
function hasContradiction(answer: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => {
    const match = pattern.exec(answer);
    if (!match) return false;
    if (/(?:does not|cannot|never|not) (?:prove|mean|guarantee)/.test(match[0])) return false;
    const prefix = answer.slice(Math.max(0, match.index - 35), match.index);
    return !/(?:do not|must not|never|cannot|should not|will not|not to)\s+(?:\w+\s+){0,2}$/.test(prefix);
  });
}

export function gradeQuestion(question: AssessmentQuestion, userAnswer: string): GradedAnswer {
  const normalized = normalizeAnswer(userAnswer);
  const rubric = assessmentRubrics[question.id];
  const totalPoints = question.answerKey.length;
  const metaContradiction = /(?:everything|all (?:of )?(?:the )?(?:statements|answers|ideas|points)).{0,30}(?:below|above)?.{0,20}(?:wrong|false|incorrect)|(?:it is|it's) (?:false|incorrect|wrong) that/.test(normalized);
  const contradiction = metaContradiction || rubric && hasContradiction(normalized, rubric.contradictions || []);
  const unsupported = !rubric || rubric.criteria.length !== totalPoints;
  const evidence = question.answerKey.map((_, i) => {
    if (!normalized || unsupported || contradiction) return null;
    for (const pattern of rubric.criteria[i]) {
      const match = pattern.exec(normalized);
      if (match) {
        // Affirmative concepts cannot be credited if directly negated.
        const prefix = normalized.slice(Math.max(0, match.index - 25), match.index);
        if (/(?:not|never|cannot)\s+$/.test(prefix)) continue;
        return match[0] || normalized;
      }
    }
    return null;
  });
  const matchedPoints = evidence.filter(value => value !== null).length;
  const feedback = question.answerKey.filter((_, i) => evidence[i] === null);
  return {
    questionId: question.id, tier: question.tier, userAnswer,
    score: totalPoints ? Math.round(matchedPoints / totalPoints * 100) : 0,
    matchedPoints, totalPoints, feedback, evidence,
    reviewRequired: feedback.length > 0 || Boolean(contradiction) || unsupported,
    reviewReason: contradiction ? "This answer may contradict a core idea. Automatic credit is withheld for this question until a trainer reviews it."
      : unsupported ? "No verified grading rubric is available for this question."
      : feedback.length ? "The automatic check could not confirm every idea. This may be missing detail or wording it does not recognize; review the answer before judging it."
      : undefined,
  };
}

export function summarizeGrades(gradedAnswers: GradedAnswer[]): AssessmentGradeResult {
  const totalQuestions = gradedAnswers.length;
  const totalCorrect = gradedAnswers.filter(a => a.score >= PASS_SCORE && !a.reviewRequired).length;
  const tierScores: AssessmentGradeResult['tierScores'] = {};
  for (const answer of gradedAnswers) {
    const tier = tierScores[answer.tier] ||= { score: 0, total: 0, passed: 0 };
    tier.score += answer.score; tier.total++;
    if (answer.score >= PASS_SCORE && !answer.reviewRequired) tier.passed++;
  }
  for (const tier of Object.values(tierScores)) tier.score = Math.round(tier.score / tier.total);
  return {
    overallScore: totalQuestions ? Math.round(gradedAnswers.reduce((sum, a) => sum + a.score, 0) / totalQuestions) : 0,
    totalCorrect, totalQuestions, reviewCount: gradedAnswers.filter(a=>a.reviewRequired).length,
    tierScores, gradedAnswers,
  };
}
export function gradeAssessment(questions: AssessmentQuestion[], answers: Record<string, string>): AssessmentGradeResult {
  return summarizeGrades(questions.map(q => gradeQuestion(q, answers[q.id] || "")));
}
