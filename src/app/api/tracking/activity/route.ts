import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  const pool = getPool();
  if (!pool) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_heartbeats (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        page VARCHAR(100) NOT NULL,
        active_seconds INTEGER NOT NULL DEFAULT 0,
        idle_seconds INTEGER NOT NULL DEFAULT 0,
        away_seconds INTEGER NOT NULL DEFAULT 0,
        focused BOOLEAN NOT NULL DEFAULT true,
        interactions INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_heartbeats(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_heartbeats(created_at)`);
    tableCreated = true;
  } catch (err) {
    console.error("Auto-migrate activity_heartbeats error:", err);
  }
}

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
    await ensureTable();

    const { page, activeSeconds, idleSeconds, awaySeconds, focused, interactions } = await req.json();

    await pool.query(
      `INSERT INTO activity_heartbeats (id, user_id, page, active_seconds, idle_seconds, away_seconds, focused, interactions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        randomUUID(),
        session.userId,
        String(page || "unknown").slice(0, 100),
        Number(activeSeconds) || 0,
        Number(idleSeconds) || 0,
        Number(awaySeconds) || 0,
        focused !== false,
        Number(interactions) || 0,
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("Save activity heartbeat error:", err);
    return Response.json({ success: true });
  }
}

export async function GET(req: NextRequest) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ error: "No database" }, { status: 500 });
  }

  // Auth: must be a manager
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
    const managerResult = await pool.query(
      "SELECT role FROM profiles WHERE id = $1",
      [session.userId]
    );

    if (managerResult.rows.length === 0 || managerResult.rows[0].role !== "manager") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await ensureTable();

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Summary
    const summaryResult = await pool.query(
      `SELECT
         COALESCE(SUM(active_seconds), 0) as total_active,
         COALESCE(SUM(idle_seconds), 0) as total_idle,
         COALESCE(SUM(away_seconds), 0) as total_away,
         COALESCE(SUM(interactions), 0) as total_interactions,
         COUNT(*) as heartbeat_count,
         MAX(created_at) as last_active
       FROM activity_heartbeats
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, since.toISOString()]
    );

    const s = summaryResult.rows[0];
    const totalActive = parseInt(s.total_active) || 0;
    const totalIdle = parseInt(s.total_idle) || 0;
    const totalAway = parseInt(s.total_away) || 0;
    const totalTime = totalActive + totalIdle + totalAway;
    const engagementRate = totalTime > 0 ? Math.round((totalActive / totalTime) * 100) : 0;

    // Sessions: count distinct 30-minute windows
    const sessionsResult = await pool.query(
      `SELECT COUNT(DISTINCT date_trunc('hour', created_at) + (EXTRACT(minute FROM created_at)::int / 30) * interval '30 min') as sessions
       FROM activity_heartbeats
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, since.toISOString()]
    );

    // Daily breakdown
    const dailyResult = await pool.query(
      `SELECT
         DATE(created_at) as date,
         COALESCE(SUM(active_seconds), 0) as active_seconds,
         COALESCE(SUM(idle_seconds), 0) as idle_seconds,
         COALESCE(SUM(away_seconds), 0) as away_seconds
       FROM activity_heartbeats
       WHERE user_id = $1 AND created_at >= $2
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId, since.toISOString()]
    );

    // By page
    const pageResult = await pool.query(
      `SELECT
         page,
         COALESCE(SUM(active_seconds), 0) as active_seconds,
         COALESCE(SUM(idle_seconds), 0) as idle_seconds
       FROM activity_heartbeats
       WHERE user_id = $1 AND created_at >= $2
       GROUP BY page
       ORDER BY active_seconds DESC`,
      [userId, since.toISOString()]
    );

    return Response.json({
      summary: {
        totalActiveSeconds: totalActive,
        totalIdleSeconds: totalIdle,
        totalAwaySeconds: totalAway,
        totalInteractions: parseInt(s.total_interactions) || 0,
        engagementRate,
        sessionsCount: parseInt(sessionsResult.rows[0]?.sessions) || 0,
        lastActive: s.last_active || null,
      },
      daily: dailyResult.rows.map((r) => ({
        date: r.date,
        activeSeconds: parseInt(r.active_seconds) || 0,
        idleSeconds: parseInt(r.idle_seconds) || 0,
        awaySeconds: parseInt(r.away_seconds) || 0,
      })),
      byPage: pageResult.rows.map((r) => ({
        page: r.page,
        activeSeconds: parseInt(r.active_seconds) || 0,
        idleSeconds: parseInt(r.idle_seconds) || 0,
      })),
    });
  } catch (err) {
    console.error("Activity GET error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
