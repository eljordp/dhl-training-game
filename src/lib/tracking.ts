import { ScenarioResult } from "@/types/game";

export async function saveScenarioAttempt(
  result: ScenarioResult,
  scenarioId: string,
  difficulty: string
): Promise<void> {
  try {
    await fetch("/api/tracking/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, scenarioId, difficulty }),
    });
  } catch {
    // fail silently
  }
}

export async function saveQuizAttempt(
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpent: number,
  questionResults: { questionId: string; category: string; correct: boolean; userAnswer: number }[]
): Promise<void> {
  try {
    await fetch("/api/tracking/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, totalQuestions, correctAnswers, timeSpent, questionResults }),
    });
  } catch {
    // fail silently
  }
}
