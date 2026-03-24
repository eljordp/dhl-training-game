import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ success: true }); // silently succeed when no DB
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ success: true }); // not logged in, skip silently
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ success: true });
  }

  try {
    const { result, scenarioId, difficulty } = await req.json();

    const attemptId = randomUUID();

    await pool.query(
      `INSERT INTO scenario_attempts (id, user_id, scenario_id, npc_name, score, total_fields, correct_fields, time_spent, xp_earned, bonus_xp, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        attemptId,
        session.userId,
        scenarioId,
        result.npcName,
        result.score,
        result.totalFields,
        result.correctFields,
        result.timeSpent,
        result.xpEarned ?? 0,
        result.bonusXp ?? 0,
        difficulty,
      ]
    );

    // Insert field results
    if (result.fieldResults && result.fieldResults.length > 0) {
      const values: unknown[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      for (const fr of result.fieldResults) {
        const fieldId = randomUUID();
        placeholders.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
        );
        values.push(fieldId, attemptId, fr.field, fr.label, fr.userValue ?? "", fr.correctValue, fr.correct);
      }

      await pool.query(
        `INSERT INTO field_results (id, attempt_id, field, label, user_value, correct_value, is_correct) VALUES ${placeholders.join(", ")}`,
        values
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Save scenario attempt error:", err);
    return Response.json({ success: true }); // fail silently
  }
}
