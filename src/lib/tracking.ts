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
  score: number, totalQuestions: number, correctAnswers: number, timeSpent: number,
  questionResults: { questionId: string; category: string; correct: boolean; userAnswer: string | number; score?: number; reviewRequired?: boolean; gradingVersion?: string }[],
  difficulty: string
): Promise<"saved" | "guest" | "error"> {
  try {
    const response = await fetch("/api/tracking/quiz", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, totalQuestions, correctAnswers, timeSpent, questionResults, difficulty }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return "error";
    const result = await response.json();
    return result.saved === true ? "saved" : result.reason === "guest" || result.reason === "unconfigured" ? "guest" : "error";
  } catch { return "error"; }
}
