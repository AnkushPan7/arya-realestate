import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "arya_token";

/**
 * Next.js 16 Proxy — thin routing layer.
 * NO auth verification here. Only cookie existence checks for redirects.
 * Actual auth validation happens in admin layout.tsx (Server Component).
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from admin
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
