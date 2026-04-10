# Portail Propriétaire — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le portail propriétaire mobile-first (`apps/portal`) avec 6 pages fonctionnelles, DAL sécurisée, layout Provence, et messagerie.

**Architecture:** Next.js 14 App Router avec Server Components + Server Actions. Toutes les requêtes DB passent par une DAL scoped à `ownerId` depuis `session.user.ownerId`. Le layout expose Header + BottomNav mobile (5 items) + Sidebar desktop.

**Tech Stack:** Next.js 14, NextAuth v5, Prisma, Tailwind (tokens Provence), Framer Motion (SoldeCard uniquement), Lucide React, react-big-calendar + date-fns (Planning).

**Spec:** `docs/superpowers/specs/2026-04-10-portail-proprietaire-design.md`

---

## Structure des fichiers

### Nouveaux fichiers
```
apps/portal/lib/dal/
  owner.ts              — getOwnerWithAccount
  properties.ts         — getOwnerProperties, getOwnerPropertyById
  revenus.ts            — getOwnerReports, getOwnerReportById
  documents.ts          — getOwnerDocuments
  messagerie.ts         — getOwnerThreads, getOwnerThread, sendOwnerMessage
  planning.ts           — getOwnerPlanningEvents

apps/portal/components/
  layout/portal-header.tsx     — logo + prénom + cloche
  layout/bottom-nav.tsx        — nav mobile 5 items
  layout/sidebar-nav.tsx       — sidebar desktop
  dashboard/solde-card.tsx     — SoldeCard avec Framer Motion
  dashboard/event-card.tsx     — EventCard check-in/check-out
  dashboard/alert-banner.tsx   — AlertBanner fond amber
  biens/property-card.tsx      — PropertyCard taux occupation
  revenus/revenus-table.tsx    — RevenusTable ManagementReport
  documents/document-card.tsx  — DocumentCard badge expiration
  messagerie/message-bubble.tsx — bulles conversations
  messagerie/message-form.tsx  — formulaire envoi (client)
  planning/calendar-portal.tsx — react-big-calendar portail

apps/portal/app/(protected)/
  biens/page.tsx               — liste biens
  biens/[id]/page.tsx          — détail bien + mini-calendrier
  revenus/page.tsx             — table revenus + filtres
  documents/page.tsx           — browser documents + téléchargement
  documents/actions.ts         — getDocumentViewUrlAction (scoped owner)
  messagerie/page.tsx          — liste threads
  messagerie/[id]/page.tsx     — conversation
  messagerie/actions.ts        — sendOwnerMessageAction
  planning/page.tsx            — calendrier multi-biens
```

### Fichiers modifiés
```
apps/portal/package.json                    — + react-big-calendar, date-fns
apps/portal/tailwind.config.ts              — + olivier-50
apps/portal/app/(protected)/layout.tsx      — enrichir avec header + nav
apps/portal/app/(protected)/dashboard/page.tsx — réécrire complet
```

---

## Task 1 — Dépendances + DAL owner + properties

**Files:**
- Modify: `apps/portal/package.json`
- Modify: `apps/portal/tailwind.config.ts`
- Create: `apps/portal/lib/dal/owner.ts`
- Create: `apps/portal/lib/dal/properties.ts`

- [ ] **Step 1: Ajouter les dépendances manquantes dans `apps/portal/package.json`**

Dans la section `"dependencies"`, ajouter après `"framer-motion"`:
```json
"date-fns": "^3.6.0",
"react-big-calendar": "^1.13.1",
```
Dans `"devDependencies"`, ajouter:
```json
"@types/react-big-calendar": "^1.8.9",
```

- [ ] **Step 2: Ajouter `olivier-50` dans `apps/portal/tailwind.config.ts`**

Dans le bloc `olivier`, ajouter après `DEFAULT`:
```typescript
olivier: {
  DEFAULT: "#9BA88D",
  50: "#f2f4ef",   // ← ajouter cette ligne
  400: "#9BA88D",
  500: "#879473",
  600: "#6b7660",
},
```

- [ ] **Step 3: Installer les dépendances**

```bash
cd C:/Developpement/conciergerie && pnpm install
```
Expected: `Done in Xs`

- [ ] **Step 4: Créer `apps/portal/lib/dal/owner.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwnerWithAccount(ownerId: string) {
  return db.owner.findUnique({
    where: { id: ownerId },
    include: {
      mandantAccount: {
        include: {
          reports: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      mandates: {
        where: { statut: "ACTIF" },
        select: { id: true, property_id: true },
      },
      feeInvoices: {
        where: { statut: "ENVOYE" },
        select: { id: true, montant_ttc: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      documents: {
        where: {
          date_expiration: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          entity_type: { not: "message" },
        },
        select: { id: true, nom: true, date_expiration: true },
      },
    },
  })
}
```

- [ ] **Step 5: Créer `apps/portal/lib/dal/properties.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwnerProperties(ownerId: string) {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const daysInMonth = lastOfMonth.getDate()

  const mandates = await db.mandate.findMany({
    where: { owner_id: ownerId, statut: "ACTIF" },
    include: {
      property: {
        include: {
          bookings: {
            where: {
              statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
              OR: [
                { check_in: { gte: firstOfMonth, lte: lastOfMonth } },
                { check_out: { gte: firstOfMonth, lte: lastOfMonth } },
                { check_in: { lte: firstOfMonth }, check_out: { gte: lastOfMonth } },
              ],
            },
            orderBy: { check_in: "asc" },
          },
        },
      },
    },
  })

  return mandates.map((m) => {
    const bookings = m.property.bookings
    let occupiedDays = 0
    for (const b of bookings) {
      const start = Math.max(b.check_in.getTime(), firstOfMonth.getTime())
      const end = Math.min(b.check_out.getTime(), lastOfMonth.getTime())
      if (end > start) occupiedDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    }
    const tauxOccupation = Math.min(100, Math.round((occupiedDays / daysInMonth) * 100))
    const prochaineresa = bookings.find((b) => b.check_in >= now) ?? null
    return {
      ...m.property,
      tauxOccupation,
      prochaineresa: prochaineresa
        ? { check_in: prochaineresa.check_in, check_out: prochaineresa.check_out }
        : null,
    }
  })
}

export async function getOwnerPropertyById(ownerId: string, propertyId: string) {
  // Verify ownership via mandate
  const mandate = await db.mandate.findFirst({
    where: { owner_id: ownerId, property_id: propertyId, statut: "ACTIF" },
  })
  if (!mandate) return null

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      bookings: {
        where: {
          statut: { notIn: ["CANCELLED"] },
          OR: [
            { check_in: { gte: firstOfMonth } },
            { check_out: { lte: lastOfMonth } },
          ],
        },
        include: {
          guest: { select: { prenom: true, nom: true } },
        },
        orderBy: { check_in: "desc" },
        take: 10,
      },
      cleaningTasks: {
        where: {
          date_prevue: { gte: firstOfMonth, lte: lastOfMonth },
        },
        orderBy: { date_prevue: "asc" },
      },
      blockedDates: {
        where: {
          OR: [
            { date_debut: { gte: firstOfMonth, lte: lastOfMonth } },
            { date_fin: { gte: firstOfMonth, lte: lastOfMonth } },
          ],
        },
      },
    },
  })

  if (!property) return null

  // Revenue this month: sum revenu_net_proprietaire of CHECKEDOUT bookings
  const revenusThisMonth = await db.booking.aggregate({
    where: {
      property_id: propertyId,
      statut: "CHECKEDOUT",
      check_in: { gte: firstOfMonth },
      check_out: { lte: lastOfMonth },
    },
    _sum: { revenu_net_proprietaire: true },
  })

  return {
    ...property,
    revenusThisMonth: revenusThisMonth._sum.revenu_net_proprietaire ?? 0,
  }
}
```

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/package.json apps/portal/tailwind.config.ts apps/portal/lib/dal/owner.ts apps/portal/lib/dal/properties.ts pnpm-lock.yaml
git commit -m "feat(portal): deps + DAL owner/properties"
```

---

## Task 2 — DAL revenus + documents + planning + messagerie

**Files:**
- Create: `apps/portal/lib/dal/revenus.ts`
- Create: `apps/portal/lib/dal/documents.ts`
- Create: `apps/portal/lib/dal/planning.ts`
- Create: `apps/portal/lib/dal/messagerie.ts`
- Create: `apps/portal/app/(protected)/messagerie/actions.ts`

- [ ] **Step 1: Créer `apps/portal/lib/dal/revenus.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwnerReports(ownerId: string, year?: number) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
  })
  if (!account) return []

  const yearFilter = year
    ? {
        periode_debut: { gte: new Date(year, 0, 1) },
        periode_fin: { lte: new Date(year, 11, 31, 23, 59, 59) },
      }
    : {}

  return db.managementReport.findMany({
    where: { mandant_account_id: account.id, ...yearFilter },
    orderBy: { periode_debut: "desc" },
  })
}

export async function getOwnerReportById(ownerId: string, reportId: string) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
  })
  if (!account) return null

  const report = await db.managementReport.findFirst({
    where: { id: reportId, mandant_account_id: account.id },
  })
  if (!report) return null

  const bookings = await db.booking.findMany({
    where: {
      property: { mandate: { owner_id: ownerId } },
      statut: "CHECKEDOUT",
      check_in: { gte: report.periode_debut },
      check_out: { lte: new Date(report.periode_fin.getTime() + 24 * 60 * 60 * 1000) },
    },
    include: { property: { select: { nom: true } } },
    orderBy: { check_in: "asc" },
  })

  return { ...report, bookings }
}
```

- [ ] **Step 2: Créer `apps/portal/lib/dal/documents.ts`**

```typescript
import { db } from "@conciergerie/db"
import type { DocumentType } from "@conciergerie/db"

export async function getOwnerDocuments(ownerId: string, type?: DocumentType) {
  return db.document.findMany({
    where: {
      owner_id: ownerId,
      entity_type: { not: "message" },
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
}
```

- [ ] **Step 3: Créer `apps/portal/lib/dal/planning.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwnerPlanningEvents(ownerId: string, from: Date, to: Date) {
  const mandates = await db.mandate.findMany({
    where: { owner_id: ownerId, statut: "ACTIF" },
    select: { property_id: true },
  })
  const propertyIds = mandates.map((m) => m.property_id)
  if (propertyIds.length === 0) return { bookings: [], cleanings: [], blockedDates: [] }

  const [bookings, cleanings, blockedDates] = await Promise.all([
    db.booking.findMany({
      where: {
        property_id: { in: propertyIds },
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: from, lte: to } },
          { check_out: { gte: from, lte: to } },
          { check_in: { lte: from }, check_out: { gte: to } },
        ],
      },
      include: {
        property: { select: { nom: true } },
        guest: { select: { prenom: true, nom: true } },
      },
    }),
    db.cleaningTask.findMany({
      where: {
        property_id: { in: propertyIds },
        date_prevue: { gte: from, lte: to },
      },
      include: { property: { select: { nom: true } } },
    }),
    db.blockedDate.findMany({
      where: {
        property_id: { in: propertyIds },
        OR: [
          { date_debut: { gte: from, lte: to } },
          { date_fin: { gte: from, lte: to } },
          { date_debut: { lte: from }, date_fin: { gte: to } },
        ],
      },
      include: { property: { select: { nom: true } } },
    }),
  ])

  return { bookings, cleanings, blockedDates }
}
```

- [ ] **Step 4: Créer `apps/portal/lib/dal/messagerie.ts`**

```typescript
import { db } from "@conciergerie/db"
import { revalidatePath } from "next/cache"

export async function getOwnerThreads(ownerId: string) {
  const threads = await db.messageThread.findMany({
    where: { owner_id: ownerId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { author_type: "USER", lu_at: null },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  return threads
}

export async function getOwnerThread(ownerId: string, threadId: string) {
  const thread = await db.messageThread.findFirst({
    where: { id: threadId, owner_id: ownerId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          attachments: {
            select: { id: true, nom: true, mime_type: true },
          },
        },
      },
    },
  })
  if (!thread) return null

  // Mark unread gestionnaire messages as read
  await db.message.updateMany({
    where: {
      thread_id: threadId,
      author_type: "USER",
      lu_at: null,
    },
    data: { lu_at: new Date() },
  })
  revalidatePath("/messagerie")

  return thread
}

export async function sendOwnerMessage(
  ownerId: string,
  threadId: string,
  contenu: string
) {
  // Verify thread ownership
  const thread = await db.messageThread.findFirst({
    where: { id: threadId, owner_id: ownerId },
  })
  if (!thread) throw new Error("Thread introuvable")

  const message = await db.message.create({
    data: {
      thread_id: threadId,
      author_type: "OWNER",
      author_id: ownerId,
      contenu,
    },
  })

  await db.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  return message
}
```

- [ ] **Step 5: Créer `apps/portal/app/(protected)/messagerie/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { sendOwnerMessage } from "@/lib/dal/messagerie"
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

  // Notify gestionnaire (company inbox)
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
  return { success: true }
}
```

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/ apps/portal/app/\(protected\)/messagerie/actions.ts
git commit -m "feat(portal): DAL revenus/documents/planning/messagerie + sendOwnerMessageAction"
```

---

## Task 3 — Layout : Header + BottomNav + Sidebar

**Files:**
- Create: `apps/portal/components/layout/portal-header.tsx`
- Create: `apps/portal/components/layout/bottom-nav.tsx`
- Create: `apps/portal/components/layout/sidebar-nav.tsx`
- Modify: `apps/portal/app/(protected)/layout.tsx`

- [ ] **Step 1: Créer `apps/portal/components/layout/portal-header.tsx`**

```tsx
import { auth } from "@/auth"
import { Bell } from "lucide-react"

export async function PortalHeader() {
  const session = await auth()
  const prenom = session?.user?.name?.split(" ")[0] ?? "Propriétaire"

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border flex items-center justify-between px-4 h-14 lg:px-6">
      <span className="font-serif text-lg text-garrigue-900 tracking-wide">ERA</span>
      <span className="text-sm text-garrigue-500 hidden sm:block">
        Bonjour, <span className="text-garrigue-900 font-medium">{prenom}</span>
      </span>
      <button
        aria-label="Notifications"
        className="p-2 rounded-full hover:bg-calcaire-100 transition-colors text-garrigue-500"
      >
        <Bell size={20} />
      </button>
    </header>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/components/layout/bottom-nav.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, TrendingUp, FileText, MessageCircle } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Mes biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border lg:hidden">
      <ul className="flex h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center h-full gap-1 text-xs transition-colors ${
                  active
                    ? "text-olivier-600 bg-olivier-50"
                    : "text-garrigue-400 hover:text-garrigue-700"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 3: Créer `apps/portal/components/layout/sidebar-nav.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, TrendingUp, FileText, MessageCircle, Calendar } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Mes biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
  { href: "/planning", icon: Calendar, label: "Planning" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-border min-h-screen pt-6">
      <div className="px-6 mb-8">
        <span className="font-serif text-2xl text-garrigue-900 tracking-wide">ERA</span>
        <p className="text-xs text-garrigue-400 mt-1">Espace Propriétaire</p>
      </div>
      <nav>
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-olivier-50 text-olivier-600"
                      : "text-garrigue-500 hover:bg-calcaire-100 hover:text-garrigue-900"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
```

- [ ] **Step 4: Réécrire `apps/portal/app/(protected)/layout.tsx`**

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
      <SidebarNav />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/layout/ apps/portal/app/\(protected\)/layout.tsx
git commit -m "feat(portal): layout header + bottom-nav + sidebar"
```

---

## Task 4 — Dashboard (SoldeCard + EventCard + AlertBanner + page)

**Files:**
- Create: `apps/portal/components/dashboard/solde-card.tsx`
- Create: `apps/portal/components/dashboard/event-card.tsx`
- Create: `apps/portal/components/dashboard/alert-banner.tsx`
- Modify: `apps/portal/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/dashboard/solde-card.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"

interface SoldeCardProps {
  solde: number
  sequestre: number
  dernierVirement: { montant: number; date: Date } | null
}

export function SoldeCard({ solde, sequestre, dernierVirement }: SoldeCardProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl p-4 shadow-soft col-span-1"
      >
        <p className="text-xs text-garrigue-400 mb-1">Solde disponible</p>
        <p className="font-serif text-2xl text-garrigue-900">{fmt(solde)}</p>
        {sequestre > 0 && (
          <p className="text-xs text-garrigue-400 mt-1">{fmt(sequestre)} en séquestre</p>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="bg-white rounded-xl p-4 shadow-soft col-span-1"
      >
        <p className="text-xs text-garrigue-400 mb-1">Dernier virement</p>
        {dernierVirement ? (
          <>
            <p className="font-serif text-xl text-garrigue-900">{fmt(dernierVirement.montant)}</p>
            <p className="text-xs text-garrigue-400 mt-1">
              le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
              }).format(dernierVirement.date)}
            </p>
          </>
        ) : (
          <p className="text-sm text-garrigue-400">Aucun virement</p>
        )}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/components/dashboard/event-card.tsx`**

```tsx
import { ArrowDown, ArrowUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface EventCardProps {
  type: "checkin" | "checkout"
  propertyName: string
  date: Date
}

export function EventCard({ type, propertyName, date }: EventCardProps) {
  const isCheckin = type === "checkin"
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: fr })

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-soft flex items-center gap-3">
      <div
        className={`p-2 rounded-full ${
          isCheckin ? "bg-olivier-50 text-olivier-600" : "bg-garrigue-50 text-garrigue-500"
        }`}
      >
        {isCheckin ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-garrigue-900 truncate">
          {isCheckin ? "Arrivée" : "Départ"} — {propertyName}
        </p>
        <p className="text-xs text-garrigue-400 capitalize">{relative}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Créer `apps/portal/components/dashboard/alert-banner.tsx`**

```tsx
import { AlertTriangle } from "lucide-react"

interface Alert {
  id: string
  message: string
}

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          {alerts.map((a) => (
            <p key={a.id} className="text-sm text-amber-800">
              {a.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Réécrire `apps/portal/app/(protected)/dashboard/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerWithAccount } from "@/lib/dal/owner"
import { getOwnerProperties } from "@/lib/dal/properties"
import { db } from "@conciergerie/db"
import { SoldeCard } from "@/components/dashboard/solde-card"
import { EventCard } from "@/components/dashboard/event-card"
import { AlertBanner } from "@/components/dashboard/alert-banner"

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const ownerId = session.user.ownerId
  const prenom = session.user.name?.split(" ")[0] ?? "Propriétaire"

  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [owner, properties] = await Promise.all([
    getOwnerWithAccount(ownerId),
    getOwnerProperties(ownerId),
  ])

  // Prochains check-ins / check-outs (7 jours glissants)
  const propertyIds = properties.map((p) => p.id)
  const upcomingBookings =
    propertyIds.length > 0
      ? await db.booking.findMany({
          where: {
            property_id: { in: propertyIds },
            statut: { in: ["CONFIRMED", "CHECKEDIN"] },
            OR: [
              { check_in: { gte: now, lte: in7days } },
              { check_out: { gte: now, lte: in7days } },
            ],
          },
          include: { property: { select: { nom: true } } },
          orderBy: { check_in: "asc" },
          take: 5,
        })
      : []

  const account = owner?.mandantAccount
  const lastReport = account?.reports?.[0]
  const dernierVirement = lastReport
    ? { montant: lastReport.montant_reverse, date: lastReport.date_virement ?? lastReport.createdAt }
    : null

  // Alertes : documents expirant + factures impayées
  const alerts: { id: string; message: string }[] = []
  for (const doc of owner?.documents ?? []) {
    const daysLeft = doc.date_expiration
      ? Math.round((doc.date_expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null
    if (daysLeft !== null) {
      alerts.push({
        id: doc.id,
        message: `${doc.nom} expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`,
      })
    }
  }
  for (const inv of owner?.feeInvoices ?? []) {
    alerts.push({ id: inv.id, message: `Facture d'honoraires en attente de paiement` })
  }

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-garrigue-900">Bonjour, {prenom}</h1>
        <p className="text-sm text-garrigue-400 capitalize mt-0.5">{today}</p>
      </div>

      <SoldeCard
        solde={account?.solde_courant ?? 0}
        sequestre={account?.solde_sequestre ?? 0}
        dernierVirement={dernierVirement}
      />

      {upcomingBookings.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-garrigue-400 uppercase tracking-wider mb-2">
            Prochains événements
          </h2>
          <div className="space-y-2">
            {upcomingBookings.map((b) => {
              const isCheckin = b.check_in >= now && b.check_in <= in7days
              return (
                <EventCard
                  key={b.id}
                  type={isCheckin ? "checkin" : "checkout"}
                  propertyName={b.property.nom}
                  date={isCheckin ? b.check_in : b.check_out}
                />
              )
            })}
          </div>
        </section>
      )}

      <AlertBanner alerts={alerts} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/dashboard/ apps/portal/app/\(protected\)/dashboard/page.tsx
git commit -m "feat(portal): dashboard SoldeCard + EventCard + AlertBanner"
```

---

## Task 5 — Mes Biens (liste + détail)

**Files:**
- Create: `apps/portal/components/biens/property-card.tsx`
- Create: `apps/portal/app/(protected)/biens/page.tsx`
- Create: `apps/portal/app/(protected)/biens/[id]/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/biens/property-card.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PropertyCardProps {
  id: string
  nom: string
  ville: string
  tauxOccupation: number
  prochaineresa: { check_in: Date; check_out: Date } | null
}

export function PropertyCard({ id, nom, ville, tauxOccupation, prochaineresa }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif text-lg text-garrigue-900">{nom}</h3>
          <div className="flex items-center gap-1 text-xs text-garrigue-400 mt-0.5">
            <MapPin size={12} />
            {ville}
          </div>
        </div>
        <span className="text-xs bg-olivier-50 text-olivier-600 px-2 py-1 rounded-full font-medium shrink-0">
          Actif
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-garrigue-400">Taux occ. ce mois</p>
          <p className="text-lg font-semibold text-garrigue-900 mt-0.5">{tauxOccupation}%</p>
        </div>
        <div>
          <p className="text-xs text-garrigue-400">Prochaine résa</p>
          <p className="text-sm text-garrigue-700 mt-0.5">
            {prochaineresa
              ? `${format(prochaineresa.check_in, "d MMM", { locale: fr })} – ${format(prochaineresa.check_out, "d MMM", { locale: fr })}`
              : "Aucune"}
          </p>
        </div>
      </div>
      <Link
        href={`/biens/${id}`}
        className="flex items-center gap-1 text-sm text-olivier-600 font-medium hover:text-olivier-500 transition-colors"
      >
        Voir le détail <ArrowRight size={14} />
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/app/(protected)/biens/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerProperties } from "@/lib/dal/properties"
import { PropertyCard } from "@/components/biens/property-card"
import { Building2 } from "lucide-react"

export default async function BienListPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const properties = await getOwnerProperties(session.user.ownerId)

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-serif text-2xl text-garrigue-900">Mes biens</h1>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <Building2 size={40} />
          <p className="text-sm">Aucun bien actif</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              nom={p.nom}
              ville={p.ville ?? ""}
              tauxOccupation={p.tauxOccupation}
              prochaineresa={p.prochaineresa}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Créer `apps/portal/app/(protected)/biens/[id]/page.tsx`**

```tsx
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOwnerPropertyById } from "@/lib/dal/properties"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function BienDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const property = await getOwnerPropertyById(session.user.ownerId, params.id)
  if (!property) notFound()

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const recentBookings = property.bookings.slice(0, 3)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/biens" className="text-garrigue-400 hover:text-garrigue-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl text-garrigue-900">{property.nom}</h1>
      </div>

      {/* Infos */}
      <div className="bg-white rounded-xl p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-calcaire-100 rounded-lg">
            <Home size={20} className="text-garrigue-500" />
          </div>
          <div>
            <p className="font-medium text-garrigue-900">{property.nom}</p>
            {property.ville && <p className="text-sm text-garrigue-400">{property.ville}</p>}
            {property.superficie && (
              <p className="text-sm text-garrigue-400">{property.superficie} m²</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-garrigue-400 mb-1">Revenus du mois</p>
          <p className="font-serif text-xl text-garrigue-900">{fmt(property.revenusThisMonth)}</p>
        </div>
      </div>

      {/* 3 dernières réservations */}
      {recentBookings.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-garrigue-400 uppercase tracking-wider mb-3">
            Réservations récentes
          </h2>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl px-4 py-3 shadow-soft flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {b.guest.prenom} {b.guest.nom}
                  </p>
                  <p className="text-xs text-garrigue-400">
                    {format(b.check_in, "d MMM", { locale: fr })} →{" "}
                    {format(b.check_out, "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    b.statut === "CONFIRMED"
                      ? "bg-blue-50 text-blue-600"
                      : b.statut === "CHECKEDIN"
                        ? "bg-emerald-50 text-emerald-600"
                        : b.statut === "CHECKEDOUT"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {b.statut === "CONFIRMED"
                    ? "Confirmé"
                    : b.statut === "CHECKEDIN"
                      ? "En cours"
                      : b.statut === "CHECKEDOUT"
                        ? "Terminé"
                        : b.statut}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/biens/ apps/portal/app/\(protected\)/biens/
git commit -m "feat(portal): mes biens — liste + détail"
```

---

## Task 6 — Revenus

**Files:**
- Create: `apps/portal/components/revenus/revenus-table.tsx`
- Create: `apps/portal/app/(protected)/revenus/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/revenus/revenus-table.tsx`**

```tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronDown, ChevronUp, Download } from "lucide-react"

interface Report {
  id: string
  periode_debut: Date
  periode_fin: Date
  revenus_sejours: number
  honoraires_deduits: number
  montant_reverse: number
  document_id: string | null
}

interface RevenusTableProps {
  reports: Report[]
}

export function RevenusTable({ reports }: RevenusTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const totals = reports.reduce(
    (acc, r) => ({
      revenus: acc.revenus + r.revenus_sejours,
      honoraires: acc.honoraires + r.honoraires_deduits,
      reverse: acc.reverse + r.montant_reverse,
    }),
    { revenus: 0, honoraires: 0, reverse: 0 }
  )

  if (reports.length === 0) {
    return <p className="text-sm text-garrigue-400 text-center py-8">Aucun compte-rendu disponible</p>
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-calcaire-100 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-garrigue-900 capitalize">
                {format(r.periode_debut, "MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-xs text-garrigue-400 mt-0.5">
                {fmt(r.revenus_sejours)} revenus
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-garrigue-900 text-sm">{fmt(r.montant_reverse)}</span>
              {expanded === r.id ? (
                <ChevronUp size={16} className="text-garrigue-400" />
              ) : (
                <ChevronDown size={16} className="text-garrigue-400" />
              )}
            </div>
          </button>

          {expanded === r.id && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-garrigue-400">Revenus</p>
                  <p className="text-sm font-medium text-garrigue-900">{fmt(r.revenus_sejours)}</p>
                </div>
                <div>
                  <p className="text-xs text-garrigue-400">Honoraires</p>
                  <p className="text-sm font-medium text-red-500">−{fmt(Math.abs(r.honoraires_deduits))}</p>
                </div>
                <div>
                  <p className="text-xs text-garrigue-400">Reversé</p>
                  <p className="text-sm font-medium text-olivier-600">{fmt(r.montant_reverse)}</p>
                </div>
              </div>
              {r.document_id && (
                <a
                  href={`/api/pdf/crg/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-olivier-600 hover:text-olivier-500 transition-colors mt-2"
                >
                  <Download size={14} />
                  Télécharger le CRG
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Total row */}
      <div className="bg-garrigue-50 rounded-xl px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-garrigue-900">Total</p>
        <div className="flex gap-6 text-sm">
          <span className="text-garrigue-600">{fmt(totals.revenus)}</span>
          <span className="text-red-500">−{fmt(Math.abs(totals.honoraires))}</span>
          <span className="font-semibold text-olivier-600">{fmt(totals.reverse)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/app/(protected)/revenus/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerReports } from "@/lib/dal/revenus"
import { RevenusTable } from "@/components/revenus/revenus-table"

export default async function RevenusPage({
  searchParams,
}: {
  searchParams: { annee?: string }
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const currentYear = new Date().getFullYear()
  const selectedYear = searchParams.annee ? Number(searchParams.annee) : currentYear
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const reports = await getOwnerReports(session.user.ownerId, selectedYear)

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-garrigue-900">Vos revenus</h1>
        <select
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-white text-garrigue-700"
          defaultValue={selectedYear}
          onChange={() => {}} // handled by form/link below
          aria-label="Filtrer par année"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <RevenusTable reports={reports} />
    </div>
  )
}
```

**Note:** Le filtre d'année doit être un `<form>` avec `<select>` natif et `<button type="submit">` pour être compatible Server Components. Remplacer le select ci-dessus par :

```tsx
// Dans revenus/page.tsx, remplacer le select par :
<form method="GET" className="flex items-center gap-2">
  <select
    name="annee"
    className="text-sm border border-border rounded-md px-3 py-1.5 bg-white text-garrigue-700"
    defaultValue={selectedYear}
    aria-label="Filtrer par année"
  >
    {years.map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>
  <button type="submit" className="text-sm text-olivier-600 hover:text-olivier-500">
    OK
  </button>
</form>
```

- [ ] **Step 3: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/revenus/ apps/portal/app/\(protected\)/revenus/
git commit -m "feat(portal): page revenus avec RevenusTable"
```

---

## Task 7 — Documents

**Files:**
- Create: `apps/portal/components/documents/document-card.tsx`
- Create: `apps/portal/app/(protected)/documents/actions.ts`
- Create: `apps/portal/app/(protected)/documents/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/documents/document-card.tsx`**

```tsx
"use client"

import { useState } from "react"
import { FileText, Download, AlertTriangle } from "lucide-react"
import { getDocumentViewUrlAction } from "@/app/(protected)/documents/actions"

type DocumentType =
  | "MANDAT" | "AVENANT" | "FACTURE" | "CRG"
  | "ATTESTATION_FISCALE" | "DIAGNOSTIC" | "AUTRE"

interface DocumentCardProps {
  id: string
  nom: string
  type: DocumentType
  createdAt: Date
  date_expiration: Date | null
}

function getExpiryBadge(dateExp: Date | null): { label: string; cls: string } | null {
  if (!dateExp) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateExp)
  exp.setHours(0, 0, 0, 0)
  const days = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: "Expiré", cls: "bg-red-50 text-red-600 border-red-200" }
  if (days <= 30) return { label: `Expire dans ${days}j`, cls: "bg-amber-50 text-amber-700 border-amber-200" }
  return null
}

const TYPE_LABELS: Record<DocumentType, string> = {
  MANDAT: "Mandat",
  AVENANT: "Avenant",
  FACTURE: "Facture",
  CRG: "CRG",
  ATTESTATION_FISCALE: "Attestation fiscale",
  DIAGNOSTIC: "Diagnostic",
  AUTRE: "Autre",
}

export function DocumentCard({ id, nom, type, createdAt, date_expiration }: DocumentCardProps) {
  const [loading, setLoading] = useState(false)
  const expiryBadge = getExpiryBadge(date_expiration)

  const handleDownload = async () => {
    setLoading(true)
    const result = await getDocumentViewUrlAction(id)
    setLoading(false)
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-soft flex items-center gap-3">
      <div className="p-2 bg-calcaire-100 rounded-lg shrink-0">
        <FileText size={18} className="text-garrigue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-garrigue-900 truncate">{nom}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-garrigue-400">{TYPE_LABELS[type]}</span>
          <span className="text-xs text-garrigue-300">·</span>
          <span className="text-xs text-garrigue-400">
            {new Intl.DateTimeFormat("fr-FR").format(createdAt)}
          </span>
          {expiryBadge && (
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${expiryBadge.cls}`}>
              <AlertTriangle size={10} />
              {expiryBadge.label}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        aria-label={`Télécharger ${nom}`}
        className="p-2 rounded-full hover:bg-calcaire-100 transition-colors text-garrigue-400 disabled:opacity-50"
      >
        <Download size={16} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/app/(protected)/documents/actions.ts`**

```typescript
"use server"

import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { getPresignedDownloadUrl } from "@conciergerie/storage"

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const doc = await db.document.findUnique({ where: { id } })
  if (!doc) return { error: "Document introuvable" }

  // Security: only owner's own documents
  if (doc.owner_id !== session.user.ownerId) return { error: "Accès refusé" }

  const publicBase = process.env.S3_PUBLIC_URL
  if (publicBase && doc.url_storage.startsWith(publicBase)) {
    return { url: doc.url_storage }
  }

  try {
    const urlParts = new URL(doc.url_storage)
    const key = urlParts.pathname.replace(/^\/[^/]+\//, "")
    const url = await getPresignedDownloadUrl(key, 900)
    return { url }
  } catch {
    return { url: doc.url_storage }
  }
}
```

- [ ] **Step 3: Créer `apps/portal/app/(protected)/documents/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerDocuments } from "@/lib/dal/documents"
import { DocumentCard } from "@/components/documents/document-card"
import type { DocumentType } from "@conciergerie/db"
import { FileText } from "lucide-react"

const FILTER_TYPES: DocumentType[] = [
  "MANDAT", "AVENANT", "FACTURE", "CRG",
  "ATTESTATION_FISCALE", "DIAGNOSTIC", "AUTRE",
]

const TYPE_LABELS: Record<DocumentType, string> = {
  MANDAT: "Mandat", AVENANT: "Avenant", FACTURE: "Facture",
  CRG: "CRG", ATTESTATION_FISCALE: "Fiscal", DIAGNOSTIC: "Diagnostic", AUTRE: "Autre",
  DEVIS: "Devis", ETAT_LIEUX: "État des lieux", PHOTO: "Photo",
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const activeType = (searchParams.type as DocumentType) ?? undefined
  const documents = await getOwnerDocuments(session.user.ownerId, activeType)

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-serif text-2xl text-garrigue-900">Documents</h1>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/documents"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !activeType
              ? "bg-olivier-600 text-white border-olivier-600"
              : "bg-white text-garrigue-500 border-border hover:border-olivier-400"
          }`}
        >
          Tous
        </a>
        {FILTER_TYPES.map((t) => (
          <a
            key={t}
            href={`/documents?type=${t}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeType === t
                ? "bg-olivier-600 text-white border-olivier-600"
                : "bg-white text-garrigue-500 border-border hover:border-olivier-400"
            }`}
          >
            {TYPE_LABELS[t]}
          </a>
        ))}
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <FileText size={40} />
          <p className="text-sm">Aucun document</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <DocumentCard
              key={d.id}
              id={d.id}
              nom={d.nom}
              type={d.type as DocumentType}
              createdAt={d.createdAt}
              date_expiration={d.date_expiration}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/documents/ apps/portal/app/\(protected\)/documents/
git commit -m "feat(portal): documents — browser + download action sécurisé"
```

---

## Task 8 — Messagerie

**Files:**
- Create: `apps/portal/components/messagerie/message-bubble.tsx`
- Create: `apps/portal/components/messagerie/message-form.tsx`
- Create: `apps/portal/app/(protected)/messagerie/page.tsx`
- Create: `apps/portal/app/(protected)/messagerie/[id]/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/messagerie/message-bubble.tsx`**

```tsx
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { FileText } from "lucide-react"

interface Attachment {
  id: string
  nom: string
  mime_type: string
}

interface MessageBubbleProps {
  contenu: string
  authorType: "USER" | "OWNER"
  createdAt: Date
  attachments: Attachment[]
}

export function MessageBubble({ contenu, authorType, createdAt, attachments }: MessageBubbleProps) {
  const isOwner = authorType === "OWNER"

  return (
    <div className={`flex ${isOwner ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] space-y-1 ${
          isOwner ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwner
              ? "bg-olivier-100 text-garrigue-900 rounded-br-sm"
              : "bg-argile-300/30 text-garrigue-900 rounded-bl-sm"
          }`}
        >
          {contenu}
        </div>
        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 text-xs text-garrigue-400"
              >
                <FileText size={12} />
                <span className="truncate max-w-[200px]">{a.nom}</span>
              </div>
            ))}
          </div>
        )}
        <p className={`text-xs text-garrigue-300 ${isOwner ? "text-right" : ""}`}>
          {format(createdAt, "d MMM à HH:mm", { locale: fr })}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/components/messagerie/message-form.tsx`**

```tsx
"use client"

import { useState, useTransition } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendOwnerMessageAction } from "@/app/(protected)/messagerie/actions"

export function MessageForm({ threadId }: { threadId: string }) {
  const [contenu, setContenu] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contenu.trim()) return
    const msg = contenu.trim()
    setContenu("")
    startTransition(async () => {
      const result = await sendOwnerMessageAction(threadId, msg)
      if (result.error) {
        toast.error(result.error)
        setContenu(msg) // restore on error
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 border-t border-border bg-white"
    >
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Votre message…"
        rows={2}
        className="flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm text-garrigue-900 bg-calcaire-100 focus:outline-none focus:border-olivier-400 placeholder:text-garrigue-300"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
          }
        }}
      />
      <button
        type="submit"
        disabled={isPending || !contenu.trim()}
        aria-label="Envoyer"
        className="p-3 bg-olivier-600 text-white rounded-xl hover:bg-olivier-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Créer `apps/portal/app/(protected)/messagerie/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerThreads } from "@/lib/dal/messagerie"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { MessageCircle } from "lucide-react"

export default async function MessageriePage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const threads = await getOwnerThreads(session.user.ownerId)

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-serif text-2xl text-garrigue-900">Messages</h1>

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
                className="block bg-white rounded-xl px-4 py-3 shadow-soft hover:shadow-hover transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${unread > 0 ? "font-semibold text-garrigue-900" : "font-medium text-garrigue-700"}`}>
                    {t.subject}
                  </p>
                  {unread > 0 && (
                    <span className="shrink-0 text-xs bg-olivier-600 text-white rounded-full px-2 py-0.5 font-medium">
                      {unread}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-xs text-garrigue-400 mt-1 truncate">
                    {lastMessage.contenu}
                  </p>
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

- [ ] **Step 4: Créer `apps/portal/app/(protected)/messagerie/[id]/page.tsx`**

```tsx
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOwnerThread } from "@/lib/dal/messagerie"
import { MessageBubble } from "@/components/messagerie/message-bubble"
import { MessageForm } from "@/components/messagerie/message-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const thread = await getOwnerThread(session.user.ownerId, params.id)
  if (!thread) notFound()

  return (
    <div className="flex flex-col max-w-2xl h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header thread */}
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <Link href="/messagerie" className="text-garrigue-400 hover:text-garrigue-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-serif text-lg text-garrigue-900 truncate">{thread.subject}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {thread.messages.map((m) => (
          <MessageBubble
            key={m.id}
            contenu={m.contenu}
            authorType={m.author_type}
            createdAt={m.createdAt}
            attachments={m.attachments}
          />
        ))}
      </div>

      {/* Form */}
      <div className="shrink-0 -mx-4 lg:-mx-8">
        <MessageForm threadId={thread.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/messagerie/ apps/portal/app/\(protected\)/messagerie/\[id\]/
git commit -m "feat(portal): messagerie — liste threads + conversation + envoi"
```

---

## Task 9 — Planning + Build + Push

**Files:**
- Create: `apps/portal/components/planning/calendar-portal.tsx`
- Create: `apps/portal/app/(protected)/planning/page.tsx`

- [ ] **Step 1: Créer `apps/portal/components/planning/calendar-portal.tsx`**

```tsx
"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const BOOKING_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  CHECKEDIN: "#3b82f6",
  CHECKEDOUT: "#9ca3af",
}

interface PortalBooking {
  id: string
  check_in: Date
  check_out: Date
  statut: string
  property: { nom: string }
  guest: { prenom: string; nom: string }
}

interface PortalCleaning {
  id: string
  date_prevue: Date
  property: { nom: string }
}

interface PortalBlockedDate {
  id: string
  date_debut: Date
  date_fin: Date
  notes: string | null
  property: { nom: string }
}

interface CalendarPortalProps {
  bookings: PortalBooking[]
  cleanings: PortalCleaning[]
  blockedDates: PortalBlockedDate[]
}

interface CalEvent extends Event {
  id: string
  color: string
}

export function CalendarPortal({ bookings, cleanings, blockedDates }: CalendarPortalProps) {
  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = []

    for (const b of bookings) {
      result.push({
        id: b.id,
        title: `${b.guest.prenom} ${b.guest.nom} — ${b.property.nom}`,
        start: new Date(b.check_in),
        end: new Date(b.check_out),
        color: BOOKING_COLORS[b.statut] ?? "#3b82f6",
      })
    }

    for (const c of cleanings) {
      const start = new Date(c.date_prevue)
      const end = new Date(start)
      end.setHours(end.getHours() + 3)
      result.push({
        id: c.id,
        title: `Ménage — ${c.property.nom}`,
        start,
        end,
        color: "#7dd3fc",
      })
    }

    for (const bl of blockedDates) {
      result.push({
        id: bl.id,
        title: bl.notes || `Indisponible — ${bl.property.nom}`,
        start: new Date(bl.date_debut),
        end: new Date(bl.date_fin),
        color: "#6b7280",
      })
    }

    return result
  }, [bookings, cleanings, blockedDates])

  return (
    <div className="bg-white rounded-xl shadow-soft p-4" style={{ height: 600 }}>
      <Calendar<CalEvent>
        localizer={localizer}
        events={events}
        defaultView="month"
        views={["month", "week"]}
        culture="fr"
        messages={{
          month: "Mois",
          week: "Semaine",
          today: "Aujourd'hui",
          previous: "Préc.",
          next: "Suiv.",
        }}
        eventPropGetter={(event) => ({
          style: { backgroundColor: event.color, borderColor: event.color, color: "#fff" },
        })}
        style={{ height: "100%" }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Créer `apps/portal/app/(protected)/planning/page.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerPlanningEvents } from "@/lib/dal/planning"
import { CalendarPortal } from "@/components/planning/calendar-portal"

export default async function PlanningPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  const { bookings, cleanings, blockedDates } = await getOwnerPlanningEvents(
    session.user.ownerId,
    from,
    to
  )

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-garrigue-900">Planning</h1>
      <CalendarPortal bookings={bookings} cleanings={cleanings} blockedDates={blockedDates} />
    </div>
  )
}
```

- [ ] **Step 3: Type-check + build**

```bash
cd C:/Developpement/conciergerie/apps/portal && npx tsc --noEmit 2>&1 | head -40
```
Corriger les éventuelles erreurs de types avant de continuer.

```bash
cd C:/Developpement/conciergerie && pnpm --filter @conciergerie/portal build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit final**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/planning/ apps/portal/app/\(protected\)/planning/
git commit -m "feat(portal): planning calendar + build final portail propriétaire"
```

- [ ] **Step 5: Push**

```bash
cd C:/Developpement/conciergerie && git push origin main
```

---

## Récapitulatif fichiers

| Tâche | Nouveaux fichiers | Modifiés |
|---|---|---|
| 1 | `lib/dal/owner.ts`, `lib/dal/properties.ts` | `package.json`, `tailwind.config.ts` |
| 2 | `lib/dal/revenus.ts`, `documents.ts`, `planning.ts`, `messagerie.ts`, `messagerie/actions.ts` | — |
| 3 | `components/layout/portal-header.tsx`, `bottom-nav.tsx`, `sidebar-nav.tsx` | `(protected)/layout.tsx` |
| 4 | `components/dashboard/solde-card.tsx`, `event-card.tsx`, `alert-banner.tsx` | `dashboard/page.tsx` |
| 5 | `components/biens/property-card.tsx`, `biens/page.tsx`, `biens/[id]/page.tsx` | — |
| 6 | `components/revenus/revenus-table.tsx`, `revenus/page.tsx` | — |
| 7 | `components/documents/document-card.tsx`, `documents/actions.ts`, `documents/page.tsx` | — |
| 8 | `components/messagerie/message-bubble.tsx`, `message-form.tsx`, `messagerie/page.tsx`, `messagerie/[id]/page.tsx` | — |
| 9 | `components/planning/calendar-portal.tsx`, `planning/page.tsx` | — |
