const SECRET = process.env.SESSION_SECRET || "dhl-training-fallback-secret";

// Web Crypto compatible HMAC (works in Edge Runtime + Node)
async function hmacSign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

export async function createSessionToken(userId: string): Promise<string> {
  const payload = base64urlEncode(JSON.stringify({ userId, ts: Date.now() }));
  const sig = await hmacSign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;
  const expectedSig = await hmacSign(payload);

  if (sig !== expectedSig) return null;

  try {
    const data = JSON.parse(base64urlDecode(payload));
    if (!data.userId) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "dhl_session";
