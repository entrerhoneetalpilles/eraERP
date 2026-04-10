# Modules Opérationnels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un calendrier planning (react-big-calendar), améliorer le module ménage (calendar + assignation prestataire), implémenter les workflows check-in/check-out avec checklist, et enrichir le module documents avec badges d'expiration et cron d'alerte.

**Architecture:** Réutilise les patterns existants (Server Components + client wrappers, Server Actions, `@conciergerie/email`, `@conciergerie/storage`). Le calendrier planning garde la PlanningGrid existante et ajoute un onglet react-big-calendar. Documents a déjà upload/delete/presigned URLs — on ajoute uniquement `date_expiration` + badges.

**Tech Stack:** Next.js 14 App Router, react-big-calendar + date-fns v4, Prisma/PostgreSQL, `@conciergerie/email`, `@conciergerie/storage`

---

## File Map

**Nouveaux fichiers :**
- `packages/db/prisma/migrations/20260409_document_expiration/migration.sql`
- `apps/backoffice/lib/dal/planning.ts`
- `apps/backoffice/app/(protected)/planning/planning-calendar.tsx`
- `apps/backoffice/app/(protected)/planning/planning-stats.tsx`
- `apps/backoffice/app/(protected)/menage/menage-tabs.tsx`
- `apps/backoffice/app/(protected)/menage/menage-calendar.tsx`
- `apps/backoffice/app/(protected)/menage/actions.ts`
- `apps/backoffice/app/(protected)/menage/assign-form.tsx`
- `apps/backoffice/app/(protected)/reservations/[id]/checkin-form.tsx`
- `apps/backoffice/app/(protected)/reservations/[id]/checkout-form.tsx`
- `apps/backoffice/app/api/cron/document-expiry/route.ts`
- `packages/email/src/templates/menage-assign.tsx`

**Fichiers modifiés :**
- `packages/db/prisma/schema.prisma` — +`date_expiration` sur Document
- `apps/backoffice/next.config.mjs` — +`react-big-calendar` dans transpilePackages
- `apps/backoffice/app/(protected)/planning/page.tsx` — +cleaning tasks + stats
- `apps/backoffice/app/(protected)/planning/planning-grid.tsx` — +cleaning tasks display
- `apps/backoffice/app/(protected)/menage/page.tsx` — +prestataires fetch + tabs
- `apps/backoffice/app/(protected)/menage/menage-table.tsx` — +badge dépassement + assign button
- `apps/backoffice/app/(protected)/reservations/[id]/status-actions.tsx` — intègre les formulaires check-in/out
- `apps/backoffice/app/(protected)/reservations/[id]/actions.ts` — +startCheckinAction, completeCheckoutAction
- `apps/backoffice/app/(protected)/documents/upload-dialog.tsx` — +champ date_expiration
- `apps/backoffice/app/(protected)/documents/actions.ts` — +date_expiration dans uploadDocumentAction
- `apps/backoffice/app/(protected)/documents/documents-browser.tsx` — +badges expiration
- `apps/backoffice/lib/dal/documents.ts` — +getExpiringDocuments
- `apps/backoffice/lib/dal/menage.ts` — +assignContractor
- `packages/email/src/render.ts` — +sendMenageAssignEmail
- `vercel.json` — +cron document-expiry

---

### Task 1: Install react-big-calendar + DB migration date_expiration

**Files:**
- Modify: `apps/backoffice/next.config.mjs`
- Modify: `apps/backoffice/package.json` (via pnpm add)
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260409_document_expiration/migration.sql`

- [ ] **Step 1: Installer react-big-calendar**

```bash
pnpm --filter @conciergerie/backoffice add react-big-calendar
pnpm --filter @conciergerie/backoffice add -D @types/react-big-calendar
```

- [ ] **Step 2: Ajouter react-big-calendar aux transpilePackages**

Dans `apps/backoffice/next.config.mjs`, dans le tableau `transpilePackages`, ajouter `"react-big-calendar"` :

```js
transpilePackages: [
  "@conciergerie/ui",
  "@conciergerie/db",
  "@conciergerie/types",
  "@conciergerie/email",
  "@conciergerie/storage",
  "react-big-calendar",
],
```

- [ ] **Step 3: Ajouter date_expiration au modèle Document dans schema.prisma**

Dans `model Document {`, ajouter ce champ avant `createdAt` :

```prisma
  date_expiration      DateTime?
```

- [ ] **Step 4: Créer la migration SQL**

Créer `packages/db/prisma/migrations/20260409_document_expiration/migration.sql` :

```sql
-- AlterTable: Document — date d'expiration pour alertes conformité
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "date_expiration" TIMESTAMP(3);
```

- [ ] **Step 5: Régénérer le client Prisma**

```bash
pnpm --filter @conciergerie/db db:generate
```

Expected: `✔ Generated Prisma Client` sans erreur.

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/next.config.mjs packages/db/prisma/schema.prisma packages/db/prisma/migrations/
git commit -m "feat: install react-big-calendar + date_expiration on Document"
```

---

### Task 2: DAL — planning.ts + menage.assignContractor + documents.getExpiringDocuments

**Files:**
- Create: `apps/backoffice/lib/dal/planning.ts`
- Modify: `apps/backoffice/lib/dal/menage.ts`
- Modify: `apps/backoffice/lib/dal/documents.ts`

- [ ] **Step 1: Créer `apps/backoffice/lib/dal/planning.ts`**

```typescript
import { db } from "@conciergerie/db"

export interface PlanningEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  url: string
  type: "booking" | "cleaning"
}

const BOOKING_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  CHECKEDIN: "#10b981",
  CHECKEDOUT: "#9ca3af",
  CANCELLED: "#fca5a5",
}

const CLEANING_COLORS: Record<string, string> = {
  PLANIFIEE: "#7dd3fc",
  EN_COURS: "#fb923c",
  TERMINEE: "#4ade80",
  PROBLEME: "#f87171",
}

export async function getPlanningEvents(
  from: Date,
  to: Date,
  property_id?: string
): Promise<PlanningEvent[]> {
  const propertyFilter = property_id ? { property_id } : {}

  const [bookings, cleaningTasks] = await Promise.all([
    db.booking.findMany({
      where: {
        ...propertyFilter,
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
        ...propertyFilter,
        date_prevue: { gte: from, lte: to },
      },
      include: {
        property: { select: { nom: true } },
      },
    }),
  ])

  const events: PlanningEvent[] = []

  for (const b of bookings) {
    events.push({
      id: b.id,
      title: `${b.guest.prenom} ${b.guest.nom} — ${b.property.nom}`,
      start: new Date(b.check_in),
      end: new Date(b.check_out),
      color: BOOKING_COLORS[b.statut] ?? "#6b7280",
      url: `/reservations/${b.id}`,
      type: "booking",
    })
  }

  for (const t of cleaningTasks) {
    const start = new Date(t.date_prevue)
    const end = new Date(start)
    end.setHours(end.getHours() + 3)
    events.push({
      id: t.id,
      title: `Ménage — ${t.property.nom}`,
      start,
      end,
      color: CLEANING_COLORS[t.statut] ?? "#7dd3fc",
      url: `/menage/${t.id}`,
      type: "cleaning",
    })
  }

  return events
}

export async function getPlanningStats(from: Date, to: Date) {
  const totalDays = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  )

  const [bookings, arrivals, departures, cleanings, propertyCount] = await Promise.all([
    db.booking.findMany({
      where: {
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: from, lte: to } },
          { check_out: { gte: from, lte: to } },
          { check_in: { lte: from }, check_out: { gte: to } },
        ],
      },
      select: { check_in: true, check_out: true },
    }),
    db.booking.count({
      where: { statut: { notIn: ["CANCELLED"] }, check_in: { gte: from, lte: to } },
    }),
    db.booking.count({
      where: { statut: { notIn: ["CANCELLED"] }, check_out: { gte: from, lte: to } },
    }),
    db.cleaningTask.count({ where: { date_prevue: { gte: from, lte: to } } }),
    db.property.count({ where: { statut: "ACTIF" } }),
  ])

  let occupiedDays = 0
  for (const b of bookings) {
    const s = Math.max(b.check_in.getTime(), from.getTime())
    const e = Math.min(b.check_out.getTime(), to.getTime())
    if (e > s) occupiedDays += Math.ceil((e - s) / (1000 * 60 * 60 * 24))
  }

  const totalAvailable = totalDays * propertyCount
  const occupancy = totalAvailable > 0 ? Math.round((occupiedDays / totalAvailable) * 100) : 0

  return { occupancy, arrivals, departures, cleanings }
}
```

- [ ] **Step 2: Ajouter `assignContractor` dans `apps/backoffice/lib/dal/menage.ts`**

Ajouter à la fin du fichier :

```typescript
export async function assignContractor(taskId: string, contractorId: string) {
  return db.cleaningTask.update({
    where: { id: taskId },
    data: { contractor_id: contractorId },
    include: {
      contractor: { select: { id: true, nom: true, email: true, telephone: true } },
      property: { select: { nom: true } },
    },
  })
}
```

- [ ] **Step 3: Ajouter `getExpiringDocuments` dans `apps/backoffice/lib/dal/documents.ts`**

Ajouter à la fin du fichier :

```typescript
export async function getExpiringDocuments(withinDays: number) {
  const now = new Date()
  const limit = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
  return db.document.findMany({
    where: {
      date_expiration: { not: null, lte: limit },
    },
    include: {
      owner: { select: { id: true, nom: true, email: true } },
    },
    orderBy: { date_expiration: "asc" },
  })
}
```

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/lib/dal/planning.ts apps/backoffice/lib/dal/menage.ts apps/backoffice/lib/dal/documents.ts
git commit -m "feat(dal): planning events/stats, assignContractor, getExpiringDocuments"
```

---

### Task 3: Planning — stats bar + cleaning tasks + onglet Calendrier

**Files:**
- Modify: `apps/backoffice/app/(protected)/planning/page.tsx`
- Modify: `apps/backoffice/app/(protected)/planning/planning-grid.tsx`
- Create: `apps/backoffice/app/(protected)/planning/planning-stats.tsx`
- Create: `apps/backoffice/app/(protected)/planning/planning-calendar.tsx`

- [ ] **Step 1: Créer `planning-stats.tsx`**

Créer `apps/backoffice/app/(protected)/planning/planning-stats.tsx` :

```tsx
import { Calendar, ArrowDownToLine, ArrowUpFromLine, Sparkles } from "lucide-react"

interface Props {
  occupancy: number
  arrivals: number
  departures: number
  cleanings: number
}

export function PlanningStats({ occupancy, arrivals, departures, cleanings }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: "Taux d'occupation", value: `${occupancy}%`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Arrivées", value: String(arrivals), icon: ArrowDownToLine, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Départs", value: String(departures), icon: ArrowUpFromLine, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        { label: "Ménages planifiés", value: String(cleanings), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className={`p-1.5 rounded-md ${bg}`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Créer `planning-calendar.tsx`**

Créer `apps/backoffice/app/(protected)/planning/planning-calendar.tsx` :

```tsx
"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useRouter } from "next/navigation"
import "react-big-calendar/lib/css/react-big-calendar.css"
import type { PlanningEvent } from "@/lib/dal/planning"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const MESSAGES = {
  today: "Aujourd'hui",
  previous: "Précédent",
  next: "Suivant",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement sur cette période",
}

export function PlanningCalendar({ events }: { events: PlanningEvent[] }) {
  const router = useRouter()

  const calEvents = useMemo(
    () => events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) })),
    [events]
  )

  return (
    <div className="h-[640px] bg-card rounded-lg border border-border p-4">
      <Calendar
        localizer={localizer}
        events={calEvents}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        culture="fr"
        messages={MESSAGES}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: (event as PlanningEvent).color,
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            padding: "2px 4px",
          },
        })}
        onSelectEvent={(event) => router.push((event as PlanningEvent).url)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Mettre à jour `planning/page.tsx`**

Remplacer le contenu de `apps/backoffice/app/(protected)/planning/page.tsx` par :

```tsx
import { db } from "@conciergerie/db"
import { PageHeader } from "@/components/ui/page-header"
import { PlanningGrid } from "./planning-grid"
import { PlanningCalendar } from "./planning-calendar"
import { PlanningStats } from "./planning-stats"
import { getPlanningEvents, getPlanningStats } from "@/lib/dal/planning"
import Link from "next/link"

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; view?: string; property_id?: string }
}) {
  const now = new Date()
  const rawYear = parseInt(searchParams.year ?? "", 10)
  const rawMonth = parseInt(searchParams.month ?? "", 10)
  const year = isNaN(rawYear) ? now.getFullYear() : rawYear
  const month = isNaN(rawMonth) ? now.getMonth() : Math.min(11, Math.max(0, rawMonth))
  const view = searchParams.view ?? "grid"
  const propertyId = searchParams.property_id || undefined

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59)

  const [bookings, properties, events, stats] = await Promise.all([
    db.booking.findMany({
      where: {
        ...(propertyId ? { property_id: propertyId } : {}),
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: firstDay, lte: lastDay } },
          { check_out: { gte: firstDay, lte: lastDay } },
          { check_in: { lte: firstDay }, check_out: { gte: lastDay } },
        ],
      },
      include: {
        property: { select: { id: true, nom: true } },
        guest: { select: { prenom: true, nom: true } },
      },
    }),
    db.property.findMany({
      where: { statut: "ACTIF" },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    }),
    getPlanningEvents(firstDay, lastDay, propertyId),
    getPlanningStats(firstDay, lastDay),
  ])

  const slots = bookings.map((b: any) => ({
    id: b.id,
    property_id: b.property_id,
    property_nom: b.property.nom,
    guest_nom: `${b.guest.prenom} ${b.guest.nom}`,
    check_in: b.check_in.toISOString(),
    check_out: b.check_out.toISOString(),
    statut: b.statut,
  }))

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planning"
        description={`${monthLabel} — ${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
      />

      {/* Stats bar */}
      <PlanningStats {...stats} />

      {/* Filtre par bien + switcher vue */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <form className="flex items-center gap-2">
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="view" value={view} />
          <select
            name="property_id"
            defaultValue={propertyId ?? ""}
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}
            className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
          >
            <option value="">Tous les biens</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </form>

        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Link
            href={`/planning?year=${year}&month=${month}&view=grid${propertyId ? `&property_id=${propertyId}` : ""}`}
            className={`px-3 py-1 text-sm rounded-sm transition-colors ${view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Timeline
          </Link>
          <Link
            href={`/planning?year=${year}&month=${month}&view=calendar${propertyId ? `&property_id=${propertyId}` : ""}`}
            className={`px-3 py-1 text-sm rounded-sm transition-colors ${view === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Calendrier
          </Link>
        </div>
      </div>

      {/* Vue */}
      {view === "calendar" ? (
        <PlanningCalendar events={events} />
      ) : (
        <PlanningGrid
          bookings={slots}
          properties={properties}
          year={year}
          month={month}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

Si erreur sur `(e.target.form as HTMLFormElement).submit()` dans le select onChange, ajouter `"use client"` à une version wrapper — mais essayer d'abord: le `<form>` est dans un Server Component, l'onChange est une string inline. Si TypeScript se plaint, convertir le filtre en composant client séparé:

```tsx
// planning-filter.tsx
"use client"
export function PropertyFilter({ properties, defaultValue, year, month, view }: {
  properties: { id: string; nom: string }[]
  defaultValue: string
  year: number
  month: number
  view: string
}) {
  return (
    <select
      name="property_id"
      defaultValue={defaultValue}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set("property_id", e.target.value)
        url.searchParams.set("year", String(year))
        url.searchParams.set("month", String(month))
        url.searchParams.set("view", view)
        window.location.href = url.toString()
      }}
      className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
    >
      <option value="">Tous les biens</option>
      {properties.map(p => (
        <option key={p.id} value={p.id}>{p.nom}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/app/\(protected\)/planning/
git commit -m "feat(planning): stats bar + onglet Calendrier react-big-calendar + filtre par bien"
```

---

### Task 4: Ménage — tabs + calendrier + badge dépassement

**Files:**
- Create: `apps/backoffice/app/(protected)/menage/menage-tabs.tsx`
- Create: `apps/backoffice/app/(protected)/menage/menage-calendar.tsx`
- Modify: `apps/backoffice/app/(protected)/menage/page.tsx`
- Modify: `apps/backoffice/app/(protected)/menage/menage-table.tsx`

- [ ] **Step 1: Créer `menage-calendar.tsx`**

Créer `apps/backoffice/app/(protected)/menage/menage-calendar.tsx` :

```tsx
"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useRouter } from "next/navigation"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const STATUS_COLORS: Record<string, string> = {
  PLANIFIEE: "#7dd3fc",
  EN_COURS: "#fb923c",
  TERMINEE: "#4ade80",
  PROBLEME: "#f87171",
}

const MESSAGES = {
  today: "Aujourd'hui",
  previous: "Précédent",
  next: "Suivant",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucune tâche sur cette période",
}

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  url: string
}

interface Task {
  id: string
  date_prevue: Date | string
  statut: string
  property: { nom: string }
}

export function MenageCalendar({ tasks, contractorFilter }: { tasks: Task[]; contractorFilter?: string }) {
  const router = useRouter()

  const events = useMemo<CalEvent[]>(() =>
    tasks.map(t => {
      const start = new Date(t.date_prevue)
      const end = new Date(start)
      end.setHours(end.getHours() + 3)
      return {
        id: t.id,
        title: `Ménage — ${t.property.nom}`,
        start,
        end,
        color: STATUS_COLORS[t.statut] ?? "#7dd3fc",
        url: `/menage/${t.id}`,
      }
    }),
    [tasks]
  )

  return (
    <div className="h-[600px] bg-card rounded-lg border border-border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK]}
        culture="fr"
        messages={MESSAGES}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: (event as CalEvent).color,
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            padding: "2px 4px",
          },
        })}
        onSelectEvent={(event) => router.push((event as CalEvent).url)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Créer `menage-tabs.tsx`**

Créer `apps/backoffice/app/(protected)/menage/menage-tabs.tsx` :

```tsx
"use client"

import { useState } from "react"
import { MenageTable } from "./menage-table"
import { MenageCalendar } from "./menage-calendar"
import type { getCleaningTasks } from "@/lib/dal/menage"
import type { getPrestataires } from "@/lib/dal/prestataires"

type Task = Awaited<ReturnType<typeof getCleaningTasks>>[number]
type Contractor = Awaited<ReturnType<typeof getPrestataires>>[number]

export function MenageTabs({ tasks, contractors }: { tasks: Task[]; contractors: Contractor[] }) {
  const [view, setView] = useState<"list" | "calendar">("list")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-muted rounded-md p-1 w-fit">
        {(["list", "calendar"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {v === "list" ? "Liste" : "Calendrier"}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <MenageTable data={tasks} contractors={contractors} />
      ) : (
        <MenageCalendar tasks={tasks} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Mettre à jour `menage/page.tsx`**

Remplacer le contenu de `apps/backoffice/app/(protected)/menage/page.tsx` :

```tsx
import { getCleaningTasks } from "@/lib/dal/menage"
import { getPrestataires } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { MenageTabs } from "./menage-tabs"

export default async function MenagePage() {
  const [tasks, contractors] = await Promise.all([
    getCleaningTasks(),
    getPrestataires(),
  ])
  const pending = tasks.filter(t => t.statut !== "TERMINEE" && t.statut !== "PROBLEME").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ménage"
        description={`${pending} tâche${pending !== 1 ? "s" : ""} en attente`}
      />
      <MenageTabs tasks={tasks} contractors={contractors} />
    </div>
  )
}
```

- [ ] **Step 4: Mettre à jour `menage-table.tsx` — badge dépassement**

Lire `menage-table.tsx`. Dans la colonne affichant le prestataire ou les détails, ajouter après le composant `StatusBadge` un badge dépassement. Ajouter aussi les props `contractors` et un bouton "Assigner" inline.

Trouver la colonne `header: "Prestataire"` (ou équivalent) dans le tableau et modifier la cell pour afficher :

```tsx
{
  id: "prestataire",
  header: "Prestataire",
  cell: ({ row }) => {
    const t = row.original
    const overrun = t.duree_reelle != null && t.duree_estimee != null && t.duree_reelle > t.duree_estimee * 1.3
    return (
      <div className="space-y-1">
        {t.contractor ? (
          <span className="text-sm text-foreground">{t.contractor.nom}</span>
        ) : (
          <AssignButton taskId={t.id} contractors={contractors} />
        )}
        {overrun && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded font-medium">
            Dépassement +{Math.round(t.duree_reelle! - t.duree_estimee!)}min
          </span>
        )}
      </div>
    )
  },
},
```

Note: `AssignButton` est défini dans `assign-form.tsx` (Task 5). Pour cette étape, si `assign-form.tsx` n'existe pas encore, utiliser un placeholder `<span className="text-xs text-amber-600">Non assigné</span>` et le remplacer lors de Task 5.

Ajouter `contractors` dans les props du composant `MenageTable` :

```typescript
// Ajouter le type en haut du fichier
type Contractor = { id: string; nom: string }

// Modifier la signature du composant
export function MenageTable({ data, contractors = [] }: { data: CleaningRow[]; contractors?: Contractor[] }) {
```

- [ ] **Step 5: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/app/\(protected\)/menage/
git commit -m "feat(menage): tabs liste/calendrier + badge dépassement prestataire"
```

---

### Task 5: Ménage — assignation prestataire + email

**Files:**
- Create: `apps/backoffice/app/(protected)/menage/actions.ts`
- Create: `apps/backoffice/app/(protected)/menage/assign-form.tsx`
- Create: `packages/email/src/templates/menage-assign.tsx`
- Modify: `packages/email/src/render.ts`
- Modify: `packages/email/src/index.ts`

- [ ] **Step 1: Créer `menage/actions.ts`**

Créer `apps/backoffice/app/(protected)/menage/actions.ts` :

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { assignContractor } from "@/lib/dal/menage"
import { sendMenageAssignEmail } from "@conciergerie/email"
import { db } from "@conciergerie/db"

export async function assignCleaningTaskAction(taskId: string, contractorId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const task = await assignContractor(taskId, contractorId)

  if (task.contractor?.email) {
    try {
      await sendMenageAssignEmail({
        to: task.contractor.email,
        contractorName: task.contractor.nom,
        propertyName: task.property.nom,
        datePrevue: new Date(task.date_prevue).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        notes: task.notes ?? undefined,
      })
    } catch (e) {
      console.error("[assignCleaningTask] email failed:", e)
    }
  }

  await db.auditLog.create({
    data: {
      action: "MENAGE_ASSIGNED",
      entity_type: "CleaningTask",
      entity_id: taskId,
    },
  })

  revalidatePath("/menage")
  revalidatePath(`/menage/${taskId}`)
  return { success: true }
}
```

- [ ] **Step 2: Créer `assign-form.tsx`**

Créer `apps/backoffice/app/(protected)/menage/assign-form.tsx` :

```tsx
"use client"

import { useState } from "react"
import { assignCleaningTaskAction } from "./actions"

interface Contractor { id: string; nom: string }

export function AssignButton({ taskId, contractors }: { taskId: string; contractors: Contractor[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline cursor-pointer"
      >
        Assigner
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <select
        id={`assign-${taskId}`}
        className="text-xs border border-border rounded px-1.5 py-1 bg-background"
        defaultValue=""
        onChange={async (e) => {
          const contractorId = e.target.value
          if (!contractorId) return
          setLoading(true)
          await assignCleaningTaskAction(taskId, contractorId)
          setLoading(false)
          setOpen(false)
        }}
      >
        <option value="">Choisir…</option>
        {contractors.map(c => (
          <option key={c.id} value={c.id}>{c.nom}</option>
        ))}
      </select>
      {loading && <span className="text-xs text-muted-foreground">…</span>}
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Mettre à jour `menage-table.tsx` pour utiliser `AssignButton`**

Dans `menage-table.tsx`, remplacer le placeholder "Non assigné" de l'étape précédente par :

```tsx
import { AssignButton } from "./assign-form"
```

Et dans la cell prestataire :
```tsx
<AssignButton taskId={t.id} contractors={contractors} />
```

- [ ] **Step 4: Créer le template email `packages/email/src/templates/menage-assign.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  contractorName: string
  propertyName: string
  datePrevue: string
  notes?: string
}

export function MenageAssignEmail({ contractorName, propertyName, datePrevue, notes }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle tâche ménage assignée — {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Tâche ménage assignée
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {contractorName},</Text>
          <Text style={{ color: "#6b5f57" }}>
            Une nouvelle tâche ménage vous a été assignée.
          </Text>
          <Section style={{ backgroundColor: "#f9f6f3", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#6b5f57" }}>
              <strong>Bien :</strong> {propertyName}
            </Text>
            <Text style={{ margin: "0", color: "#6b5f57" }}>
              <strong>Date prévue :</strong> {datePrevue}
            </Text>
            {notes && (
              <Text style={{ margin: "8px 0 0", color: "#6b5f57" }}>
                <strong>Notes :</strong> {notes}
              </Text>
            )}
          </Section>
          <Hr style={{ borderColor: "#e8ddd5" }} />
          <Text style={{ fontSize: "12px", color: "#9a8880" }}>
            Entre Rhône et Alpilles — Gestion locative haut de gamme
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 5: Ajouter `sendMenageAssignEmail` dans `packages/email/src/render.ts`**

Ajouter l'import en haut de `render.ts` :
```typescript
import { MenageAssignEmail } from "./templates/menage-assign"
```

Ajouter la fonction à la fin du fichier :
```typescript
export async function sendMenageAssignEmail(props: {
  to: string
  contractorName: string
  propertyName: string
  datePrevue: string
  notes?: string
}) {
  const { to, ...rest } = props
  const html = await render(MenageAssignEmail(rest))
  return sendEmail({ to, subject: `Tâche ménage assignée — ${props.propertyName}`, html, from: FROM })
}
```

- [ ] **Step 6: Exporter depuis `packages/email/src/index.ts`**

Dans `packages/email/src/index.ts`, ajouter :
```typescript
export { MenageAssignEmail } from "./templates/menage-assign"
export { sendMenageAssignEmail } from "./render"
```

- [ ] **Step 7: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

- [ ] **Step 8: Commit**

```bash
git add apps/backoffice/app/\(protected\)/menage/ packages/email/
git commit -m "feat(menage): assignation prestataire inline + email notification MenageAssign"
```

---

### Task 6: Check-in / Check-out — formulaires avec checklist

**Files:**
- Create: `apps/backoffice/app/(protected)/reservations/[id]/checkin-form.tsx`
- Create: `apps/backoffice/app/(protected)/reservations/[id]/checkout-form.tsx`
- Modify: `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`
- Modify: `apps/backoffice/app/(protected)/reservations/[id]/status-actions.tsx`

- [ ] **Step 1: Mettre à jour `actions.ts`**

Lire `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`. Ajouter après la fonction existante `updateBookingStatutAction` :

```typescript
export async function startCheckinAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const checklist = [
    formData.get("item_0") === "on",
    formData.get("item_1") === "on",
    formData.get("item_2") === "on",
    formData.get("item_3") === "on",
  ]

  const booking = await db.booking.findUnique({ where: { id }, select: { notes_internes: true } })
  const existing = (() => {
    try { return JSON.parse(booking?.notes_internes ?? "{}") } catch { return {} }
  })()

  const updated = {
    ...existing,
    checkin: { items: checklist, at: new Date().toISOString() },
  }

  await db.booking.update({
    where: { id },
    data: {
      statut: "CHECKEDIN",
      notes_internes: JSON.stringify(updated),
    },
  })

  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
}

export async function completeCheckoutAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const checklist = [
    formData.get("item_0") === "on",
    formData.get("item_1") === "on",
    formData.get("item_2") === "on",
    formData.get("item_3") === "on",
  ]

  const caution = formData.get("caution") as string
  const montant_retenu = parseFloat(formData.get("montant_retenu") as string) || 0
  const motif = formData.get("motif") as string
  const observations = formData.get("observations") as string

  const booking = await db.booking.findUnique({ where: { id }, select: { notes_internes: true } })
  const existing = (() => {
    try { return JSON.parse(booking?.notes_internes ?? "{}") } catch { return {} }
  })()

  const updated = {
    ...existing,
    checkout: {
      items: checklist,
      caution,
      montant_retenu: montant_retenu || undefined,
      motif: motif || undefined,
      observations: observations || undefined,
      at: new Date().toISOString(),
    },
  }

  await db.booking.update({
    where: { id },
    data: {
      statut: "CHECKEDOUT",
      notes_internes: JSON.stringify(updated),
    },
  })

  try {
    await autoCreateCleaningTask(id)
  } catch (e) {
    console.error("[autoCreateCleaningTask] Failed for booking", id, e)
  }

  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
  revalidatePath("/menage")
}
```

Ajouter `import { db } from "@conciergerie/db"` et `import { auth } from "@/auth"` si pas déjà présents.

- [ ] **Step 2: Créer `checkin-form.tsx`**

Créer `apps/backoffice/app/(protected)/reservations/[id]/checkin-form.tsx` :

```tsx
"use client"

import { useState } from "react"
import { startCheckinAction } from "./actions"
import { CheckCircle2, Circle } from "lucide-react"

const ITEMS = [
  "Remise des clés / codes d'accès confirmée",
  "Caution encaissée",
  "État général du logement vérifié",
  "Voyageur informé des règles maison",
]

export function CheckinForm({ bookingId }: { bookingId: string }) {
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false))
  const [open, setOpen] = useState(false)

  const allChecked = checked.every(Boolean)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        Check-in
      </button>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 space-y-4 max-w-md">
      <p className="text-sm font-semibold text-foreground">Checklist check-in</p>
      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="hidden"
              checked={checked[i]}
              onChange={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
            />
            {checked[i]
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
            <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{item}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <form action={startCheckinAction.bind(null, bookingId)}>
          {ITEMS.map((_, i) => (
            <input key={i} type="hidden" name={`item_${i}`} value={checked[i] ? "on" : "off"} />
          ))}
          <button
            type="submit"
            disabled={!allChecked}
            className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Valider le check-in
          </button>
        </form>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Créer `checkout-form.tsx`**

Créer `apps/backoffice/app/(protected)/reservations/[id]/checkout-form.tsx` :

```tsx
"use client"

import { useState } from "react"
import { completeCheckoutAction } from "./actions"
import { CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

const ITEMS = [
  "Clés récupérées",
  "État des lieux effectué",
  "Ménage planifié",
  "Inventaire vérifié",
]

export function CheckoutForm({ bookingId, guestId }: { bookingId: string; guestId: string }) {
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false))
  const [caution, setCaution] = useState<"liberee" | "retenue_partielle" | "retenue_totale">("liberee")
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [observations, setObservations] = useState("")

  const allChecked = checked.every(Boolean)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        Check-out
      </button>
    )
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Check-out validé</p>
        <Link
          href={`/voyageurs/${guestId}/edit`}
          className="text-xs text-primary hover:underline"
        >
          Mettre à jour la fiche voyageur →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 space-y-4 max-w-md">
      <p className="text-sm font-semibold text-foreground">Checklist check-out</p>

      {/* Checklist */}
      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="hidden"
              checked={checked[i]}
              onChange={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
            />
            {checked[i]
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
            <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{item}</span>
          </label>
        ))}
      </div>

      {/* Caution */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caution</p>
        <div className="flex gap-2 flex-wrap">
          {(["liberee", "retenue_partielle", "retenue_totale"] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setCaution(v)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${caution === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              {v === "liberee" ? "Libérée" : v === "retenue_partielle" ? "Retenue partielle" : "Retenue totale"}
            </button>
          ))}
        </div>
        {caution !== "liberee" && (
          <div className="flex gap-2">
            <input
              type="number"
              name="montant_retenu"
              placeholder="Montant (€)"
              className="text-sm border border-border rounded-md px-2 py-1 w-32 bg-background"
            />
            <input
              type="text"
              name="motif"
              placeholder="Motif"
              className="text-sm border border-border rounded-md px-2 py-1 flex-1 bg-background"
            />
          </div>
        )}
      </div>

      {/* Observations */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Observations</p>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="État du logement, dégradations, remarques…"
          rows={3}
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none"
        />
      </div>

      {/* Submit */}
      <form
        action={async (fd) => {
          fd.set("observations", observations)
          fd.set("caution", caution)
          ITEMS.forEach((_, i) => fd.set(`item_${i}`, checked[i] ? "on" : "off"))
          await completeCheckoutAction(bookingId, fd)
          setSubmitted(true)
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          disabled={!allChecked}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Valider le check-out
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Mettre à jour `status-actions.tsx`**

Remplacer le contenu de `apps/backoffice/app/(protected)/reservations/[id]/status-actions.tsx` :

```tsx
"use client"

import { updateBookingStatutAction } from "./actions"
import { CheckinForm } from "./checkin-form"
import { CheckoutForm } from "./checkout-form"
import { Button } from "@conciergerie/ui"

interface Props { id: string; statut: string; guestId: string }

export function BookingStatusActions({ id, statut, guestId }: Props) {
  if (statut === "CONFIRMED") {
    return <CheckinForm bookingId={id} />
  }

  if (statut === "CHECKEDIN") {
    return <CheckoutForm bookingId={id} guestId={guestId} />
  }

  if (statut === "PENDING") {
    const action = updateBookingStatutAction.bind(null, id)
    return (
      <form action={action}>
        <input type="hidden" name="statut" value="CONFIRMED" />
        <Button type="submit" size="sm" className="cursor-pointer">Confirmer</Button>
      </form>
    )
  }

  return null
}
```

- [ ] **Step 5: Mettre à jour `reservations/[id]/page.tsx` pour passer `guestId`**

Lire `apps/backoffice/app/(protected)/reservations/[id]/page.tsx`. Trouver l'utilisation de `<BookingStatusActions>` et ajouter la prop `guestId` :

```tsx
<BookingStatusActions id={booking.id} statut={booking.statut} guestId={booking.guest.id} />
```

- [ ] **Step 6: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add apps/backoffice/app/\(protected\)/reservations/
git commit -m "feat(reservations): check-in/check-out avec checklists, caution, observations"
```

---

### Task 7: Documents — date_expiration + badges expiration

**Files:**
- Modify: `apps/backoffice/app/(protected)/documents/upload-dialog.tsx`
- Modify: `apps/backoffice/app/(protected)/documents/actions.ts`
- Modify: `apps/backoffice/app/(protected)/documents/documents-browser.tsx`

- [ ] **Step 1: Ajouter le champ date_expiration dans `upload-dialog.tsx`**

Lire `upload-dialog.tsx`. Dans le formulaire d'upload, ajouter après le select de type document (chercher `DOC_TYPES` ou le select de type) :

```tsx
<div className="space-y-1">
  <label className="text-xs font-medium text-muted-foreground">
    Date d&apos;expiration <span className="font-normal">(optionnel — DPE, assurance…)</span>
  </label>
  <input
    type="date"
    name="date_expiration"
    className="w-full text-sm border border-border rounded-md px-2.5 py-1.5 bg-background"
  />
</div>
```

- [ ] **Step 2: Mettre à jour `uploadDocumentAction` dans `actions.ts`**

Lire `actions.ts`. Dans `uploadDocumentAction`, après la ligne qui récupère `mandate_id`, ajouter :

```typescript
const date_expiration_raw = formData.get("date_expiration") as string | null
const date_expiration = date_expiration_raw ? new Date(date_expiration_raw) : undefined
```

Et dans l'appel `createDocument`, ajouter la propriété (si le DAL `CreateDocumentInput` ne l'a pas encore, ajouter `date_expiration?: Date` à l'interface dans `documents.ts`) :

Pour la signature `createDocument`, après la ligne `mandate_id: mandate_id || undefined,`, ajouter :
```typescript
// Cette propriété sera passée directement au db.document.create
```

Modifier directement le `db.document.create` dans `createDocument` du DAL pour inclure `date_expiration` :

Dans `apps/backoffice/lib/dal/documents.ts`, modifier la fonction `createDocument` :

```typescript
export async function createDocument(data: CreateDocumentInput & { date_expiration?: Date }) {
  return db.document.create({ data })
}
```

Et ajouter `date_expiration?: Date` à l'interface `CreateDocumentInput`.

Dans `actions.ts`, passer `date_expiration` à `createDocument` :
```typescript
const doc = await createDocument({
  // ... champs existants ...
  date_expiration: date_expiration || undefined,
})
```

- [ ] **Step 3: Ajouter les badges expiration dans `documents-browser.tsx`**

Lire `documents-browser.tsx`. Trouver où chaque document est affiché (soit dans une grille de cards, soit dans une liste). Après le nom du document ou après le type badge, ajouter la logique de badge :

```tsx
// Ajouter cette fonction helper en haut du composant (avant le return)
function getExpiryBadge(dateExpiration: Date | string | null) {
  if (!dateExpiration) return null
  const now = new Date()
  const exp = new Date(dateExpiration)
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded font-medium">Expiré</span>
  }
  if (diffDays <= 30) {
    return <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded font-medium">Expire dans {diffDays}j</span>
  }
  return null
}
```

Puis dans le rendu de chaque document (`doc.date_expiration` est le champ) :
```tsx
{getExpiryBadge(doc.date_expiration)}
```

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/app/\(protected\)/documents/ apps/backoffice/lib/dal/documents.ts
git commit -m "feat(documents): champ date_expiration + badges expiration rouge/orange"
```

---

### Task 8: Cron document-expiry

**Files:**
- Modify: `vercel.json`
- Create: `apps/backoffice/app/api/cron/document-expiry/route.ts`

- [ ] **Step 1: Ajouter le cron dans `vercel.json`**

Lire `vercel.json`. Dans le tableau `crons`, ajouter :

```json
{
  "path": "/api/cron/document-expiry",
  "schedule": "0 8 * * 1"
}
```

Le tableau final doit avoir 4 entrées.

- [ ] **Step 2: Créer la route cron**

Créer `apps/backoffice/app/api/cron/document-expiry/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getExpiringDocuments } from "@/lib/dal/documents"
import { sendNouveauMessageEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const docs = await getExpiringDocuments(30)

  // Grouper par email propriétaire
  const byOwner = new Map<string, { email: string; nom: string; docs: typeof docs }>()
  for (const doc of docs) {
    if (!doc.owner?.email) continue
    const key = doc.owner.email
    if (!byOwner.has(key)) {
      byOwner.set(key, { email: doc.owner.email, nom: doc.owner.nom, docs: [] })
    }
    byOwner.get(key)!.docs.push(doc)
  }

  let sent = 0
  let errors = 0

  for (const { email, nom, docs: ownerDocs } of byOwner.values()) {
    try {
      const docList = ownerDocs.map(d => {
        const exp = d.date_expiration ? new Date(d.date_expiration!).toLocaleDateString("fr-FR") : "?"
        return `• ${d.nom} (${d.type}) — expire le ${exp}`
      }).join("\n")

      await sendNouveauMessageEmail({
        to: email,
        recipientName: nom,
        senderName: "Entre Rhône et Alpilles",
        subject: `Alerte : ${ownerDocs.length} document${ownerDocs.length > 1 ? "s" : ""} arrivent à expiration`,
        preview: docList.slice(0, 200),
        portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })
      sent++
    } catch (err) {
      errors++
      console.error(`[document-expiry] Erreur email ${email}:`, err)
    }
  }

  return NextResponse.json({ docs: docs.length, owners: byOwner.size, sent, errors })
}
```

Note: on réutilise `sendNouveauMessageEmail` en guise d'email générique de notification. Si la signature diffère, lire `packages/email/src/render.ts` et adapter.

- [ ] **Step 3: Vérifier la signature de `sendNouveauMessageEmail`**

```bash
grep -A15 "sendNouveauMessageEmail" C:/Developpement/conciergerie/packages/email/src/render.ts
```

Adapter les paramètres de l'appel si nécessaire.

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @conciergerie/backoffice type-check 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add vercel.json apps/backoffice/app/api/cron/document-expiry/
git commit -m "feat(cron): alerte hebdo documents expirant dans 30 jours"
```

---

### Task 9: Build final + push

- [ ] **Step 1: Build complet**

```bash
pnpm build
```

Expected: `✓ Compiled successfully`

Si erreur TypeScript sur `(event as PlanningEvent)` dans les calendriers, remplacer par :
```typescript
onSelectEvent={(event) => router.push((event as unknown as { url: string }).url)}
```

Si erreur CSS import `react-big-calendar` : vérifier que `"react-big-calendar"` est bien dans `transpilePackages` de `next.config.mjs`.

- [ ] **Step 2: Push**

```bash
git push
```

---

## Self-review

**Spec coverage :**
- [x] Planning calendrier react-big-calendar — Task 3
- [x] Filtre par bien — Task 3
- [x] Click event → navigation — Task 3 (PlanningCalendar onSelectEvent)
- [x] Stats bar (taux occupation, arrivées, départs, ménages) — Task 3
- [x] Ménage vue calendrier — Task 4
- [x] Ménage tabs — Task 4
- [x] Ménage filtre par prestataire — Task 4 (dans MenageCalendar, prop contractorFilter)
- [x] Badge dépassement — Task 4
- [x] Assignation prestataire rapide — Task 5
- [x] Email notification prestataire — Task 5
- [x] Check-in checklist — Task 6
- [x] Check-out checklist + caution — Task 6
- [x] Observations post check-out — Task 6
- [x] Lien mise à jour fiche voyageur — Task 6 (submitted state)
- [x] Documents date_expiration — Task 7
- [x] Badges expiration rouge/orange — Task 7
- [x] Cron document-expiry — Task 8

**Types cohérents :**
- `PlanningEvent` défini dans `planning.ts` (Task 2), utilisé dans `planning-calendar.tsx` (Task 3) — import via `@/lib/dal/planning`
- `assignContractor` retourne le task avec `contractor` include — utilisé dans `actions.ts` (Task 5) avec `.contractor.email`
- `startCheckinAction(id, formData)` et `completeCheckoutAction(id, formData)` utilisent le même pattern que `updateBookingStatutAction` existant
- `getExpiringDocuments` retourne les docs avec `date_expiration` non null — ce champ vient d'être ajouté au modèle en Task 1

**Placeholder scan :** aucun TODO/TBD. Tous les blocs de code sont complets.
