import { auth } from "./auth"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { validateUserRole } from "./lib/auth-utils"
import { checkRateLimit } from "./lib/rate-limit"
import { UserRole } from "@conciergerie/types"

export default auth(async (req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  // Rate limiting sur les routes auth uniquement
  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    const rateLimitResponse = await checkRateLimit(req as unknown as NextRequest)
    if (rateLimitResponse) return rateLimitResponse
  }

  // Routes publiques
  const isAuthRoute = pathname.startsWith("/login")
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isWebhookRoute = pathname.startsWith("/api/webhooks")
  if (isAuthRoute || isApiAuthRoute || isWebhookRoute) return NextResponse.next()

  // Non authentifié → login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // MFA requis
  if (session.user.mfaRequired && !session.user.mfaVerified) {
    if (!pathname.startsWith("/login/mfa")) {
      return NextResponse.redirect(new URL("/login/mfa", nextUrl))
    }
    return NextResponse.next()
  }

  // RBAC
  const role = session.user.role as UserRole
  if (!validateUserRole(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)" ],
}
