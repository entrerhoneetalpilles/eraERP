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
  session: { strategy: "jwt", maxAge: 60 * 60 }, // 60 min
  providers: [
    Credentials({
      id: "owner-credentials",
      name: "Espace propriétaire",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const ownerUser = await db.ownerUser.findUnique({
          where: { email: parsed.data.email },
          include: { owner: true },
        })

        if (!ownerUser) return null

        const valid = await bcrypt.compare(
          parsed.data.password,
          ownerUser.password_hash
        )
        if (!valid) return null

        await db.ownerUser.update({
          where: { id: ownerUser.id },
          data: { derniere_connexion: new Date() },
        })

        return {
          id: ownerUser.id,
          email: ownerUser.email,
          name: ownerUser.owner?.nom ?? ownerUser.email,
          ownerId: ownerUser.owner_id,
          mfaRequired: ownerUser.mfa_active,
          mfaVerified: false,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.ownerId = (user as any).ownerId
        token.mfaRequired = (user as any).mfaRequired
        token.mfaVerified = (user as any).mfaVerified ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.ownerId = token.ownerId as string
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
    ownerId: string | null
    mfaRequired: boolean
    mfaVerified: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      ownerId: string | null
      mfaRequired: boolean
      mfaVerified: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    ownerId: string | null
    mfaRequired: boolean
    mfaVerified: boolean
  }
}
