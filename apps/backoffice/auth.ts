import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 30 * 60 },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.actif) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password_hash)
        if (!valid) return null

        await db.user.update({
          where: { id: user.id },
          data: { derniere_connexion: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          role: user.role,
          mfaRequired: user.mfa_active,
          mfaVerified: false,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as any).role
        token.mfaRequired = (user as any).mfaRequired
        token.mfaVerified = (user as any).mfaVerified ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.mfaRequired = token.mfaRequired as boolean
        session.user.mfaVerified = token.mfaVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})

declare module "next-auth" {
  interface User {
    role: string
    mfaRequired: boolean
    mfaVerified: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      mfaRequired: boolean
      mfaVerified: boolean
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    mfaRequired: boolean
    mfaVerified: boolean
  }
}
