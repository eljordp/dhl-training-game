import { getPool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const { username, displayName, password } = await req.json();

  if (!username || !displayName || !password) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();

    // Check if username already exists
    const existing = await pool.query(
      "SELECT id FROM profiles WHERE username = $1",
      [normalizedUsername]
    );

    if (existing.rows.length > 0) {
      return Response.json({ error: "Username already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    await pool.query(
      `INSERT INTO profiles (id, username, password_hash, display_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, normalizedUsername, passwordHash, displayName, "employee"]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("Create employee error:", err);
    return Response.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
