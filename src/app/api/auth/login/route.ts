import { getPool } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const { username, password } = await req.json();
  if (!username || !password) {
    return Response.json({ error: "Missing username or password" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, display_name, role, password_hash FROM profiles WHERE username = $1",
      [username.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const profile = result.rows[0];
    const valid = await bcrypt.compare(password, profile.password_hash);

    if (!valid) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createSessionToken(profile.id);

    const response = Response.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role,
      },
    });

    // Set session cookie
    response.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
