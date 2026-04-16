import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    (pathname === "/boneyard" && process.env.NODE_ENV === "development")

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
