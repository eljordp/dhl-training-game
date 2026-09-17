import { assessmentQuestions } from '../data/assessment';
import { gradeAssessment, GRADING_VERSION } from './gradeAssessment';
/** Recompute a concept assessment from its answers before saving a report.
 * The browser's score and correctness flags are never authoritative.
 */
export function prepareQuizAttempt(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid attempt');
  const data = input as Record<string, unknown>;
  const { questionResults, difficulty, timeSpent } = data;
  if (!Array.isArray(questionResults) || questionResults.length < 1 || questionResults.length > 37 ||
      typeof difficulty !== 'string' || typeof timeSpent !== 'number' || !Number.isFinite(timeSpent) || timeSpent < 0 || timeSpent > 604800) throw new Error('Invalid attempt');
  const questions = difficulty === 'all' ? assessmentQuestions : assessmentQuestions.filter(q=>q.tier===difficulty);
  if (!questions.length || questions.length !== questionResults.length) throw new Error('Incomplete attempt');
  const answers: Record<string,string> = {};
  for (const row of questionResults) {
    if (!row || typeof row !== 'object' || typeof row.questionId !== 'string' || typeof row.userAnswer !== 'string' ||
        !row.userAnswer.trim() || row.userAnswer.length > 4000 || row.gradingVersion !== GRADING_VERSION ||
        Object.hasOwn(answers,row.questionId) || !questions.some(q=>q.id===row.questionId)) throw new Error('Invalid answer');
    answers[row.questionId] = row.userAnswer;
  }
  const result = gradeAssessment(questions,answers);
  return {
    score: result.overallScore, totalQuestions: result.totalQuestions, correctAnswers: result.totalCorrect,
    timeSpent: Math.round(timeSpent), difficulty,
    questionResults: result.gradedAnswers.map((a,i)=>({
      questionId: a.questionId, category: a.tier, correct: !a.reviewRequired && a.score >= 70,
      userAnswer: a.userAnswer, score: a.score, reviewRequired: a.reviewRequired,
      gradingVersion: GRADING_VERSION, questionText: questions[i].question, answerKey: questions[i].answerKey,
    })),
  };
}
