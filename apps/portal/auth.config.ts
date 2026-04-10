import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.ownerId = (user as any).ownerId
        token.mfaRequired = (user as any).mfaRequired
        token.mfaVerified = (user as any).mfaVerified ?? false
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.ownerId = token.ownerId as string
        session.user.mfaRequired = token.mfaRequired as boolean
        session.user.mfaVerified = token.mfaVerified as boolean
      }
      return session
    },
  },
  providers: [],
}
