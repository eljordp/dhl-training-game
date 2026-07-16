import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function middleware(request: NextRequest) {
  // If DATABASE_URL is not configured, skip auth entirely
  if (!process.env.DATABASE_URL) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionToken(sessionCookie.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Training routes are intentionally public; manager reporting stays private.
  matcher: ["/dashboard/:path*"],
};
