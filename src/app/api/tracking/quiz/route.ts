import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prepareQuizAttempt } from "@/lib/prepareQuizAttempt";

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ success: true, saved: false, reason: "unconfigured" });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ success: true, saved: false, reason: "guest" });
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ success: true, saved: false, reason: "guest" });
  }

  try {
    const input = await req.json();
    let payload = input;
    // Legacy multiple-choice attempts keep their existing format.
    // Written assessment IDs always require a complete current rubric attempt.
    if (Array.isArray(input.questionResults) && input.questionResults.some((r: { questionId?: unknown; gradingVersion?: unknown }) =>
      r && (r.gradingVersion || typeof r.questionId === "string" && /^(t[123]-|sc-)/.test(r.questionId)))) {
      try { payload = prepareQuizAttempt(input); }
      catch { return Response.json({ success: false, saved: false, error: "Invalid assessment attempt" }, { status: 400 }); }
    }
    const { score, totalQuestions, correctAnswers, timeSpent, questionResults, difficulty } = payload;

    await pool.query(
      `INSERT INTO quiz_attempts (id, user_id, score, total_questions, correct_answers, time_spent, question_results, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [randomUUID(), session.userId, score, totalQuestions, correctAnswers, timeSpent, JSON.stringify(questionResults), difficulty || "all"]
    );

    return Response.json({ success: true, saved: true });
  } catch (err) {
    console.error("Save quiz attempt error:", err);
    return Response.json({ success: false, saved: false }, { status: 500 });
  }
}
