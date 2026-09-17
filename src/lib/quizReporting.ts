export interface StoredQuizScore {
  score: number;
  question_results?: { reviewRequired?: boolean; gradingVersion?: string }[] | null;
}
/** Preserve the awarded partial-credit score; never substitute question-pass rate. */
export function quizScore(attempt: StoredQuizScore): number {
  return Number.isFinite(attempt.score) ? Math.max(0, Math.min(100, Math.round(attempt.score))) : 0;
}
export function quizNeedsReview(attempt: StoredQuizScore): boolean {
  return attempt.question_results?.some(q => q.reviewRequired) ?? false;
}
export function quizMeetsThreshold(attempt: StoredQuizScore): boolean {
  return quizScore(attempt) >= 70 && !quizNeedsReview(attempt);
}
