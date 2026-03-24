import { AssessmentQuestion, AssessmentTier } from "@/data/assessment";

export interface GradedAnswer {
  questionId: string;
  tier: AssessmentTier;
  userAnswer: string;
  score: number; // 0-100
  matchedPoints: number;
  totalPoints: number;
  feedback: string[]; // which answer key points were missed
}

export interface AssessmentGradeResult {
  overallScore: number; // 0-100
  totalCorrect: number; // questions scoring >= 70%
  totalQuestions: number;
  tierScores: Record<string, { score: number; total: number; passed: number }>;
  gradedAnswers: GradedAnswer[];
}

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "for", "to", "of", "in", "on", "it", "and", "or", "but", "not",
  "with", "that", "this", "from", "by", "at", "as", "can", "may",
  "if", "do", "does", "did", "has", "have", "had", "will", "would",
  "shall", "should", "could", "might", "must", "need", "dare",
  "its", "your", "my", "his", "her", "our", "their", "them", "they",
  "we", "you", "he", "she", "me", "us", "him", "who", "what", "which",
  "when", "where", "how", "why", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "nor",
  "too", "very", "just", "also", "than", "then", "so", "up", "out",
  "about", "into", "over", "after", "before", "between", "under",
  "again", "further", "once", "here", "there", "any", "get", "gets",
  "got", "even", "still", "already", "yet", "only",
]);

/**
 * Extract key terms from an answer key bullet point.
 * Strips punctuation, removes stop words, returns lowercase content words.
 */
function extractKeyTerms(bullet: string): string[] {
  const words = bullet
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return words;
}

/**
 * Check if a user's answer matches a bullet point from the answer key.
 * A bullet is "matched" if >= 60% of its key terms appear in the user answer.
 */
function bulletMatches(bullet: string, userAnswerLower: string): boolean {
  const keyTerms = extractKeyTerms(bullet);
  if (keyTerms.length === 0) return true; // trivial bullet

  let matched = 0;
  for (const term of keyTerms) {
    if (userAnswerLower.includes(term)) {
      matched++;
    }
  }

  return matched / keyTerms.length >= 0.6;
}

/**
 * Grade a single question.
 */
function gradeQuestion(
  question: AssessmentQuestion,
  userAnswer: string
): GradedAnswer {
  const userAnswerLower = userAnswer.toLowerCase();
  const totalPoints = question.answerKey.length;
  let matchedPoints = 0;
  const feedback: string[] = [];

  for (const bullet of question.answerKey) {
    if (bulletMatches(bullet, userAnswerLower)) {
      matchedPoints++;
    } else {
      feedback.push(bullet);
    }
  }

  const score = totalPoints > 0 ? Math.round((matchedPoints / totalPoints) * 100) : 0;

  return {
    questionId: question.id,
    tier: question.tier,
    userAnswer,
    score,
    matchedPoints,
    totalPoints,
    feedback,
  };
}

/**
 * Grade an entire assessment attempt.
 */
export function gradeAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, string>
): AssessmentGradeResult {
  const gradedAnswers: GradedAnswer[] = questions.map((q) =>
    gradeQuestion(q, answers[q.id] || "")
  );

  const totalQuestions = gradedAnswers.length;
  const totalCorrect = gradedAnswers.filter((a) => a.score >= 70).length;
  const overallScore =
    totalQuestions > 0
      ? Math.round(gradedAnswers.reduce((sum, a) => sum + a.score, 0) / totalQuestions)
      : 0;

  // Build tier scores
  const tierScores: Record<string, { score: number; total: number; passed: number }> = {};
  for (const ga of gradedAnswers) {
    if (!tierScores[ga.tier]) {
      tierScores[ga.tier] = { score: 0, total: 0, passed: 0 };
    }
    tierScores[ga.tier].total++;
    tierScores[ga.tier].score += ga.score;
    if (ga.score >= 70) tierScores[ga.tier].passed++;
  }
  // Average the tier scores
  for (const tier of Object.keys(tierScores)) {
    tierScores[tier].score = Math.round(tierScores[tier].score / tierScores[tier].total);
  }

  return {
    overallScore,
    totalCorrect,
    totalQuestions,
    tierScores,
    gradedAnswers,
  };
}
