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
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.ownerId = (user as any).ownerId
        token.mfaRequired = (user as any).mfaRequired
        token.mfaVerified = (user as any).mfaVerified ?? false
      }
      // Handle session.update() calls — used by MFA verification
      if (trigger === "update" && session?.user?.mfaVerified === true) {
        token.mfaVerified = true
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
