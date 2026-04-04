import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/"

  if (isPublicRoute) return NextResponse.next()

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (session.user.mfaRequired && !session.user.mfaVerified) {
    if (!pathname.startsWith("/login/mfa")) {
      return NextResponse.redirect(new URL("/login/mfa", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
