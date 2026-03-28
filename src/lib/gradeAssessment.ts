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

/**
 * Simple stemmer: strip common suffixes to get a rough root form.
 * Not a full NLP stemmer — just enough to match "regulation" → "regulat",
 * "professionally" → "profession", etc.
 */
function simpleStem(word: string): string {
  let w = word.toLowerCase();
  // Order matters — strip longer suffixes first
  const suffixes = [
    "ation", "ition", "ment", "ness", "tion", "sion",
    "ible", "able", "ious", "eous", "ous", "ive",
    "ing", "ful", "less", "ally", "ily", "ly",
    "ed", "er", "es", "al",
  ];
  for (const suffix of suffixes) {
    if (w.length > suffix.length + 2 && w.endsWith(suffix)) {
      return w.slice(0, -suffix.length);
    }
  }
  return w;
}

/**
 * Synonym / related-term map.
 * Each key maps to a set of words that should be treated as equivalent matches.
 * The map is bidirectional — built from synonym groups below.
 */
const SYNONYM_GROUPS: string[][] = [
  ["fraud", "fraudulent", "fraud flag"],
  ["hold", "held", "holding"],
  ["seize", "seized", "seizure"],
  ["reject", "rejected", "rejection"],
  ["fine", "fines", "penalty", "penalties"],
  ["compliant", "compliance", "non-compliant"],
  ["regulate", "regulated", "regulations", "regulatory"],
  ["restrict", "restricted", "restrictions"],
  ["prohibit", "prohibited"],
  ["declare", "declared", "declaration", "declarations"],
  ["inspect", "inspection"],
  ["verify", "verified", "verification"],
  ["describe", "described", "description", "descriptions"],
  ["invoice", "invoicing"],
  ["deliver", "delivery", "delivered"],
  ["clear", "clearance", "cleared", "clearing"],
  ["ship", "shipped", "shipping", "shipment", "shipments"],
  ["custom", "customs"],
  ["duty", "duties"],
  ["tax", "taxes", "taxed"],
  ["charge", "charges", "charged"],
  ["require", "required", "requirement", "requirements"],
  ["identify", "identified", "identification"],
  ["value", "valued", "valuation", "undervalue", "undervalued", "undervaluation"],
  ["specific", "specifically"],
  ["detail", "detailed"],
  ["resolve", "resolved"],
  ["suspect", "suspected", "suspicious", "suspicion"],
  ["match", "mismatch", "mismatched", "matching"],
  ["criminal", "prosecution"],
  ["precedent", "exception", "exceptions"],
];

// Build a flat map: word → array of all synonyms (including itself)
const SYNONYM_MAP = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    if (SYNONYM_MAP.has(word)) {
      // Merge with existing array
      const existing = SYNONYM_MAP.get(word)!;
      for (let i = 0; i < group.length; i++) {
        if (existing.indexOf(group[i]) === -1) {
          existing.push(group[i]);
        }
      }
    } else {
      SYNONYM_MAP.set(word, group.slice());
    }
  }
}

/**
 * Check if a term (from the answer key) appears in the user's answer text.
 * Checks: exact substring, synonym substring, and stem-based matching.
 */
function termExistsInAnswer(term: string, userAnswerLower: string, userAnswerWords: string[]): boolean {
  // 1. Direct substring match (original behavior)
  if (userAnswerLower.includes(term)) {
    return true;
  }

  // 2. Synonym match — check if any synonym of this term appears in the answer
  const synonyms = SYNONYM_MAP.get(term);
  if (synonyms) {
    for (const syn of synonyms) {
      if (userAnswerLower.includes(syn)) {
        return true;
      }
    }
  }

  // 3. Stem-based match — compare stems of the key term against stems of user words
  const termStem = simpleStem(term);
  for (const userWord of userAnswerWords) {
    if (simpleStem(userWord) === termStem) {
      return true;
    }
  }

  return false;
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
 * A bullet is "matched" if >= 40% of its key terms appear in the user answer.
 * Uses synonym matching and simple stemming for more forgiving comparisons.
 */
function bulletMatches(bullet: string, userAnswerLower: string): boolean {
  const keyTerms = extractKeyTerms(bullet);
  if (keyTerms.length === 0) return true; // trivial bullet

  // Pre-split user answer into words for stem comparison
  const userAnswerWords = userAnswerLower
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  let matched = 0;
  for (const term of keyTerms) {
    if (termExistsInAnswer(term, userAnswerLower, userAnswerWords)) {
      matched++;
    }
  }

  return matched / keyTerms.length >= 0.4;
}

/**
 * Grade a single question.
 */
export function gradeQuestion(
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
