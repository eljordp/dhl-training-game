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

  const session = await verifySessionToken(sessionCookie.value);
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
      `SELECT id, user_id, score, total_questions, correct_answers, time_spent, question_results, difficulty, created_at
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

    // Fetch activity heartbeat data (table may not exist yet)
    let activityByUser: Record<string, {
      total_active: number;
      total_idle: number;
      total_away: number;
      total_interactions: number;
      heartbeat_count: number;
      last_heartbeat: string | null;
    }> = {};

    try {
      const activityResult = await pool.query(
        `SELECT
          user_id,
          SUM(active_seconds) as total_active,
          SUM(idle_seconds) as total_idle,
          SUM(away_seconds) as total_away,
          SUM(interactions) as total_interactions,
          COUNT(*) as heartbeat_count,
          MAX(created_at) as last_heartbeat
        FROM activity_heartbeats
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY user_id`
      );

      for (const row of activityResult.rows) {
        activityByUser[row.user_id] = {
          total_active: Number(row.total_active) || 0,
          total_idle: Number(row.total_idle) || 0,
          total_away: Number(row.total_away) || 0,
          total_interactions: Number(row.total_interactions) || 0,
          heartbeat_count: Number(row.heartbeat_count) || 0,
          last_heartbeat: row.last_heartbeat ? String(row.last_heartbeat) : null,
        };
      }
    } catch {
      // activity_heartbeats table may not exist yet — gracefully skip
      activityByUser = {};
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
      activity: activityByUser[p.id] || null,
    }));

    return Response.json({ employees });
  } catch (err) {
    console.error("Dashboard error:", err);
    return Response.json({ employees: [] });
  }
}
