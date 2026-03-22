import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return Response.json({ employees: [] });
  }

  // Verify the requester is a manager
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if requester is a manager
    const managerResult = await pool.query(
      "SELECT role FROM profiles WHERE id = $1",
      [session.userId]
    );

    if (managerResult.rows.length === 0 || managerResult.rows[0].role !== "manager") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all employees
    const profilesResult = await pool.query(
      "SELECT id, username, display_name FROM profiles WHERE role = 'employee' ORDER BY display_name"
    );

    // Get all scenario attempts with field results
    const attemptsResult = await pool.query(
      `SELECT sa.id, sa.user_id, sa.scenario_id, sa.npc_name, sa.score, sa.correct_fields, sa.total_fields, sa.time_spent, sa.xp_earned, sa.created_at
       FROM scenario_attempts sa
       ORDER BY sa.created_at DESC`
    );

    const fieldResultsResult = await pool.query(
      `SELECT fr.attempt_id, fr.field, fr.label, fr.user_value, fr.correct_value, fr.is_correct
       FROM field_results fr`
    );

    // Get all quiz attempts
    const quizResult = await pool.query(
      `SELECT id, user_id, score, total_questions, correct_answers, time_spent, created_at
       FROM quiz_attempts
       ORDER BY created_at DESC`
    );

    // Build field results map
    const fieldResultsByAttempt: Record<string, typeof fieldResultsResult.rows> = {};
    for (const fr of fieldResultsResult.rows) {
      if (!fieldResultsByAttempt[fr.attempt_id]) {
        fieldResultsByAttempt[fr.attempt_id] = [];
      }
      fieldResultsByAttempt[fr.attempt_id].push(fr);
    }

    // Build response
    const employees = profilesResult.rows.map((p) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      attempts: attemptsResult.rows
        .filter((a) => a.user_id === p.id)
        .map((a) => ({
          ...a,
          field_results: fieldResultsByAttempt[a.id] || [],
        })),
      quizAttempts: quizResult.rows.filter((q) => q.user_id === p.id),
    }));

    return Response.json({ employees });
  } catch (err) {
    console.error("Dashboard error:", err);
    return Response.json({ employees: [] });
  }
}
