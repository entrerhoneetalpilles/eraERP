import { auth } from "./auth"
import { NextResponse } from "next/server"
import { validateUserRole } from "./lib/auth-utils"
import { UserRole } from "@conciergerie/types"

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  // Routes publiques
  const isAuthRoute = pathname.startsWith("/login")
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isPublicRoute = isAuthRoute || isApiAuthRoute

  if (isPublicRoute) return NextResponse.next()

  // Non authentifié → login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // MFA requis mais non vérifié → page MFA
  if (session.user.mfaRequired && !session.user.mfaVerified) {
    if (!pathname.startsWith("/login/mfa")) {
      return NextResponse.redirect(new URL("/login/mfa", nextUrl))
    }
    return NextResponse.next()
  }

  // Vérification RBAC
  const role = session.user.role as UserRole
  if (!validateUserRole(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
}
