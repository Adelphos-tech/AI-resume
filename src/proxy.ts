import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const CANDIDATE_AUTH_PATHS = new Set([
  "/candidate/login",
  "/candidate/register",
]);

// Optimistic check only: cookie presence is NOT authorization.
// Authoritative session + role validation happens in
// src/app/admin/layout.tsx and requireCandidateSession() on every
// protected render.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }
  const target = pathname.startsWith("/candidate")
    ? CANDIDATE_AUTH_PATHS.has(pathname)
      ? null
      : "/candidate/login"
    : "/login";
  if (!target) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/candidate/:path*"],
};
