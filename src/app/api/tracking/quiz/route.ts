import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ success: true });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ success: true });
  }

  const session = verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ success: true });
  }

  try {
    const { score, totalQuestions, correctAnswers, timeSpent, questionResults } = await req.json();

    await pool.query(
      `INSERT INTO quiz_attempts (id, user_id, score, total_questions, correct_answers, time_spent, question_results)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), session.userId, score, totalQuestions, correctAnswers, timeSpent, JSON.stringify(questionResults)]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("Save quiz attempt error:", err);
    return Response.json({ success: true });
  }
}
