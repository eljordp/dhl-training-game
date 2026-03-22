import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return response;
}
