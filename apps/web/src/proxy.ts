import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// Cheap presence-only check: reading the cookie doesn't touch D1, so it's
// safe to run here. It only proves *a* cookie is set, not that the session
// is still valid — full validation happens server-side in
// src/app/admin/layout.tsx via auth.api.getSession().
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
