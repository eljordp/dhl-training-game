import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "dhl-training-fallback-secret";

/**
 * Simple signed cookie session.
 * Cookie value = base64(json) + "." + hmac_signature
 */

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;
  const expectedSig = createHmac("sha256", SECRET).update(payload).digest("base64url");

  if (sig !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.userId) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "dhl_session";
