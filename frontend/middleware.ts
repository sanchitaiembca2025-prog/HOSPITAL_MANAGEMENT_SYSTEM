import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/signup"]

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  CLERK: "/clerk",
  DOCTOR: "/doctor",
  LAB: "/lab",
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow root redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check for token cookie (set by client-side auth store)
  const tokenCookie = request.cookies.get("hms_token")
  const token = tokenCookie?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("reason", "unauthenticated")
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
