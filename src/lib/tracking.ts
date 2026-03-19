import { createClient } from "./supabase";
import { ScenarioResult } from "@/types/game";

export async function saveScenarioAttempt(
  result: ScenarioResult,
  scenarioId: string,
  difficulty: string
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // not logged in, skip silently

  const { data: attempt, error } = await supabase
    .from("scenario_attempts")
    .insert({
      user_id: user.id,
      scenario_id: scenarioId,
      npc_name: result.npcName,
      score: result.score,
      total_fields: result.totalFields,
      correct_fields: result.correctFields,
      time_spent: result.timeSpent,
      xp_earned: result.xpEarned ?? 0,
      bonus_xp: result.bonusXp ?? 0,
      difficulty,
    })
    .select("id")
    .single();

  if (error || !attempt) return;

  // Save field results
  const fieldRows = result.fieldResults.map((fr) => ({
    attempt_id: attempt.id,
    field: fr.field,
    label: fr.label,
    user_value: fr.userValue ?? "",
    correct_value: fr.correctValue,
    is_correct: fr.correct,
  }));

  await supabase.from("field_results").insert(fieldRows);
}

export async function saveQuizAttempt(
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpent: number,
  questionResults: { questionId: string; category: string; correct: boolean; userAnswer: number }[]
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    score,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    time_spent: timeSpent,
    question_results: questionResults,
  });
}
