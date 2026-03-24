import { getPool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

/**
 * One-time setup endpoint. Creates the first manager account.
 * Only works if no manager accounts exist yet.
 * POST /api/setup { username, displayName, password }
 */
export async function POST(req: Request) {
  const pool = getPool();
  if (!pool) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Ensure profiles table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(200),
        role VARCHAR(50) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Check if any manager exists
    const existing = await pool.query(
      "SELECT id FROM profiles WHERE role = 'manager' LIMIT 1"
    );

    if (existing.rows.length > 0) {
      return Response.json(
        { error: "Setup already completed. A manager account exists." },
        { status: 403 }
      );
    }

    const { username, displayName, password } = await req.json();

    if (!username || !displayName || !password) {
      return Response.json({ error: "Missing fields: username, displayName, password" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    await pool.query(
      `INSERT INTO profiles (id, username, password_hash, display_name, role, created_at)
       VALUES ($1, $2, $3, $4, 'manager', NOW())`,
      [id, username.toLowerCase().trim(), passwordHash, displayName]
    );

    return Response.json({
      success: true,
      message: `Manager account created: @${username.toLowerCase().trim()}. You can now log in.`,
    });
  } catch (err) {
    console.error("Setup error:", err);
    return Response.json({ error: "Setup failed" }, { status: 500 });
  }
}

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return Response.json({ needsSetup: true, reason: "no_database" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM profiles WHERE role = 'manager' LIMIT 1"
    ).catch(() => null);

    return Response.json({
      needsSetup: !existing || existing.rows.length === 0,
    });
  } catch {
    return Response.json({ needsSetup: true, reason: "db_error" });
  }
}
