# Portal & Backoffice Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all missing features identified in the full-codebase audit: unread nav badge, new message thread, portal devis validation, attestation fiscale PDF + cron, mandat renewal cron, and backoffice upload owner-linking.

**Architecture:** Portal features are pure Next.js App Router server components + server actions. Backoffice additions follow the existing cron + PDF route patterns. No new DB migrations needed — all features use existing schema fields.

**Tech Stack:** Next.js 15 App Router, Prisma, @react-pdf/renderer v4, `@conciergerie/email`, `@conciergerie/storage`, Framer Motion (portal dialogs)

---

## File Map

| File | Action |
|---|---|
| `apps/portal/lib/dal/messagerie.ts` | Modify — add `getOwnerUnreadCount`, `createOwnerThread` |
| `apps/portal/app/(protected)/layout.tsx` | Modify — fetch + pass `unreadCount` |
| `apps/portal/components/layout/sidebar-nav.tsx` | Modify — add unreadCount badge |
| `apps/portal/components/layout/bottom-nav.tsx` | Modify — add unreadCount badge |
| `apps/portal/app/(protected)/messagerie/actions.ts` | Modify — add `createThreadAction` |
| `apps/portal/components/messagerie/new-thread-dialog.tsx` | Create |
| `apps/portal/components/messagerie/new-thread-button.tsx` | Create |
| `apps/portal/app/(protected)/messagerie/page.tsx` | Modify — add NewThreadButton |
| `apps/portal/lib/dal/travaux.ts` | Create — `getPendingDevisForOwner`, `getWorkOrderForOwner` |
| `apps/portal/app/(protected)/devis/actions.ts` | Create — `validateDevisAction`, `refuseDevisAction` |
| `apps/portal/app/(protected)/devis/page.tsx` | Create — list of pending devis |
| `apps/portal/app/(protected)/devis/[id]/page.tsx` | Create — devis detail + validate/refuse |
| `apps/portal/components/layout/sidebar-nav.tsx` | Modify — add Devis nav item with pending badge |
| `apps/backoffice/lib/pdf/attestation-template.tsx` | Create — React PDF template |
| `apps/backoffice/app/api/pdf/attestation/[ownerId]/route.ts` | Create — stream PDF |
| `apps/backoffice/app/(protected)/proprietaires/[id]/page.tsx` | Modify — add generate attestation button |
| `apps/backoffice/app/api/cron/attestation-fiscale/route.ts` | Create — annual cron |
| `apps/backoffice/app/api/cron/mandat-renewal/route.ts` | Create — J-90/J-30 alert cron |
| `apps/backoffice/app/(protected)/documents/upload-dialog.tsx` | Modify — add owner selector |
| `apps/backoffice/app/(protected)/documents/actions.ts` | Modify — add `listOwnersForSelectAction` |
| `apps/backoffice/vercel.json` | Modify — add 2 new crons |
| `packages/email/src/templates/attestation-fiscale.tsx` | Create — email template |
| `packages/email/src/templates/mandat-renewal.tsx` | Create — email template |
| `packages/email/src/render.ts` | Modify — export 2 new send functions |
| `packages/email/src/index.ts` | Modify — export 2 new templates + functions |

---

## Task 1: Unread Messages Badge in Navigation

**Files:**
- Modify: `apps/portal/lib/dal/messagerie.ts`
- Modify: `apps/portal/app/(protected)/layout.tsx`
- Modify: `apps/portal/components/layout/sidebar-nav.tsx`
- Modify: `apps/portal/components/layout/bottom-nav.tsx`

- [ ] **Step 1: Add `getOwnerUnreadCount` to `apps/portal/lib/dal/messagerie.ts`**

Append to the existing file (after `sendOwnerMessage`):

```typescript
export async function getOwnerUnreadCount(ownerId: string): Promise<number> {
  return db.message.count({
    where: {
      thread: { owner_id: ownerId },
      author_type: "USER",
      lu_at: null,
    },
  })
}
```

- [ ] **Step 2: Replace `apps/portal/app/(protected)/layout.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PortalHeader } from "@/components/layout/portal-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { getOwnerUnreadCount } from "@/lib/dal/messagerie"

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.mfaRequired && !session.user.mfaVerified) redirect("/login/mfa")

  const unreadCount = session.user.ownerId
    ? await getOwnerUnreadCount(session.user.ownerId)
    : 0

  return (
    <div className="flex min-h-screen bg-calcaire-100">
      <SidebarNav
        userName={session.user.name ?? "Propriétaire"}
        userEmail={session.user.email ?? ""}
        unreadCount={unreadCount}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-safe-nav lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
```

- [ ] **Step 3: Replace `apps/portal/components/layout/sidebar-nav.tsx`**

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
  ClipboardList,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Mes biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages", badgeKey: "unread" },
  { href: "/devis", icon: ClipboardList, label: "Devis", badgeKey: "devis" },
  { href: "/planning", icon: Calendar, label: "Planning" },
  { href: "/parametres", icon: Settings, label: "Paramètres" },
]

interface SidebarNavProps {
  userName: string
  userEmail: string
  unreadCount: number
  pendingDevisCount?: number
}

export function SidebarNav({ userName, userEmail, unreadCount, pendingDevisCount = 0 }: SidebarNavProps) {
  const pathname = usePathname()
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

  const badges: Record<string, number> = {
    unread: unreadCount,
    devis: pendingDevisCount,
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-argile-200/60 min-h-screen">
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

      <nav aria-label="Navigation principale" className="flex-1 px-4 py-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label, badgeKey }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0
            const showBadge = badgeCount > 0
            // Hide devis nav item if no pending devis
            if (href === "/devis" && pendingDevisCount === 0) return null
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-fast cursor-pointer group relative ${
                    active
                      ? "bg-garrigue-900 text-white shadow-luxury"
                      : "text-garrigue-500 hover:bg-calcaire-100 hover:text-garrigue-900"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2 : 1.6} className="shrink-0 transition-fast" />
                  <span className="tracking-wide flex-1">{label}</span>
                  {showBadge ? (
                    <span className="ml-auto text-[10px] font-bold text-white bg-or-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 tabular-nums">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  ) : active ? (
                    <span className="ml-auto w-1.5 h-1.5 bg-or-400 rounded-full" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 pb-5 pt-4 border-t border-argile-200/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-garrigue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-garrigue-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-garrigue-900 truncate">{userName}</p>
            <p className="text-xs text-garrigue-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
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

- [ ] **Step 4: Replace `apps/portal/components/layout/bottom-nav.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, TrendingUp, Calendar, MessageCircle } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/planning", icon: Calendar, label: "Planning" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
]

interface BottomNavProps {
  unreadCount: number
}

export function BottomNav({ unreadCount }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-4 inset-x-4 z-40 lg:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="flex h-16 bg-white/95 backdrop-blur-xl rounded-2xl shadow-luxury-card border border-argile-200/60 overflow-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          const isMessages = href === "/messagerie"
          const showBadge = isMessages && unreadCount > 0
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-fast cursor-pointer relative ${
                  active ? "text-or-500" : "text-garrigue-400 hover:text-garrigue-700"
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2 : 1.6} className="transition-fast" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 text-[8px] font-bold text-white bg-or-500 rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 tabular-nums">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-fast ${
                  active ? "text-or-500" : "text-garrigue-400"
                }`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-or-400 rounded-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/messagerie.ts "apps/portal/app/(protected)/layout.tsx" apps/portal/components/layout/sidebar-nav.tsx apps/portal/components/layout/bottom-nav.tsx
git commit -m "feat(portal): unread messages badge in sidebar and bottom nav"
```

---

## Task 2: New Message Thread Dialog

**Files:**
- Modify: `apps/portal/lib/dal/messagerie.ts`
- Modify: `apps/portal/app/(protected)/messagerie/actions.ts`
- Create: `apps/portal/components/messagerie/new-thread-dialog.tsx`
- Create: `apps/portal/components/messagerie/new-thread-button.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/page.tsx`

- [ ] **Step 1: Add `createOwnerThread` to `apps/portal/lib/dal/messagerie.ts`**

Append after `getOwnerUnreadCount` (added in Task 1):

```typescript
export async function createOwnerThread(
  ownerId: string,
  subject: string,
  contenu: string
) {
  return db.$transaction(async (tx) => {
    const thread = await tx.messageThread.create({
      data: {
        owner_id: ownerId,
        subject,
        to_name: "Équipe ERA",
        contact_type: "autre",
        folder: "inbox",
      },
    })
    await tx.message.create({
      data: {
        thread_id: thread.id,
        author_type: "OWNER",
        author_id: ownerId,
        contenu,
      },
    })
    return thread
  })
}
```

- [ ] **Step 2: Replace `apps/portal/app/(protected)/messagerie/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { sendOwnerMessage, createOwnerThread } from "@/lib/dal/messagerie"
import { sendNouveauMessageEmail } from "@conciergerie/email"

export async function sendOwnerMessageAction(threadId: string, contenu: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  if (!contenu.trim()) return { error: "Message vide" }

  try {
    await sendOwnerMessage(session.user.ownerId, threadId, contenu)
  } catch {
    return { error: "Thread introuvable" }
  }

  const gestEmail = process.env.GESTIONNAIRE_EMAIL ?? process.env.EMAIL_FROM
  if (gestEmail) {
    try {
      await sendNouveauMessageEmail({
        to: gestEmail,
        recipientName: "l'équipe ERA",
        senderName: session.user.name ?? "Un propriétaire",
        preview: contenu.slice(0, 120),
        mailboxUrl: `${process.env.NEXTAUTH_URL?.replace("portal", "backoffice") ?? ""}/messagerie/${threadId}`,
      })
    } catch (e) {
      console.error("[sendOwnerMessage] email failed:", e)
    }
  }

  revalidatePath(`/messagerie/${threadId}`)
  revalidatePath("/messagerie")
  return { success: true }
}

export async function createThreadAction(subject: string, contenu: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  if (!subject.trim()) return { error: "Sujet requis" }
  if (!contenu.trim()) return { error: "Message requis" }

  let threadId: string
  try {
    const thread = await createOwnerThread(session.user.ownerId, subject.trim(), contenu.trim())
    threadId = thread.id
  } catch {
    return { error: "Erreur lors de la création du fil" }
  }

  const gestEmail = process.env.GESTIONNAIRE_EMAIL ?? process.env.EMAIL_FROM
  if (gestEmail) {
    try {
      await sendNouveauMessageEmail({
        to: gestEmail,
        recipientName: "l'équipe ERA",
        senderName: session.user.name ?? "Un propriétaire",
        preview: contenu.slice(0, 120),
        mailboxUrl: `${process.env.NEXTAUTH_URL?.replace("portal", "backoffice") ?? ""}/messagerie/${threadId}`,
      })
    } catch (e) {
      console.error("[createThread] email failed:", e)
    }
  }

  redirect(`/messagerie/${threadId}`)
}
```

- [ ] **Step 3: Create `apps/portal/components/messagerie/new-thread-dialog.tsx`**

```tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send } from "lucide-react"
import { createThreadAction } from "@/app/(protected)/messagerie/actions"

interface NewThreadDialogProps {
  open: boolean
  onClose: () => void
}

export function NewThreadDialog({ open, onClose }: NewThreadDialogProps) {
  const [subject, setSubject] = useState("")
  const [contenu, setContenu] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createThreadAction(subject, contenu)
      if (result?.error) setError(result.error)
      // On success, createThreadAction calls redirect() — page navigates automatically
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-garrigue-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-0 inset-x-0 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[440px] bg-white sm:rounded-2xl rounded-t-2xl shadow-luxury px-6 pt-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-thread-title"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                id="new-thread-title"
                className="font-serif text-2xl text-garrigue-900 font-light italic"
              >
                Nouveau message.
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-calcaire-100 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer focus-visible:ring-2 focus-visible:ring-or-400 outline-none"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-thread-subject"
                  className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]"
                >
                  Sujet
                </label>
                <input
                  id="new-thread-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Question sur ma réservation de juillet"
                  required
                  className="w-full bg-calcaire-50 border border-argile-300 focus:border-garrigue-900 focus:outline-none rounded-xl px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 transition-fast"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="new-thread-contenu"
                  className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]"
                >
                  Message
                </label>
                <textarea
                  id="new-thread-contenu"
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Votre message…"
                  required
                  rows={4}
                  className="w-full bg-calcaire-50 border border-argile-300 focus:border-garrigue-900 focus:outline-none rounded-xl px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 transition-fast resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending || !subject.trim() || !contenu.trim()}
                className="w-full flex items-center justify-center gap-2 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-40 text-white rounded-xl px-4 py-3 text-sm font-medium transition-smooth cursor-pointer"
              >
                <Send size={14} strokeWidth={2} />
                {isPending ? "Envoi…" : "Envoyer"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Create `apps/portal/components/messagerie/new-thread-button.tsx`**

```tsx
"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { NewThreadDialog } from "./new-thread-dialog"

export function NewThreadButton() {
  const [open, setOpen] = useState(false)
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-garrigue-900 hover:bg-garrigue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-smooth cursor-pointer shrink-0"
      >
        <Plus size={15} strokeWidth={2} />
        <span className="hidden sm:inline">Nouveau message</span>
      </button>
      <NewThreadDialog open={open} onClose={handleClose} />
    </>
  )
}
```

- [ ] **Step 5: Replace `apps/portal/app/(protected)/messagerie/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerThreads } from "@/lib/dal/messagerie"
import { NewThreadButton } from "@/components/messagerie/new-thread-button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { MessageCircle } from "lucide-react"

export default async function MessageriePage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const threads = await getOwnerThreads(session.user.ownerId)

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Messages.</h1>
        <NewThreadButton />
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <MessageCircle size={40} />
          <p className="text-sm">Aucun message</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => {
            const lastMessage = t.messages[0]
            const unread = t._count.messages
            return (
              <Link
                key={t.id}
                href={`/messagerie/${t.id}`}
                className={`block bg-white rounded-xl p-4 shadow-luxury-card border transition-smooth hover:shadow-luxury cursor-pointer ${
                  unread > 0 ? "border-l-4 border-l-or-400" : "border-argile-200/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-lg text-garrigue-900 font-light truncate">
                    {t.subject}
                  </p>
                  {unread > 0 && (
                    <span className="shrink-0 text-xs font-bold text-white bg-or-500 rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-garrigue-400 mt-0.5 font-medium">
                  {t.to_name ?? "Équipe ERA"}
                </p>
                {lastMessage && (
                  <p className="text-xs text-garrigue-400 mt-1 truncate">{lastMessage.contenu}</p>
                )}
                <p className="text-xs text-garrigue-300 mt-1">
                  {formatDistanceToNow(t.updatedAt, { addSuffix: true, locale: fr })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/messagerie.ts "apps/portal/app/(protected)/messagerie/actions.ts" apps/portal/components/messagerie/ "apps/portal/app/(protected)/messagerie/page.tsx"
git commit -m "feat(portal): new thread dialog + create thread server action"
```

---

## Task 3: Portal Devis Validation

**Files:**
- Create: `apps/portal/lib/dal/travaux.ts`
- Create: `apps/portal/app/(protected)/devis/actions.ts`
- Create: `apps/portal/app/(protected)/devis/page.tsx`
- Create: `apps/portal/app/(protected)/devis/[id]/page.tsx`
- Modify: `apps/portal/app/(protected)/layout.tsx` (add `pendingDevisCount`)

- [ ] **Step 1: Create `apps/portal/lib/dal/travaux.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getPendingDevisForOwner(ownerId: string) {
  return db.workOrder.findMany({
    where: {
      statut: "EN_ATTENTE_VALIDATION",
      property: { mandate: { owner_id: ownerId } },
    },
    include: {
      property: { select: { nom: true } },
      contractor: { select: { nom: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getWorkOrderForOwner(ownerId: string, workOrderId: string) {
  return db.workOrder.findFirst({
    where: {
      id: workOrderId,
      property: { mandate: { owner_id: ownerId } },
    },
    include: {
      property: { select: { nom: true, adresse: true } },
      contractor: { select: { nom: true, metier: true, telephone: true } },
    },
  })
}
```

- [ ] **Step 2: Create `apps/portal/app/(protected)/devis/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { getWorkOrderForOwner } from "@/lib/dal/travaux"

export async function validateDevisAction(workOrderId: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const wo = await getWorkOrderForOwner(session.user.ownerId, workOrderId)
  if (!wo) return { error: "Introuvable ou non autorisé" }
  if (wo.statut !== "EN_ATTENTE_VALIDATION") return { error: "Ce devis n'est pas en attente de validation" }

  await db.workOrder.update({
    where: { id: workOrderId },
    data: { statut: "VALIDE" },
  })

  revalidatePath("/devis")
  redirect("/devis")
}

export async function refuseDevisAction(workOrderId: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const wo = await getWorkOrderForOwner(session.user.ownerId, workOrderId)
  if (!wo) return { error: "Introuvable ou non autorisé" }
  if (wo.statut !== "EN_ATTENTE_VALIDATION") return { error: "Ce devis n'est pas en attente de validation" }

  await db.workOrder.update({
    where: { id: workOrderId },
    data: { statut: "ANNULE" },
  })

  revalidatePath("/devis")
  redirect("/devis")
}
```

- [ ] **Step 3: Create `apps/portal/app/(protected)/devis/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPendingDevisForOwner } from "@/lib/dal/travaux"
import Link from "next/link"
import { ClipboardList, Euro, Building2, Wrench } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export default async function DevisPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const devis = await getPendingDevisForOwner(session.user.ownerId)

  return (
    <div className="space-y-5 max-w-3xl animate-fade-up">
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Devis.</h1>
        <p className="text-sm text-garrigue-400 mt-1">
          {devis.length === 0
            ? "Aucun devis en attente de votre validation"
            : `${devis.length} devis en attente de votre validation`}
        </p>
      </div>

      {devis.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <ClipboardList size={40} />
          <p className="text-sm">Aucun devis à valider</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devis.map((wo) => (
            <Link
              key={wo.id}
              href={`/devis/${wo.id}`}
              className="block bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-garrigue-900 font-light leading-tight">{wo.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={12} className="text-garrigue-400 shrink-0" />
                    <p className="text-xs text-garrigue-400">{wo.property.nom}</p>
                  </div>
                </div>
                {wo.montant_devis !== null && (
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-xl text-garrigue-900 font-light">{fmt(wo.montant_devis)}</p>
                    <p className="text-[10px] text-garrigue-400">montant HT</p>
                  </div>
                )}
              </div>
              {wo.contractor && (
                <div className="flex items-center gap-2 text-xs text-garrigue-400">
                  <Wrench size={11} className="shrink-0" />
                  <span>{wo.contractor.nom} — {wo.contractor.metier}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-argile-100">
                <p className="text-[10px] text-garrigue-300">
                  {format(wo.createdAt, "d MMM yyyy", { locale: fr })}
                </p>
                <span className="text-xs font-semibold text-or-600 bg-or-300/15 border border-or-300/40 px-3 py-1 rounded-full">
                  En attente de validation
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `apps/portal/app/(protected)/devis/[id]/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getWorkOrderForOwner } from "@/lib/dal/travaux"
import { validateDevisAction, refuseDevisAction } from "../actions"
import { Building2, Wrench, Phone, Euro, FileText, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n)

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { id } = await params
  const wo = await getWorkOrderForOwner(session.user.ownerId, id)

  if (!wo) redirect("/devis")
  if (wo.statut !== "EN_ATTENTE_VALIDATION") redirect("/devis")

  const validateWithId = validateDevisAction.bind(null, wo.id)
  const refuseWithId = refuseDevisAction.bind(null, wo.id)

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <a href="/devis" className="text-xs text-garrigue-400 hover:text-garrigue-900 transition-fast mb-4 inline-block">
          ← Retour aux devis
        </a>
        <h1 className="font-serif text-3xl text-garrigue-900 font-light italic leading-tight">
          {wo.titre}
        </h1>
        <p className="text-sm text-garrigue-400 mt-1">
          {format(wo.createdAt, "d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Property */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Bien concerné</h2>
        <div className="flex items-start gap-3">
          <Building2 size={16} className="text-garrigue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-garrigue-900">{wo.property.nom}</p>
            {wo.property.adresse && (
              <p className="text-xs text-garrigue-400 mt-0.5">{wo.property.adresse}</p>
            )}
          </div>
        </div>
      </section>

      {/* Work description */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Description des travaux</h2>
        <p className="text-sm text-garrigue-700 leading-relaxed">{wo.description}</p>
        {wo.notes_devis && (
          <div className="mt-4 pt-4 border-t border-argile-100">
            <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-wide mb-2">Notes prestataire</p>
            <p className="text-sm text-garrigue-600">{wo.notes_devis}</p>
          </div>
        )}
      </section>

      {/* Contractor */}
      {wo.contractor && (
        <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Prestataire</h2>
          <div className="flex items-center gap-3">
            <Wrench size={16} className="text-garrigue-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-garrigue-900">{wo.contractor.nom}</p>
              <p className="text-xs text-garrigue-400">{wo.contractor.metier}</p>
            </div>
            {wo.contractor.telephone && (
              <a
                href={`tel:${wo.contractor.telephone}`}
                className="ml-auto flex items-center gap-1.5 text-xs text-garrigue-500 hover:text-garrigue-900 transition-fast"
              >
                <Phone size={12} />
                {wo.contractor.telephone}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Amount */}
      {wo.montant_devis !== null && (
        <section className="bg-garrigue-900 rounded-2xl p-5 shadow-luxury">
          <p className="text-xs text-garrigue-400 mb-2 uppercase tracking-wide">Montant du devis</p>
          <p className="font-serif text-3xl text-white font-light">{fmt(wo.montant_devis)}</p>
          <p className="text-xs text-garrigue-400 mt-2">
            Ce montant sera imputé sur votre compte mandant si vous validez.
          </p>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form action={validateWithId} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-olivier-700 hover:bg-olivier-800 text-white rounded-xl px-5 py-3.5 text-sm font-medium transition-smooth cursor-pointer"
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            Valider le devis
          </button>
        </form>
        <form action={refuseWithId} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-5 py-3.5 text-sm font-medium transition-smooth cursor-pointer"
          >
            <XCircle size={16} strokeWidth={2} />
            Refuser le devis
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update `apps/portal/app/(protected)/layout.tsx` to pass `pendingDevisCount`**

Read the file (already modified in Task 1). Add import for `getPendingDevisForOwner` and pass the count:

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PortalHeader } from "@/components/layout/portal-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { getOwnerUnreadCount } from "@/lib/dal/messagerie"
import { getPendingDevisForOwner } from "@/lib/dal/travaux"

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.mfaRequired && !session.user.mfaVerified) redirect("/login/mfa")

  const ownerId = session.user.ownerId ?? null

  const [unreadCount, pendingDevis] = await Promise.all([
    ownerId ? getOwnerUnreadCount(ownerId) : Promise.resolve(0),
    ownerId ? getPendingDevisForOwner(ownerId) : Promise.resolve([]),
  ])

  return (
    <div className="flex min-h-screen bg-calcaire-100">
      <SidebarNav
        userName={session.user.name ?? "Propriétaire"}
        userEmail={session.user.email ?? ""}
        unreadCount={unreadCount}
        pendingDevisCount={pendingDevis.length}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-safe-nav lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
```

- [ ] **Step 6: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/travaux.ts "apps/portal/app/(protected)/devis/" "apps/portal/app/(protected)/layout.tsx" apps/portal/components/layout/sidebar-nav.tsx
git commit -m "feat(portal): devis validation page — list + detail + accept/refuse server actions"
```

---

## Task 4: Attestation Fiscale Annuelle

**Files:**
- Create: `packages/email/src/templates/attestation-fiscale.tsx`
- Modify: `packages/email/src/render.ts`
- Modify: `packages/email/src/index.ts`
- Create: `apps/backoffice/lib/pdf/attestation-template.tsx`
- Create: `apps/backoffice/app/api/pdf/attestation/[ownerId]/route.ts`
- Create: `apps/backoffice/app/api/cron/attestation-fiscale/route.ts`
- Modify: `apps/backoffice/vercel.json`

### Context

The attestation fiscale is an annual tax document summarizing all ManagementReports for a given owner in a given year: total rent collected, management fees, work charges, and net amount reversed. It's required by French tax law for property owners to declare rental income. The cron runs Jan 31 each year (for the previous year) and generates a PDF stored as a `ATTESTATION_FISCALE` document.

The backoffice also adds a "Générer attestation" button on the owner's profile page for on-demand generation.

- [ ] **Step 1: Create email template `packages/email/src/templates/attestation-fiscale.tsx`**

Read `packages/email/src/templates/crg-mensuel.tsx` first to match the pattern. Then create:

```tsx
import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Row, Column,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface AttestationFiscaleEmailProps {
  to: string
  ownerName: string
  annee: number
  totalLoyers: number
  totalHonoraires: number
  totalCharges: number
  totalVerse: number
  portalUrl: string
}

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })

export function AttestationFiscaleEmail({
  ownerName,
  annee,
  totalLoyers,
  totalHonoraires,
  totalCharges,
  totalVerse,
  portalUrl,
}: AttestationFiscaleEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre attestation fiscale {annee} est disponible</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            <Heading className="text-2xl font-light text-gray-900 mb-2">
              Attestation fiscale {annee}
            </Heading>
            <Text className="text-gray-600 mb-6">
              Bonjour {ownerName},
            </Text>
            <Text className="text-gray-600 mb-4">
              Votre attestation fiscale pour l&apos;année {annee} est disponible.
              Ce document récapitule les sommes perçues et les charges déduites pour vos biens en gestion.
            </Text>
            <Section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
              <Row className="mb-3">
                <Column>
                  <Text className="text-xs text-gray-500 uppercase tracking-wider m-0">Loyers encaissés</Text>
                  <Text className="text-lg font-semibold text-gray-900 m-0">{fmt(totalLoyers)}</Text>
                </Column>
              </Row>
              <Hr className="border-gray-100 my-3" />
              <Row className="mb-3">
                <Column>
                  <Text className="text-xs text-gray-500 m-0">Honoraires de gestion</Text>
                  <Text className="text-sm text-gray-700 m-0">-{fmt(totalHonoraires)}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column>
                  <Text className="text-xs text-gray-500 m-0">Charges et travaux</Text>
                  <Text className="text-sm text-gray-700 m-0">-{fmt(totalCharges)}</Text>
                </Column>
              </Row>
              <Hr className="border-gray-100 my-3" />
              <Row>
                <Column>
                  <Text className="text-xs text-gray-500 uppercase tracking-wider m-0">Montant total reversé</Text>
                  <Text className="text-xl font-bold text-gray-900 m-0">{fmt(totalVerse)}</Text>
                </Column>
              </Row>
            </Section>
            <Text className="text-gray-600 mb-4">
              Téléchargez votre attestation fiscale depuis votre espace propriétaire.
            </Text>
            <Section className="text-center mb-6">
              <a
                href={portalUrl}
                className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg no-underline"
              >
                Accéder à mes documents
              </a>
            </Section>
            <Text className="text-xs text-gray-400">
              Entre Rhône et Alpilles — Gestion locative haut de gamme
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

- [ ] **Step 2: Read `packages/email/src/render.ts` and add `sendAttestationFiscaleEmail`**

Read the file to understand the pattern, then append:

```typescript
export async function sendAttestationFiscaleEmail(props: {
  to: string
  ownerName: string
  annee: number
  totalLoyers: number
  totalHonoraires: number
  totalCharges: number
  totalVerse: number
  portalUrl: string
}) {
  const { to, ...rest } = props
  const html = await renderEmail(AttestationFiscaleEmail, { to, ...rest })
  return sendEmail({
    to,
    subject: `Votre attestation fiscale ${props.annee} — Entre Rhône et Alpilles`,
    html,
  })
}
```

Also add the import at the top of render.ts:
```typescript
import { AttestationFiscaleEmail } from "./templates/attestation-fiscale"
```

- [ ] **Step 3: Export from `packages/email/src/index.ts`**

Add to the existing exports:
```typescript
export { AttestationFiscaleEmail } from "./templates/attestation-fiscale"
// ...
export { sendAttestationFiscaleEmail } from "./render"
```

- [ ] **Step 4: Create `apps/backoffice/lib/pdf/attestation-template.tsx`**

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

export interface AttestationFiscaleData {
  owner: {
    nom: string
    email: string
    adresse?: string | null
  }
  annee: number
  reports: {
    periode_debut: Date
    periode_fin: Date
    revenus_sejours: number
    honoraires_deduits: number
    charges_deduites: number
    montant_reverse: number
    date_virement: Date | null
  }[]
  totalLoyers: number
  totalHonoraires: number
  totalCharges: number
  totalVerse: number
  generatedAt: Date
}

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  success: "#059669",
  danger: "#dc2626",
}

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
    paddingTop: 45,
    paddingBottom: 55,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.primary },
  companyTagline: { fontSize: 8, color: colors.muted, marginTop: 2 },
  docTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.primary, textAlign: "right" },
  docSubtitle: { fontSize: 9, color: colors.muted, textAlign: "right", marginTop: 3 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  infoBlock: { width: "48%" },
  sectionTitle: {
    fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.muted,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
  },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  infoSub: { fontSize: 8, color: colors.muted },
  tableBlock: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: { fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  colMois: { width: "22%" },
  colLoyers: { width: "22%", textAlign: "right" },
  colHonoraires: { width: "22%", textAlign: "right" },
  colCharges: { width: "18%", textAlign: "right" },
  colVerse: { width: "16%", textAlign: "right" },
  tableLabel: { fontSize: 8.5, color: colors.text },
  tableValue: { fontSize: 8.5, color: colors.text, fontFamily: "Helvetica-Bold" },
  deductionValue: { fontSize: 8.5, color: colors.danger, fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: colors.light,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  summaryBox: { marginTop: 20, padding: 14, backgroundColor: colors.primary, borderRadius: 4 },
  summaryLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  summaryAmount: { fontSize: 24, fontFamily: "Helvetica-Bold", color: colors.accent },
  summaryNote: { fontSize: 7.5, color: "rgba(255,255,255,0.5)", marginTop: 6 },
  legalText: { marginTop: 20, fontSize: 7.5, color: colors.muted, lineHeight: 1.6 },
  footer: {
    position: "absolute",
    bottom: 25, left: 40, right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: colors.muted },
})

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

const fmtShort = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

export function AttestationFiscalePDF({ data }: { data: AttestationFiscaleData }) {
  return (
    <Document title={`Attestation Fiscale ${data.annee} — ${data.owner.nom}`}>
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
          </View>
          <View>
            <Text style={S.docTitle}>ATTESTATION FISCALE</Text>
            <Text style={S.docSubtitle}>Année {data.annee}</Text>
          </View>
        </View>

        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Propriétaire</Text>
            <Text style={S.infoValue}>{data.owner.nom}</Text>
            <Text style={S.infoSub}>{data.owner.email}</Text>
            {data.owner.adresse && <Text style={S.infoSub}>{data.owner.adresse}</Text>}
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Période</Text>
            <Text style={S.infoValue}>Année {data.annee}</Text>
            <Text style={S.infoSub}>Du 1er janvier au 31 décembre {data.annee}</Text>
            <Text style={S.infoSub}>Généré le {fmtShort(data.generatedAt)}</Text>
          </View>
        </View>

        {/* Monthly breakdown table */}
        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Récapitulatif mensuel</Text>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderText, S.colMois]}>Période</Text>
            <Text style={[S.tableHeaderText, S.colLoyers]}>Loyers</Text>
            <Text style={[S.tableHeaderText, S.colHonoraires]}>Honoraires</Text>
            <Text style={[S.tableHeaderText, S.colCharges]}>Charges</Text>
            <Text style={[S.tableHeaderText, S.colVerse]}>Reversé</Text>
          </View>
          {data.reports.map((r, i) => (
            <View key={i} style={S.tableRow}>
              <Text style={[S.tableLabel, S.colMois]}>{fmtDate(r.periode_debut)}</Text>
              <Text style={[S.tableValue, S.colLoyers]}>{fmt(r.revenus_sejours)}</Text>
              <Text style={[S.deductionValue, S.colHonoraires]}>-{fmt(r.honoraires_deduits)}</Text>
              <Text style={[S.deductionValue, S.colCharges]}>-{fmt(r.charges_deduites)}</Text>
              <Text style={[S.tableValue, S.colVerse]}>{fmt(r.montant_reverse)}</Text>
            </View>
          ))}
          <View style={S.totalRow}>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colMois]}>TOTAL {data.annee}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colLoyers]}>{fmt(data.totalLoyers)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: colors.danger }, S.colHonoraires]}>-{fmt(data.totalHonoraires)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: colors.danger }, S.colCharges]}>-{fmt(data.totalCharges)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colVerse]}>{fmt(data.totalVerse)}</Text>
          </View>
        </View>

        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Total reversé au propriétaire sur {data.annee}</Text>
          <Text style={S.summaryAmount}>{fmt(data.totalVerse)}</Text>
          <Text style={S.summaryNote}>
            Loyers encaissés : {fmt(data.totalLoyers)} — Charges déduites : {fmt(data.totalHonoraires + data.totalCharges)}
          </Text>
        </View>

        <Text style={S.legalText}>
          Cette attestation fiscale est établie conformément aux obligations déclaratives en matière de revenus fonciers
          (location meublée courte durée — régime BIC ou régime réel). Les montants ci-dessus correspondent aux encaissements
          et décaissements effectués pour votre compte mandant sur la période du 1er janvier au 31 décembre {data.annee},
          conformément à la loi Hoguet n°70-9 du 2 janvier 1970 et au décret n°72-678 du 20 juillet 1972.
          Document à conserver et à déclarer aux services fiscaux (case 4BE ou liasse 2031 selon régime).
        </Text>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — Gestion locative</Text>
          <Text style={S.footerText}>Attestation fiscale {data.annee} — {data.owner.nom}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 5: Create `apps/backoffice/app/api/pdf/attestation/[ownerId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"
import { AttestationFiscalePDF, type AttestationFiscaleData } from "@/lib/pdf/attestation-template"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const { ownerId } = await params
  const body = await req.json().catch(() => ({}))
  const annee = Number(body.annee ?? new Date().getFullYear() - 1)

  const owner = await db.owner.findUnique({
    where: { id: ownerId },
    select: { id: true, nom: true, email: true, adresse: true },
  })
  if (!owner) return new NextResponse("Propriétaire introuvable", { status: 404 })

  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
    include: {
      reports: {
        where: {
          periode_debut: { gte: new Date(`${annee}-01-01`) },
          periode_fin: { lte: new Date(`${annee}-12-31T23:59:59`) },
        },
        orderBy: { periode_debut: "asc" },
      },
    },
  })

  const reports = account?.reports ?? []
  if (reports.length === 0) {
    return new NextResponse(`Aucun rapport pour ${annee}`, { status: 404 })
  }

  const totalLoyers = reports.reduce((s, r) => s + r.revenus_sejours, 0)
  const totalHonoraires = reports.reduce((s, r) => s + r.honoraires_deduits, 0)
  const totalCharges = reports.reduce((s, r) => s + r.charges_deduites, 0)
  const totalVerse = reports.reduce((s, r) => s + r.montant_reverse, 0)

  const data: AttestationFiscaleData = {
    owner: { nom: owner.nom, email: owner.email ?? "", adresse: owner.adresse },
    annee,
    reports,
    totalLoyers,
    totalHonoraires,
    totalCharges,
    totalVerse,
    generatedAt: new Date(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(AttestationFiscalePDF, { data }) as any
  const buffer = await renderToBuffer(element)

  const safe = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-]/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "")

  const filename = `Attestation-Fiscale-${annee}-${safe(owner.nom)}.pdf`
  const key = buildStorageKey({
    entityType: "owner",
    entityId: ownerId,
    folder: "attestation_fiscale",
    fileName: `${Date.now()}-${filename}`,
  })

  const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

  const doc = await createDocument({
    nom: filename,
    type: "ATTESTATION_FISCALE",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "owner",
    entity_id: ownerId,
    uploaded_by: session.user.email ?? "system",
    owner_id: ownerId,
  })

  return NextResponse.json({ success: true, document: doc, url })
}
```

- [ ] **Step 6: Create `apps/backoffice/app/api/cron/attestation-fiscale/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { db } from "@conciergerie/db"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"
import { AttestationFiscalePDF, type AttestationFiscaleData } from "@/lib/pdf/attestation-template"
import { sendAttestationFiscaleEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const annee = new Date().getFullYear() - 1
  const startDate = new Date(`${annee}-01-01`)
  const endDate = new Date(`${annee}-12-31T23:59:59`)

  const owners = await db.owner.findMany({
    where: { mandantAccount: { reports: { some: { periode_debut: { gte: startDate } } } } },
    select: { id: true, nom: true, email: true, adresse: true },
  })

  const results = { generated: 0, errors: 0, skipped: 0 }

  for (const owner of owners) {
    if (!owner.email) { results.skipped++; continue }

    const account = await db.mandantAccount.findUnique({
      where: { owner_id: owner.id },
      include: {
        reports: {
          where: { periode_debut: { gte: startDate }, periode_fin: { lte: endDate } },
          orderBy: { periode_debut: "asc" },
        },
      },
    })

    const reports = account?.reports ?? []
    if (reports.length === 0) { results.skipped++; continue }

    try {
      const totalLoyers = reports.reduce((s, r) => s + r.revenus_sejours, 0)
      const totalHonoraires = reports.reduce((s, r) => s + r.honoraires_deduits, 0)
      const totalCharges = reports.reduce((s, r) => s + r.charges_deduites, 0)
      const totalVerse = reports.reduce((s, r) => s + r.montant_reverse, 0)

      const data: AttestationFiscaleData = {
        owner: { nom: owner.nom, email: owner.email, adresse: owner.adresse },
        annee, reports, totalLoyers, totalHonoraires, totalCharges, totalVerse,
        generatedAt: new Date(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = await renderToBuffer(createElement(AttestationFiscalePDF, { data }) as any)

      const safe = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-]/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "")

      const filename = `Attestation-Fiscale-${annee}-${safe(owner.nom)}.pdf`
      const key = buildStorageKey({
        entityType: "owner",
        entityId: owner.id,
        folder: "attestation_fiscale",
        fileName: `${Date.now()}-${filename}`,
      })

      const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

      await createDocument({
        nom: filename,
        type: "ATTESTATION_FISCALE",
        url_storage: url,
        mime_type: "application/pdf",
        taille: buffer.byteLength,
        entity_type: "owner",
        entity_id: owner.id,
        uploaded_by: "system/cron",
        owner_id: owner.id,
      })

      const portalUrl = `${process.env.PORTAL_URL ?? ""}/documents?type=ATTESTATION_FISCALE`
      await sendAttestationFiscaleEmail({
        to: owner.email,
        ownerName: owner.nom,
        annee,
        totalLoyers,
        totalHonoraires,
        totalCharges,
        totalVerse,
        portalUrl,
      })

      results.generated++
    } catch (e) {
      console.error(`[attestation-fiscale] error for ${owner.id}:`, e)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, annee, ...results })
}
```

- [ ] **Step 7: Read `apps/backoffice/vercel.json` and add the cron**

Read the file, then add:
```json
{
  "path": "/api/cron/attestation-fiscale",
  "schedule": "0 9 31 1 *"
}
```
to the crons array (runs Jan 31 at 9:00 UTC).

- [ ] **Step 8: Type-check backoffice**

```bash
cd C:/Developpement/conciergerie/apps/backoffice && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
cd C:/Developpement/conciergerie
git add packages/email/src/templates/attestation-fiscale.tsx packages/email/src/render.ts packages/email/src/index.ts apps/backoffice/lib/pdf/attestation-template.tsx "apps/backoffice/app/api/pdf/attestation/[ownerId]/route.ts" apps/backoffice/app/api/cron/attestation-fiscale/route.ts apps/backoffice/vercel.json
git commit -m "feat(backoffice): attestation fiscale annuelle — PDF template + API route + cron"
```

---

## Task 5: Mandat Renewal Alert Cron

**Files:**
- Create: `packages/email/src/templates/mandat-renewal.tsx`
- Modify: `packages/email/src/render.ts`
- Modify: `packages/email/src/index.ts`
- Create: `apps/backoffice/app/api/cron/mandat-renewal/route.ts`
- Modify: `apps/backoffice/vercel.json`

### Context

Mandates (`Mandat`) have a `date_fin` field. When a mandate expires without renewal, the company loses the management relationship. The cron sends email alerts at J-90 and J-30 before expiry to both the internal team (backoffice admin email) and — if an owner email is available — the owner.

The `Mandat` model has: `id`, `owner_id`, `date_fin` (nullable), `statut`, `numero_mandat`. Read `packages/db/prisma/schema.prisma` to confirm field names before running.

- [ ] **Step 1: Check Mandat schema fields**

```bash
grep -A 30 "^model Mandat " C:/Developpement/conciergerie/packages/db/prisma/schema.prisma
```

Expected to find: `date_fin`, `statut`, `numero_mandat`, `owner_id`.

- [ ] **Step 2: Create `packages/email/src/templates/mandat-renewal.tsx`**

```tsx
import {
  Body, Container, Head, Heading, Html, Preview,
  Section, Text, Hr,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface MandatRenewalEmailProps {
  to: string
  ownerName: string
  numeroMandat: string
  dateExpiration: string
  joursRestants: number
  backofficeUrl: string
}

export function MandatRenewalEmail({
  ownerName,
  numeroMandat,
  dateExpiration,
  joursRestants,
  backofficeUrl,
}: MandatRenewalEmailProps) {
  const isUrgent = joursRestants <= 30

  return (
    <Html>
      <Head />
      <Preview>Mandat {numeroMandat} expire dans {joursRestants} jours — action requise</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            <Heading className={`text-2xl font-light mb-2 ${isUrgent ? "text-red-700" : "text-gray-900"}`}>
              {isUrgent ? "Mandat expirant bientôt" : "Rappel renouvellement mandat"}
            </Heading>
            <Text className="text-gray-600 mb-4">
              Le mandat <strong>{numeroMandat}</strong> de <strong>{ownerName}</strong> expire
              le <strong>{dateExpiration}</strong> ({joursRestants} jours restants).
            </Text>
            {isUrgent && (
              <Section className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <Text className="text-red-700 text-sm font-medium m-0">
                  Action urgente requise — contactez le propriétaire pour renouveler le mandat.
                </Text>
              </Section>
            )}
            <Text className="text-gray-600 mb-6">
              Veuillez contacter {ownerName} pour procéder au renouvellement du mandat avant son expiration.
            </Text>
            <Section className="text-center mb-6">
              <a
                href={backofficeUrl}
                className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg no-underline"
              >
                Voir le mandat
              </a>
            </Section>
            <Hr className="border-gray-200" />
            <Text className="text-xs text-gray-400 mt-4">
              Entre Rhône et Alpilles — Gestion locative haut de gamme
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

- [ ] **Step 3: Read `packages/email/src/render.ts` and add `sendMandatRenewalEmail`**

Append:

```typescript
export async function sendMandatRenewalEmail(props: {
  to: string
  ownerName: string
  numeroMandat: string
  dateExpiration: string
  joursRestants: number
  backofficeUrl: string
}) {
  const { to, ...rest } = props
  const html = await renderEmail(MandatRenewalEmail, { to, ...rest })
  return sendEmail({
    to,
    subject: `Renouvellement mandat ${props.numeroMandat} — ${props.joursRestants} jours restants`,
    html,
  })
}
```

Add import at top:
```typescript
import { MandatRenewalEmail } from "./templates/mandat-renewal"
```

- [ ] **Step 4: Export from `packages/email/src/index.ts`**

```typescript
export { MandatRenewalEmail } from "./templates/mandat-renewal"
export { sendMandatRenewalEmail } from "./render"
```

- [ ] **Step 5: Check Mandat schema (before writing route)**

```bash
grep -A 40 "^model Mandat " C:/Developpement/conciergerie/packages/db/prisma/schema.prisma
```

Use the actual field names found for `date_fin` and `statut`. If `date_fin` doesn't exist, use whatever end-date field is present.

- [ ] **Step 6: Create `apps/backoffice/app/api/cron/mandat-renewal/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { db } from "@conciergerie/db"
import { sendMandatRenewalEmail } from "@conciergerie/email"

const ALERT_DAYS = [90, 30]

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const now = new Date()
  const results = { sent: 0, skipped: 0, errors: 0 }
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM

  for (const days of ALERT_DAYS) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + days)
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    const expiringMandates = await db.mandate.findMany({
      where: {
        date_fin: { gte: dayStart, lte: dayEnd },
        statut: "ACTIF",
      },
      include: {
        owner: { select: { nom: true, email: true } },
      },
    })

    for (const mandate of expiringMandates) {
      const dateExpiration = new Intl.DateTimeFormat("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      }).format(mandate.date_fin!)

      const backofficeUrl = `${process.env.NEXTAUTH_URL ?? ""}/mandats/${mandate.id}`

      try {
        // Always notify admin
        if (adminEmail) {
          await sendMandatRenewalEmail({
            to: adminEmail,
            ownerName: mandate.owner.nom,
            numeroMandat: mandate.numero_mandat,
            dateExpiration,
            joursRestants: days,
            backofficeUrl,
          })
        }
        // Also notify owner if they have an email
        if (mandate.owner.email && mandate.owner.email !== adminEmail) {
          await sendMandatRenewalEmail({
            to: mandate.owner.email,
            ownerName: mandate.owner.nom,
            numeroMandat: mandate.numero_mandat,
            dateExpiration,
            joursRestants: days,
            backofficeUrl,
          })
        }
        results.sent++
      } catch (e) {
        console.error(`[mandat-renewal] error for mandate ${mandate.id}:`, e)
        results.errors++
      }
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
```

- [ ] **Step 7: Add cron to `apps/backoffice/vercel.json`**

Read the file, then add to the crons array:
```json
{
  "path": "/api/cron/mandat-renewal",
  "schedule": "0 8 * * *"
}
```
(Runs daily at 8:00 UTC — checks if any mandates expire in exactly 90 or 30 days from today.)

- [ ] **Step 8: Type-check backoffice**

```bash
cd C:/Developpement/conciergerie/apps/backoffice && pnpm tsc --noEmit
```

Expected: 0 errors. If `date_fin` field name is wrong, fix it based on the schema check in Step 5.

- [ ] **Step 9: Commit**

```bash
cd C:/Developpement/conciergerie
git add packages/email/src/templates/mandat-renewal.tsx packages/email/src/render.ts packages/email/src/index.ts apps/backoffice/app/api/cron/mandat-renewal/route.ts apps/backoffice/vercel.json
git commit -m "feat(backoffice): mandat renewal alert cron J-90/J-30 with owner + admin email"
```

---

## Task 6: Backoffice Upload — Owner Linking

**Files:**
- Modify: `apps/backoffice/app/(protected)/documents/actions.ts`
- Modify: `apps/backoffice/app/(protected)/documents/upload-dialog.tsx`

### Context

The upload dialog currently stores all documents with `entity_id: "misc"` and no `owner_id`. This means documents uploaded from the global browser never appear in any owner's portal view. The fix: add an optional owner selector to the dialog. The dialog calls a new server action to fetch the owner list, and passes `owner_id` in the FormData when set.

- [ ] **Step 1: Add `listOwnersForSelectAction` to `apps/backoffice/app/(protected)/documents/actions.ts`**

Read the file, then append this server action:

```typescript
export async function listOwnersForSelectAction() {
  const session = await auth()
  if (!session?.user) return []
  return db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
    take: 500,
  })
}
```

Also add the import for `db`:
```typescript
import { db } from "@conciergerie/db"
```

(Check if `db` is already imported before adding.)

- [ ] **Step 2: Update `apps/backoffice/app/(protected)/documents/upload-dialog.tsx`**

Read the file. Replace entirely with the version below that adds an owner combobox:

```tsx
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@conciergerie/ui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Upload, X, FileText, Image, File } from "lucide-react"
import { toast } from "sonner"
import { uploadDocumentAction, listOwnersForSelectAction } from "./actions"

const DOC_TYPES = [
  { value: "MANDAT", label: "Mandat" },
  { value: "AVENANT", label: "Avenant" },
  { value: "DEVIS", label: "Devis" },
  { value: "FACTURE", label: "Facture" },
  { value: "CRG", label: "CRG" },
  { value: "ETAT_LIEUX", label: "État des lieux" },
  { value: "ATTESTATION_FISCALE", label: "Attestation fiscale" },
  { value: "PHOTO", label: "Photo" },
  { value: "DIAGNOSTIC", label: "Diagnostic" },
  { value: "AUTRE", label: "Autre" },
] as const

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />
  if (mime === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />
  return <File className="w-5 h-5 text-muted-foreground" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Owner { id: string; nom: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: () => void
}

export function UploadDialog({ open, onOpenChange, onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [type, setType] = useState<string>("AUTRE")
  const [dateExpiration, setDateExpiration] = useState<string>("")
  const [ownerId, setOwnerId] = useState<string>("")
  const [owners, setOwners] = useState<Owner[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    listOwnersForSelectAction().then(setOwners).catch(() => {})
  }, [open])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const added = Array.from(newFiles).filter((f) => !existing.has(`${f.name}-${f.size}`))
      return [...prev, ...added]
    })
  }, [])

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true) }
  function onDragLeave() { setDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    let errors = 0

    for (const file of files) {
      const fd = new FormData()
      fd.set("file", file)
      fd.set("type", type)
      fd.set("entity_type", "document")
      fd.set("entity_id", ownerId || "misc")
      if (ownerId) fd.set("owner_id", ownerId)
      if (dateExpiration) fd.set("date_expiration", dateExpiration)

      const result = await uploadDocumentAction(fd)
      if (result.error) errors++
    }

    setUploading(false)
    if (errors === 0) {
      toast.success(`${files.length} fichier${files.length > 1 ? "s" : ""} importé${files.length > 1 ? "s" : ""}`)
      setFiles([]); setDateExpiration(""); setOwnerId("")
      onUploaded(); onOpenChange(false)
    } else {
      toast.error(`${errors} erreur${errors > 1 ? "s" : ""} lors de l'import`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type de document</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Owner selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Propriétaire <span className="font-normal text-xs">(optionnel — pour qu&apos;il apparaisse sur le portail)</span>
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— Aucun propriétaire spécifique —</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.nom}</option>
              ))}
            </select>
          </div>

          {/* Date d'expiration */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Date d&apos;expiration <span className="font-normal">(optionnel — DPE, assurance…)</span>
            </label>
            <input
              type="date"
              value={dateExpiration}
              onChange={(e) => setDateExpiration(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full text-sm border border-border rounded-md px-2.5 py-1.5 bg-background"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            <Upload className={`w-8 h-8 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium text-foreground">
              Glissez vos fichiers ici, ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground">PDF, images, Excel, Word — 50 MB max</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.docx,.doc"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {files.map((file, i) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 bg-card">
                  {fileIcon(file.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setFiles([]); setDateExpiration(""); setOwnerId("") }}>
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Import en cours…" : `Importer ${files.length > 0 ? `(${files.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Type-check backoffice**

```bash
cd C:/Developpement/conciergerie/apps/backoffice && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add "apps/backoffice/app/(protected)/documents/upload-dialog.tsx" "apps/backoffice/app/(protected)/documents/actions.ts"
git commit -m "feat(backoffice): upload dialog — optional owner linking for portal visibility"
```

---

## Task 7: Final Build + Push

- [ ] **Step 1: Build both apps**

```bash
cd C:/Developpement/conciergerie && pnpm turbo build --filter=@conciergerie/portal --filter=@conciergerie/backoffice 2>&1 | tail -30
```

Expected: both apps build successfully.

- [ ] **Step 2: Push**

```bash
cd C:/Developpement/conciergerie && git push
```

---

## Self-Review

### Spec coverage
- [x] Task 1: Unread badge — portal sidebar + bottom nav
- [x] Task 2: New thread — owner can initiate contact
- [x] Task 3: Devis validation — portal list + detail + validate/refuse
- [x] Task 4: Attestation fiscale — PDF template + API route + annual cron + portal `ATTESTATION_FISCALE` filter already exists
- [x] Task 5: Mandat renewal alert — daily cron, J-90 + J-30, admin + owner email
- [x] Task 6: Upload owner linking — documents uploaded in backoffice appear in portal

### Gaps / Not included
- **Prochain reversement on dashboard**: No `prochain_virement_date` field in MandantAccount schema. Would require a DB migration. Excluded — out of scope without schema change.
- **Generate attestation button on owner page**: The API route (POST `/api/pdf/attestation/[ownerId]`) exists and can be called from the owner detail page UI. Adding the button to the existing owner page is a straightforward enhancement — add a `<form action="/api/pdf/attestation/{id}" method="POST">` button. Left as optional follow-up.

### No placeholder check
- All code blocks contain complete implementations
- Exact file paths throughout
- Type-check commands after each task
