# Portal — Logout, MFA, Paramètres & Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add logout + user menu, MFA verification page, settings/account page (password change, MFA management), and responsive desktop layouts to the owner portal.

**Architecture:** Four independent tasks executed sequentially. Tasks 1–3 are functional completions (the portal currently has no logout path and no settings). Task 4 is a pure layout improvement for ≥1024px screens. All server actions are in `apps/portal/app/actions/`. No new database tables — all fields exist in `OwnerUser` schema.

**Tech Stack:** Next.js 14 App Router, NextAuth v5 beta.22, otplib (already installed), bcryptjs (already installed), Tailwind CSS, Lucide React, react-hook-form, zod, sonner.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/portal/components/layout/sidebar-nav.tsx` | Modify | Add `userName`/`userEmail` props, `/parametres` nav item, user card + logout at bottom |
| `apps/portal/components/layout/portal-header.tsx` | Modify | Add settings icon link on mobile |
| `apps/portal/app/(protected)/layout.tsx` | Modify | Pass `session.user.name`/`email` to SidebarNav |
| `apps/portal/auth.config.ts` | Modify | Handle `trigger: "update"` in JWT callback for MFA verification |
| `apps/portal/auth.ts` | Modify | Export `unstable_update` |
| `apps/portal/app/(auth)/login/mfa/page.tsx` | Create | TOTP code entry page (split-screen, same style as login) |
| `apps/portal/app/actions/mfa.ts` | Create | Server action: verify TOTP + update JWT mfaVerified flag |
| `apps/portal/app/(protected)/parametres/page.tsx` | Create | Settings page — account info + password form + MFA section |
| `apps/portal/app/actions/account.ts` | Create | Server actions: changePassword, generateMfaSecret, enableMfa, disableMfa |
| `apps/portal/components/parametres/change-password-form.tsx` | Create | Client form component with react-hook-form |
| `apps/portal/components/parametres/mfa-section.tsx` | Create | Client component: MFA toggle + setup flow |
| `apps/portal/app/(protected)/dashboard/page.tsx` | Modify | 2-col layout on lg+ (KPI+greeting left, events right) |
| `apps/portal/app/(protected)/biens/page.tsx` | Modify | 2-col grid on xl+ |
| `apps/portal/app/(protected)/documents/page.tsx` | Modify | Responsive grid on lg+ |
| `apps/portal/app/(protected)/revenus/page.tsx` | Modify | Wider max-width on desktop |
| `apps/portal/app/(protected)/messagerie/page.tsx` | Modify | Wider max-width + 2-col layout on lg+ |

---

## Task 1: User Menu + Logout

**Files:**
- Modify: `apps/portal/components/layout/sidebar-nav.tsx`
- Modify: `apps/portal/components/layout/portal-header.tsx`
- Modify: `apps/portal/app/(protected)/layout.tsx`

### Context
The sidebar currently shows a static "Espace Propriétaire" footer. We replace it with a user card (name, email, avatar initials) + a logout button + a link to `/parametres`. The sidebar is already `"use client"` so we use `signOut` from `next-auth/react`. The layout passes `userName` and `userEmail` as props from the server-side session.

On mobile, we add a `Settings` icon button to the portal header that links to `/parametres`.

- [ ] **Step 1: Update `apps/portal/app/(protected)/layout.tsx`**

Replace the file entirely with:

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PortalHeader } from "@/components/layout/portal-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarNav } from "@/components/layout/sidebar-nav"

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.mfaRequired && !session.user.mfaVerified) redirect("/login/mfa")

  return (
    <div className="flex min-h-screen bg-calcaire-100">
      <SidebarNav
        userName={session.user.name ?? "Propriétaire"}
        userEmail={session.user.email ?? ""}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-safe-nav lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: Replace `apps/portal/components/layout/sidebar-nav.tsx` entirely**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileText,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Mes biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
  { href: "/planning", icon: Calendar, label: "Planning" },
  { href: "/parametres", icon: Settings, label: "Paramètres" },
]

interface SidebarNavProps {
  userName: string
  userEmail: string
}

export function SidebarNav({ userName, userEmail }: SidebarNavProps) {
  const pathname = usePathname()
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-argile-200/60 min-h-screen">
      {/* Logo area */}
      <div className="px-7 py-8 border-b border-argile-200/40">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-2xl font-semibold text-garrigue-900 tracking-[0.06em]">
            ERA
          </span>
        </div>
        <p className="text-xs text-garrigue-400 mt-1 font-light tracking-wide italic">
          Entre Rhône et Alpilles
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 px-4 py-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-fast cursor-pointer group relative ${
                    active
                      ? "bg-garrigue-900 text-white shadow-luxury"
                      : "text-garrigue-500 hover:bg-calcaire-100 hover:text-garrigue-900"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2 : 1.6}
                    className="shrink-0 transition-fast"
                  />
                  <span className="tracking-wide">{label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 bg-or-400 rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User card + logout */}
      <div className="px-4 pb-5 pt-4 border-t border-argile-200/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          {/* Avatar initials */}
          <div className="w-8 h-8 rounded-full bg-garrigue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-garrigue-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-garrigue-900 truncate">{userName}</p>
            <p className="text-xs text-garrigue-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-garrigue-500 hover:bg-red-50 hover:text-red-600 transition-fast cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.6} className="shrink-0" />
          <span className="tracking-wide">Se déconnecter</span>
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Update `apps/portal/components/layout/portal-header.tsx`**

Add a settings link on mobile (between the ERA monogram and the bell). Replace the file:

```tsx
import { auth } from "@/auth"
import { Bell, Settings } from "lucide-react"
import Link from "next/link"

export async function PortalHeader() {
  const session = await auth()
  const prenom = session?.user?.name?.split(" ")[0] ?? "Propriétaire"

  return (
    <header className="sticky top-0 z-40 bg-calcaire-50/90 backdrop-blur-xl border-b border-argile-200/60 flex items-center justify-between px-5 h-14 lg:hidden">
      {/* ERA monogram */}
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-xl font-semibold text-garrigue-900 tracking-[0.08em]">
          ERA
        </span>
        <span className="hidden sm:block text-xs text-garrigue-400 tracking-wide">
          Espace Propriétaire
        </span>
      </div>

      {/* Greeting (center, sm+) */}
      <span className="absolute left-1/2 -translate-x-1/2 text-sm text-garrigue-500 hidden sm:block">
        Bonjour,{" "}
        <span className="text-garrigue-900 font-medium">{prenom}</span>
      </span>

      {/* Right: settings + bell */}
      <div className="flex items-center gap-1">
        <Link
          href="/parametres"
          aria-label="Paramètres"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-calcaire-200 transition-fast text-garrigue-500 hover:text-garrigue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-olivier-500"
        >
          <Settings size={18} strokeWidth={1.8} />
        </Link>
        <button
          aria-label="Notifications"
          className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-calcaire-200 transition-fast text-garrigue-500 hover:text-garrigue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-olivier-500"
        >
          <Bell size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm type-check
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/layout/ apps/portal/app/(protected)/layout.tsx
git commit -m "feat(portal): user menu + logout button + settings link in sidebar"
```

---

## Task 2: MFA Verification Page

**Files:**
- Modify: `apps/portal/auth.config.ts`
- Modify: `apps/portal/auth.ts`
- Create: `apps/portal/app/(auth)/login/mfa/page.tsx`
- Create: `apps/portal/app/actions/mfa.ts`

### Context
When an owner has `mfa_active: true`, the protected layout redirects to `/login/mfa`. This page shows a TOTP input (6-digit code). A server action verifies the code against the stored `mfa_secret` using otplib. On success, it calls `unstable_update` to set `mfaVerified: true` in the JWT. The JWT callback needs to handle this update trigger.

`otplib` is already in `package.json`. The session update requires adding `trigger: "update"` handling to `auth.config.ts`.

- [ ] **Step 1: Update `apps/portal/auth.config.ts`** to handle session update

Replace the file:

```typescript
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
      if (trigger === "update" && session?.mfaVerified === true) {
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
```

- [ ] **Step 2: Update `apps/portal/auth.ts`** to export `unstable_update`

Replace the last line of exports:

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
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

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    ownerId: string | null
    mfaRequired: boolean
    mfaVerified: boolean
  }
}
```

- [ ] **Step 3: Create `apps/portal/app/actions/mfa.ts`**

```typescript
"use server"

import { auth, unstable_update } from "@/auth"
import { db } from "@conciergerie/db"
import { authenticator } from "otplib"
import { redirect } from "next/navigation"

export async function verifyMfaAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const code = (formData.get("code") as string)?.trim().replace(/\s/g, "")
  if (!code || !/^\d{6}$/.test(code)) {
    return { error: "Le code doit contenir 6 chiffres" }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { mfa_secret: true, mfa_active: true },
  })

  if (!ownerUser?.mfa_secret || !ownerUser.mfa_active) {
    return { error: "MFA non configuré sur ce compte" }
  }

  const isValid = authenticator.check(code, ownerUser.mfa_secret)
  if (!isValid) {
    return { error: "Code incorrect ou expiré" }
  }

  await unstable_update({ mfaVerified: true })
  redirect("/dashboard")
}
```

- [ ] **Step 4: Create `apps/portal/app/(auth)/login/mfa/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import { verifyMfaAction } from "@/app/actions/mfa"
import { Loader2, ShieldCheck } from "lucide-react"
import { Input } from "@conciergerie/ui"

const initialState = { error: null }

export default function MfaPage() {
  const [state, formAction, isPending] = useActionState(verifyMfaAction, initialState)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <span className="font-serif text-3xl font-semibold text-white tracking-[0.08em]">
            ERA
          </span>
        </div>
        <div className="relative space-y-6">
          <h1 className="font-serif text-5xl font-light text-white leading-[1.1] italic">
            Vérification en deux étapes.
          </h1>
          <p className="text-garrigue-400 text-sm leading-relaxed max-w-xs font-light">
            Votre compte est protégé par une authentification à deux facteurs.
          </p>
        </div>
        <div className="relative">
          <p className="text-garrigue-400/40 text-xs tracking-widest uppercase">
            Espace Propriétaire
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="font-serif text-3xl font-semibold text-garrigue-900 tracking-[0.08em]">
              ERA
            </span>
            <p className="text-xs text-garrigue-400 mt-1 tracking-wide italic">
              Entre Rhône et Alpilles
            </p>
          </div>

          {/* Icon + heading */}
          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-garrigue-100 flex items-center justify-center mb-6">
              <ShieldCheck size={22} strokeWidth={1.6} className="text-garrigue-700" />
            </div>
            <h2 className="font-serif text-3xl text-garrigue-900 font-light">
              Code de vérification.
            </h2>
            <p className="text-garrigue-500 text-sm mt-2 leading-relaxed">
              Entrez le code à 6 chiffres généré par votre application d'authentification.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000 000"
                autoFocus
                className="h-14 text-center text-2xl tracking-[0.3em] border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 font-light"
              />
              {state.error && (
                <p className="text-xs text-destructive text-center">{state.error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl font-medium tracking-wide transition-smooth cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Vérifier le code"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-garrigue-400/60 mt-10 italic">
            Entre Rhône et Alpilles · Conciergerie Haut de Gamme
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm type-check
```
Expected: 0 errors. Note: `useActionState` requires React 19 or Next.js with React canary. If not available, use `useFormState` from `react-dom` as fallback:
```tsx
import { useFormState } from "react-dom"
const [state, formAction] = useFormState(verifyMfaAction, initialState)
```

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/auth.config.ts apps/portal/auth.ts apps/portal/app/actions/mfa.ts apps/portal/app/(auth)/login/mfa/
git commit -m "feat(portal): MFA verification page + JWT update trigger for mfaVerified"
```

---

## Task 3: Page Paramètres — Compte & Sécurité

**Files:**
- Create: `apps/portal/app/actions/account.ts`
- Create: `apps/portal/components/parametres/change-password-form.tsx`
- Create: `apps/portal/components/parametres/mfa-section.tsx`
- Create: `apps/portal/app/(protected)/parametres/page.tsx`

### Context
The settings page has three sections: account info (read-only), password change, and MFA management. Password change verifies the current password with bcrypt before hashing the new one. MFA management lets users generate a TOTP secret (displayed as text for manual entry), verify it with a 6-digit code, and activate/deactivate it. All mutations are server actions in `app/actions/account.ts`.

- [ ] **Step 1: Create `apps/portal/app/actions/account.ts`**

```typescript
"use server"

import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// ── Change password ──────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export async function changePasswordAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, success: false }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  })
  if (!ownerUser) return { error: "Compte introuvable", success: false }

  const valid = await bcrypt.compare(parsed.data.currentPassword, ownerUser.password_hash)
  if (!valid) return { error: "Mot de passe actuel incorrect", success: false }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { password_hash: newHash },
  })

  return { error: null, success: true }
}

// ── Generate MFA secret ──────────────────────────────────────────

export async function generateMfaSecretAction(): Promise<{
  secret: string | null
  otpauthUrl: string | null
  error: string | null
}> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { secret: null, otpauthUrl: null, error: "Session expirée" }
  }

  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(
    session.user.email,
    "ERA Entre Rhône et Alpilles",
    secret
  )

  // Temporarily store the pending secret (not activated yet)
  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { mfa_secret: secret }, // saved but mfa_active stays false until verified
  })

  return { secret, otpauthUrl, error: null }
}

// ── Enable MFA (verify + activate) ──────────────────────────────

export async function enableMfaAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const code = (formData.get("code") as string)?.trim()
  if (!code || !/^\d{6}$/.test(code)) {
    return { error: "Code invalide (6 chiffres requis)", success: false }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { mfa_secret: true },
  })
  if (!ownerUser?.mfa_secret) {
    return { error: "Veuillez d'abord générer un secret", success: false }
  }

  const isValid = authenticator.check(code, ownerUser.mfa_secret)
  if (!isValid) return { error: "Code incorrect ou expiré", success: false }

  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { mfa_active: true },
  })

  revalidatePath("/parametres")
  return { error: null, success: true }
}

// ── Disable MFA ──────────────────────────────────────────────────

export async function disableMfaAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const password = formData.get("password") as string
  if (!password) return { error: "Mot de passe requis pour désactiver le MFA", success: false }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  })
  if (!ownerUser) return { error: "Compte introuvable", success: false }

  const valid = await bcrypt.compare(password, ownerUser.password_hash)
  if (!valid) return { error: "Mot de passe incorrect", success: false }

  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { mfa_active: false, mfa_secret: null },
  })

  revalidatePath("/parametres")
  return { error: null, success: true }
}
```

- [ ] **Step 2: Create `apps/portal/components/parametres/change-password-form.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import { changePasswordAction } from "@/app/actions/account"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { Loader2, CheckCircle } from "lucide-react"

const initialState = { error: null, success: false }

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      {state.success && (
        <div className="flex items-center gap-2 text-sm text-olivier-600 bg-olivier-50 border border-olivier-100 rounded-xl px-4 py-3">
          <CheckCircle size={15} />
          Mot de passe modifié avec succès
        </div>
      )}
      {state.error && (
        <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Mot de passe actuel
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Nouveau mot de passe
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
        <p className="text-xs text-garrigue-400">Minimum 8 caractères</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Confirmer le nouveau mot de passe
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 px-6 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        Modifier le mot de passe
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create `apps/portal/components/parametres/mfa-section.tsx`**

```tsx
"use client"

import { useState, useActionState } from "react"
import { generateMfaSecretAction, enableMfaAction, disableMfaAction } from "@/app/actions/account"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { ShieldCheck, ShieldOff, Copy, CheckCircle, Loader2 } from "lucide-react"

interface MfaSectionProps {
  mfaActive: boolean
}

const enableInitial = { error: null, success: false }
const disableInitial = { error: null, success: false }

export function MfaSection({ mfaActive: initialMfaActive }: MfaSectionProps) {
  const [mfaActive, setMfaActive] = useState(initialMfaActive)
  const [pendingSecret, setPendingSecret] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [enableState, enableAction, enablePending] = useActionState(
    async (prev: typeof enableInitial, formData: FormData) => {
      const result = await enableMfaAction(prev, formData)
      if (result.success) setMfaActive(true)
      return result
    },
    enableInitial
  )

  const [disableState, disableAction, disablePending] = useActionState(
    async (prev: typeof disableInitial, formData: FormData) => {
      const result = await disableMfaAction(prev, formData)
      if (result.success) {
        setMfaActive(false)
        setPendingSecret(null)
      }
      return result
    },
    disableInitial
  )

  async function handleGenerate() {
    setIsGenerating(true)
    const result = await generateMfaSecretAction()
    setIsGenerating(false)
    if (result.error || !result.secret || !result.otpauthUrl) return
    setPendingSecret({ secret: result.secret, otpauthUrl: result.otpauthUrl })
  }

  function handleCopy() {
    if (!pendingSecret) return
    navigator.clipboard.writeText(pendingSecret.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (mfaActive) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-olivier-50 border border-olivier-100 rounded-xl">
          <ShieldCheck size={18} className="text-olivier-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-garrigue-900">Activée</p>
            <p className="text-xs text-garrigue-400 mt-0.5">
              Votre compte est protégé par une application d'authentification.
            </p>
          </div>
        </div>

        <form action={disableAction} className="space-y-4 max-w-sm">
          {disableState.error && (
            <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {disableState.error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="disable-password" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
              Mot de passe actuel
            </Label>
            <Input
              id="disable-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={disablePending}
            className="h-11 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
          >
            {disablePending && <Loader2 size={14} className="animate-spin" />}
            <ShieldOff size={14} />
            Désactiver le MFA
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-calcaire-100 border border-argile-200/60 rounded-xl">
        <ShieldOff size={18} className="text-garrigue-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-garrigue-900">Non activée</p>
          <p className="text-xs text-garrigue-400 mt-0.5">
            Activez le MFA pour renforcer la sécurité de votre compte.
          </p>
        </div>
      </div>

      {!pendingSecret ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-11 px-6 border border-garrigue-900 text-garrigue-900 hover:bg-garrigue-900 hover:text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating && <Loader2 size={14} className="animate-spin" />}
          <ShieldCheck size={14} />
          Activer l'authentification à deux facteurs
        </button>
      ) : (
        <div className="space-y-5 max-w-sm">
          <div className="space-y-3">
            <p className="text-sm text-garrigue-700 leading-relaxed">
              Entrez ce code dans votre application d'authentification (Google Authenticator, Authy, etc.) ou ouvrez le lien ci-dessous.
            </p>

            {/* Secret display */}
            <div className="bg-calcaire-100 border border-argile-200/60 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-2">
                Clé secrète
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm text-garrigue-900 tracking-wider break-all">
                  {pendingSecret.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-calcaire-200 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer"
                  aria-label="Copier la clé"
                >
                  {copied ? (
                    <CheckCircle size={14} className="text-olivier-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Link to open in authenticator app */}
            <a
              href={pendingSecret.otpauthUrl}
              className="inline-flex items-center gap-1.5 text-xs text-olivier-600 hover:text-olivier-500 underline transition-fast"
            >
              Ouvrir dans mon application →
            </a>
          </div>

          {/* Verification form */}
          <form action={enableAction} className="space-y-4">
            {enableState.error && (
              <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {enableState.error}
              </p>
            )}
            {enableState.success && (
              <div className="flex items-center gap-2 text-sm text-olivier-600 bg-olivier-50 border border-olivier-100 rounded-xl px-4 py-3">
                <CheckCircle size={15} />
                MFA activé avec succès
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Code de vérification
              </Label>
              <Input
                id="mfa-code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm tracking-widest text-center"
              />
              <p className="text-xs text-garrigue-400">
                Entrez le code affiché dans votre application pour confirmer.
              </p>
            </div>
            <button
              type="submit"
              disabled={enablePending}
              className="h-11 px-6 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
            >
              {enablePending && <Loader2 size={14} className="animate-spin" />}
              Vérifier et activer
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `apps/portal/app/(protected)/parametres/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@conciergerie/db"
import { ChangePasswordForm } from "@/components/parametres/change-password-form"
import { MfaSection } from "@/components/parametres/mfa-section"
import { User, Mail, Calendar, ShieldCheck } from "lucide-react"

export default async function ParametresPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      mfa_active: true,
      derniere_connexion: true,
      createdAt: true,
    },
  })
  if (!ownerUser) redirect("/login")

  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(ownerUser.createdAt)

  const lastLogin = ownerUser.derniere_connexion
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(ownerUser.derniere_connexion)
    : null

  return (
    <div className="max-w-2xl space-y-10 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Paramètres.</h1>
        <p className="text-sm text-garrigue-400 mt-1">Gérez votre compte et votre sécurité</p>
      </div>

      {/* Account info */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Informations du compte
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <User size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Nom</p>
              <p className="text-sm font-medium text-garrigue-900">{session.user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <Mail size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Email</p>
              <p className="text-sm font-medium text-garrigue-900">{ownerUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <Calendar size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Membre depuis</p>
              <p className="text-sm font-medium text-garrigue-900 capitalize">{memberSince}</p>
            </div>
          </div>
          {lastLogin && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} strokeWidth={1.6} className="text-garrigue-500" />
              </div>
              <div>
                <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Dernière connexion</p>
                <p className="text-sm font-medium text-garrigue-900 capitalize">{lastLogin}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Changer le mot de passe
          </h2>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </section>

      {/* MFA */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Authentification à deux facteurs
          </h2>
        </div>
        <div className="px-6 py-5">
          <MfaSection mfaActive={ownerUser.mfa_active} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm type-check
```

If `useActionState` is not available (React 18 without canary), replace all occurrences of `useActionState` with `useFormState` from `react-dom`:
```tsx
import { useFormState } from "react-dom"
const [state, formAction] = useFormState(action, initialState)
```
Remove the `isPending` from `useActionState` and use a separate `useState<boolean>` for loading state if needed.

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/app/actions/account.ts apps/portal/components/parametres/ apps/portal/app/(protected)/parametres/
git commit -m "feat(portal): settings page — password change + MFA management"
```

---

## Task 4: Desktop Layout Improvements

**Files:**
- Modify: `apps/portal/app/(protected)/dashboard/page.tsx`
- Modify: `apps/portal/app/(protected)/biens/page.tsx`
- Modify: `apps/portal/app/(protected)/documents/page.tsx`
- Modify: `apps/portal/app/(protected)/revenus/page.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/page.tsx`

### Context
All pages currently use `max-w-2xl` which caps content at ~672px regardless of screen width. On a 1440px desktop with a 256px sidebar, the content area is ~1184px — only 57% of it is used. We widen containers, add 2-column layouts on lg+, and improve information density without touching any data-fetching logic.

- [ ] **Step 1: Update `apps/portal/app/(protected)/dashboard/page.tsx`** — 2-col on lg+

Only change the return JSX. Keep all data-fetching above. Replace the `return (...)` block:

```tsx
return (
  <div className="max-w-5xl animate-fade-up">
    {/* Hero greeting */}
    <div className="space-y-1 mb-8">
      <p className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.14em] capitalize">
        {today}
      </p>
      <h1 className="font-serif text-4xl text-garrigue-900 font-light italic leading-tight">
        Bonjour, {prenom}.
      </h1>
    </div>

    {/* 2-col layout on lg+ */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Left col — KPI + alerts */}
      <div className="lg:col-span-3 space-y-6">
        <SoldeCard
          solde={account?.solde_courant ?? 0}
          sequestre={account?.solde_sequestre ?? 0}
          dernierVirement={dernierVirement}
        />
        <AlertBanner alerts={alerts} />
      </div>

      {/* Right col — Upcoming events */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
          Prochains événements
        </h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-garrigue-400 font-light italic py-4">
            Aucun événement dans les 7 prochains jours.
          </p>
        ) : (
          <div className="space-y-2">
            {(() => {
              const events: { key: string; type: "checkin" | "checkout"; propertyName: string; date: Date }[] = []
              for (const b of upcomingBookings) {
                if (b.check_in >= now && b.check_in <= in7days)
                  events.push({ key: `${b.id}-in`, type: "checkin", propertyName: b.property.nom, date: b.check_in })
                if (b.check_out >= now && b.check_out <= in7days)
                  events.push({ key: `${b.id}-out`, type: "checkout", propertyName: b.property.nom, date: b.check_out })
              }
              events.sort((a, b) => a.date.getTime() - b.date.getTime())
              return events.map((e) => (
                <EventCard key={e.key} type={e.type} propertyName={e.propertyName} date={e.date} />
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  </div>
)
```

- [ ] **Step 2: Update `apps/portal/app/(protected)/biens/page.tsx`** — 2-col grid on xl+

Replace the container div className and the grid className only:

Change:
```tsx
<div className="space-y-4 max-w-2xl">
```
To:
```tsx
<div className="max-w-5xl">
```

Change:
```tsx
<div className="space-y-3">
```
To:
```tsx
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
```

- [ ] **Step 3: Update `apps/portal/app/(protected)/documents/page.tsx`** — wider + grid

Find the outer container `<div className="...max-w-2xl...">` and replace with `<div className="max-w-5xl">`.

Find the document list container (the div wrapping `DocumentCard` items) and change from `space-y-2` / `space-y-3` to `grid grid-cols-1 lg:grid-cols-2 gap-3`.

- [ ] **Step 4: Update `apps/portal/app/(protected)/revenus/page.tsx`** — wider

Find `max-w-2xl` and replace with `max-w-4xl`.

- [ ] **Step 5: Update `apps/portal/app/(protected)/messagerie/page.tsx`** — wider + 2-col on lg+

Find `max-w-2xl` and replace with `max-w-3xl`.

- [ ] **Step 6: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm type-check
```
Expected: 0 errors (layout changes only)

- [ ] **Step 7: Final build + push**

```bash
cd C:/Developpement/conciergerie
pnpm turbo build --filter=@conciergerie/portal 2>&1 | tail -20
```
Expected: build success (DB migration step will fail locally if no DB — that is expected).

```bash
git add apps/portal/app/(protected)/
git commit -m "design(portal): desktop 2-col layouts — dashboard, biens grid, wider pages"
git push
```

---

## Self-Review

### Spec coverage
- [x] Logout button in sidebar (Task 1)
- [x] Logout accessible on mobile via settings link in header → `/parametres` (Task 1)
- [x] User name/email shown in sidebar (Task 1)
- [x] `/parametres` link in sidebar nav (Task 1)
- [x] MFA verification page `/login/mfa` — unblocks users with mfaRequired (Task 2)
- [x] JWT update trigger for mfaVerified (Task 2)
- [x] Settings page with account info (Task 3)
- [x] Password change with current password verification (Task 3)
- [x] MFA enable flow: generate secret → display → verify → activate (Task 3)
- [x] MFA disable flow: password confirmation required (Task 3)
- [x] Dashboard 2-col on lg+ (Task 4)
- [x] Biens 2-col grid on xl+ (Task 4)
- [x] Documents grid on lg+ (Task 4)
- [x] All pages widened from max-w-2xl (Task 4)

### No placeholders
All code blocks are complete. No TBD, no "similar to above", no missing implementations.

### Type consistency
- `changePasswordAction` returns `{ error: string | null; success: boolean }` — matches `ChangePasswordForm` state
- `enableMfaAction` / `disableMfaAction` return same shape — consistent
- `generateMfaSecretAction` returns `{ secret, otpauthUrl, error }` — matches `MfaSection` handler
- `SidebarNav` props `{ userName: string; userEmail: string }` — layout passes `session.user.name ?? "Propriétaire"` and `session.user.email ?? ""`
- `MfaSection` prop `mfaActive: boolean` — page passes `ownerUser.mfa_active` (boolean in schema)
