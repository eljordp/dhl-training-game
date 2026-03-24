import { getPool } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return Response.json({ profile: null });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return Response.json({ profile: null });
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    return Response.json({ profile: null });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, display_name, role, created_at FROM profiles WHERE id = $1",
      [session.userId]
    );

    if (result.rows.length === 0) {
      return Response.json({ profile: null });
    }

    return Response.json({ profile: result.rows[0] });
  } catch (err) {
    console.error("Get profile error:", err);
    return Response.json({ profile: null });
  }
}
