import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

let columnsEnsured = false;

async function ensureColumns() {
  if (columnsEnsured) return;
  const pool = getPool();
  if (!pool) return;

  try {
    await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false`);
    await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP DEFAULT NULL`);
    columnsEnsured = true;
  } catch {
    // columns may already exist
  }
}

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return Response.json({ consent_given: false });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ consent_given: false });
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ consent_given: false });
  }

  try {
    await ensureColumns();

    const result = await pool.query(
      "SELECT consent_given, consent_date FROM profiles WHERE id = $1",
      [session.userId]
    );

    if (result.rows.length === 0) {
      return Response.json({ consent_given: false });
    }

    return Response.json({
      consent_given: result.rows[0].consent_given || false,
      consent_date: result.rows[0].consent_date || null,
    });
  } catch (err) {
    console.error("Get consent error:", err);
    return Response.json({ consent_given: false });
  }
}

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ success: false, error: "No database" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureColumns();

    const { consent } = await req.json();
    const consentGiven = consent === true;

    await pool.query(
      `UPDATE profiles SET consent_given = $1, consent_date = $2 WHERE id = $3`,
      [consentGiven, consentGiven ? new Date().toISOString() : null, session.userId]
    );

    return Response.json({ success: true, consent_given: consentGiven });
  } catch (err) {
    console.error("Save consent error:", err);
    return Response.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
