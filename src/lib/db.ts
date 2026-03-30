import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!pool) {
    const needsSsl = url.includes("supabase") || url.includes("neon") || url.includes("sslmode");
    if (needsSsl) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    pool = new Pool({
      connectionString: url.replace(/[?&]sslmode=[^&]*/g, ""),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}
