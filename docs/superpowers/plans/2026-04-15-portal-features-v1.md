# Portal — Features Vague 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 functional gaps in the owner portal: bottom nav mobile, messaging contact name, planning event detail modal, property detail (access codes + guest reviews), and a revenue bar chart.

**Architecture:** Four sequential tasks, each independently mergeable. No new DB migrations. Task 3 extends the existing DAL (properties.ts) with two new `include` fields. Task 4 adds recharts as the only new dependency. All UI follows the established `garrigue`/`calcaire`/`or` design system.

**Tech Stack:** Next.js 14 App Router, Framer Motion (already installed), recharts (to install), date-fns, Lucide React, Tailwind CSS, Prisma.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/portal/components/layout/bottom-nav.tsx` | Modify | Swap "Documents" → "Planning" slot |
| `apps/portal/app/(protected)/messagerie/page.tsx` | Modify | Show `to_name` as contact subtitle on each thread |
| `apps/portal/components/planning/calendar-portal.tsx` | Modify | Add `onSelectEvent`, pass meta on each event |
| `apps/portal/components/planning/event-detail-modal.tsx` | Create | Framer Motion modal for booking/cleaning/blocked event detail |
| `apps/portal/lib/dal/properties.ts` | Modify | Include `access` + `reviews` in `getOwnerPropertyById` |
| `apps/portal/app/(protected)/biens/[id]/page.tsx` | Modify | Render access codes section + reviews section |
| `apps/portal/components/biens/property-access-card.tsx` | Create | Access info card with WiFi + door code reveal toggle |
| `apps/portal/components/biens/property-reviews.tsx` | Create | Recent guest reviews with star ratings |
| `apps/portal/components/revenus/revenus-chart.tsx` | Create | Recharts BarChart for monthly revenue |
| `apps/portal/app/(protected)/revenus/page.tsx` | Modify | Add chart above table |

---

## Task 1: Bottom Nav Fix + Messagerie Contact Name

**Files:**
- Modify: `apps/portal/components/layout/bottom-nav.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/page.tsx`

### Context

`bottom-nav.tsx` has 5 slots: Accueil, Biens, Revenus, Docs, Messages. Planning is completely inaccessible on mobile. The fix: swap "Docs" (least urgently needed) for "Planning". Paramètres is already accessible via the mobile header's Settings icon.

In `messagerie/page.tsx`, each thread is rendered but no contact name is shown — just the subject. `MessageThread.to_name` stores the recipient name (e.g. "Équipe ERA"). Show it as a subtitle.

- [ ] **Step 1: Replace `apps/portal/components/layout/bottom-nav.tsx`**

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

export function BottomNav() {
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
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-fast cursor-pointer relative ${
                  active ? "text-or-500" : "text-garrigue-400 hover:text-garrigue-700"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.6}
                  className="transition-fast"
                />
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

- [ ] **Step 2: Update messagerie thread list to show contact name**

Read `apps/portal/app/(protected)/messagerie/page.tsx` first. The `t` object has `t.to_name` (from the Prisma query). Add a contact line between the subject and the message preview.

Find the block that renders each thread link. Inside the `<Link>`, after the subject/unread div, add:

```tsx
{/* Contact name */}
<p className="text-xs text-garrigue-400 mt-0.5 font-medium">
  {t.to_name ?? "Équipe ERA"}
</p>
```

Place it between the subject div and the `{lastMessage && ...}` block.

- [ ] **Step 3: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/layout/bottom-nav.tsx "apps/portal/app/(protected)/messagerie/page.tsx"
git commit -m "fix(portal): planning in mobile nav + contact name in messagerie"
```

---

## Task 2: Planning — Event Detail Modal

**Files:**
- Create: `apps/portal/components/planning/event-detail-modal.tsx`
- Modify: `apps/portal/components/planning/calendar-portal.tsx`

### Context

`CalendarPortal` currently renders a react-big-calendar with no `onSelectEvent` handler — clicking events does nothing. We add an event detail modal using Framer Motion (already installed). The modal shows different content depending on event type (booking, cleaning, blocked). We extend the `CalEvent` type with a `meta` discriminated union so the modal can render rich data.

- [ ] **Step 1: Create `apps/portal/components/planning/event-detail-modal.tsx`**

```tsx
"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Calendar, Home, Clock, BedDouble } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export type BookingMeta = {
  type: "booking"
  guestName: string
  propertyName: string
  statut: string
  checkIn: Date
  checkOut: Date
  nbNuits: number
}

export type CleaningMeta = {
  type: "cleaning"
  propertyName: string
  date: Date
}

export type BlockedMeta = {
  type: "blocked"
  propertyName: string
  dateDebut: Date
  dateFin: Date
  notes: string | null
}

export type EventMeta = BookingMeta | CleaningMeta | BlockedMeta

interface EventDetailModalProps {
  meta: EventMeta | null
  onClose: () => void
}

const STATUT_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmée",
  CHECKEDIN: "En cours",
  CHECKEDOUT: "Terminée",
  PENDING: "En attente",
}

const STATUT_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-600",
  CHECKEDIN: "bg-olivier-50 text-olivier-600",
  CHECKEDOUT: "bg-gray-100 text-gray-500",
  PENDING: "bg-amber-50 text-amber-600",
}

function fmtDate(d: Date) {
  return format(d, "d MMMM yyyy", { locale: fr })
}

function BookingDetail({ m }: { m: BookingMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <User size={15} className="text-blue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Voyageur</p>
          <p className="text-sm font-medium text-garrigue-900">{m.guestName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Home size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Calendar size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Période</p>
          <p className="text-sm font-medium text-garrigue-900">
            {fmtDate(m.checkIn)} → {fmtDate(m.checkOut)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <BedDouble size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Durée</p>
          <p className="text-sm font-medium text-garrigue-900">
            {m.nbNuits} nuit{m.nbNuits > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="pt-1">
        <span className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium ${STATUT_STYLES[m.statut] ?? "bg-gray-100 text-gray-500"}`}>
          {STATUT_LABELS[m.statut] ?? m.statut}
        </span>
      </div>
    </div>
  )
}

function CleaningDetail({ m }: { m: CleaningMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
          <Home size={15} className="text-sky-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Clock size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Date prévue</p>
          <p className="text-sm font-medium text-garrigue-900">{fmtDate(m.date)}</p>
        </div>
      </div>
    </div>
  )
}

function BlockedDetail({ m }: { m: BlockedMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Home size={15} className="text-gray-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Calendar size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Période bloquée</p>
          <p className="text-sm font-medium text-garrigue-900">
            {fmtDate(m.dateDebut)} → {fmtDate(m.dateFin)}
          </p>
        </div>
      </div>
      {m.notes && (
        <div className="bg-calcaire-100 rounded-xl px-4 py-3">
          <p className="text-xs text-garrigue-500 leading-relaxed">{m.notes}</p>
        </div>
      )}
    </div>
  )
}

const TITLE: Record<EventMeta["type"], string> = {
  booking: "Réservation",
  cleaning: "Ménage prévu",
  blocked: "Période bloquée",
}

export function EventDetailModal({ meta, onClose }: EventDetailModalProps) {
  useEffect(() => {
    if (!meta) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [meta, onClose])

  return (
    <AnimatePresence>
      {meta && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-garrigue-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-0 inset-x-0 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[380px] bg-white sm:rounded-2xl rounded-t-2xl shadow-luxury px-6 pt-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-label={TITLE[meta.type]}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-garrigue-900 font-light italic">
                {TITLE[meta.type]}.
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-calcaire-100 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {meta.type === "booking" && <BookingDetail m={meta} />}
            {meta.type === "cleaning" && <CleaningDetail m={meta} />}
            {meta.type === "blocked" && <BlockedDetail m={meta} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Modify `apps/portal/components/planning/calendar-portal.tsx`**

Read the current file first. Replace entirely with:

```tsx
"use client"

import { useMemo, useState, useCallback } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, differenceInCalendarDays } from "date-fns"
import { fr } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { EventDetailModal, type EventMeta } from "./event-detail-modal"

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

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  meta: EventMeta
}

interface PortalBooking {
  id: string
  check_in: Date | string
  check_out: Date | string
  nb_nuits: number
  statut: string
  property: { nom: string }
  guest: { prenom: string; nom: string }
}

interface PortalCleaning {
  id: string
  date_prevue: Date | string
  property: { nom: string }
}

interface PortalBlockedDate {
  id: string
  date_debut: Date | string
  date_fin: Date | string
  notes: string | null
  property: { nom: string }
}

interface CalendarPortalProps {
  bookings: PortalBooking[]
  cleanings: PortalCleaning[]
  blockedDates: PortalBlockedDate[]
}

export function CalendarPortal({ bookings, cleanings, blockedDates }: CalendarPortalProps) {
  const [selectedMeta, setSelectedMeta] = useState<EventMeta | null>(null)

  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = []
    for (const b of bookings) {
      const checkIn = new Date(b.check_in)
      const checkOut = new Date(b.check_out)
      result.push({
        id: b.id,
        title: `${b.guest.prenom} ${b.guest.nom} — ${b.property.nom}`,
        start: checkIn,
        end: checkOut,
        color: BOOKING_COLORS[String(b.statut)] ?? "#3b82f6",
        meta: {
          type: "booking",
          guestName: `${b.guest.prenom} ${b.guest.nom}`,
          propertyName: b.property.nom,
          statut: String(b.statut),
          checkIn,
          checkOut,
          nbNuits: b.nb_nuits > 0 ? b.nb_nuits : Math.max(1, differenceInCalendarDays(checkOut, checkIn)),
        },
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
        meta: { type: "cleaning", propertyName: c.property.nom, date: start },
      })
    }
    for (const bl of blockedDates) {
      const dateDebut = new Date(bl.date_debut)
      const dateFin = new Date(bl.date_fin)
      result.push({
        id: bl.id,
        title: bl.notes || `Indisponible — ${bl.property.nom}`,
        start: dateDebut,
        end: dateFin,
        color: "#6b7280",
        meta: {
          type: "blocked",
          propertyName: bl.property.nom,
          dateDebut,
          dateFin,
          notes: bl.notes,
        },
      })
    }
    return result
  }, [bookings, cleanings, blockedDates])

  const handleSelectEvent = useCallback((event: object) => {
    setSelectedMeta((event as CalEvent).meta)
  }, [])

  return (
    <>
      <div className="bg-white rounded-xl shadow-soft p-4" style={{ height: 600 }}>
        <Calendar
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
            style: {
              backgroundColor: (event as CalEvent).color,
              borderColor: (event as CalEvent).color,
              color: "#fff",
              cursor: "pointer",
            },
          })}
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%" }}
        />
      </div>
      <EventDetailModal meta={selectedMeta} onClose={() => setSelectedMeta(null)} />
    </>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors. Note: `differenceInCalendarDays` is already in date-fns which is installed. The `nb_nuits` field is on the Booking model and already selected in the planning DAL query (it's a top-level field on the Booking include).

If `nb_nuits` causes a type error (not in PortalBooking), the fallback `differenceInCalendarDays(checkOut, checkIn)` is already provided. You can safely remove `b.nb_nuits > 0 ? b.nb_nuits :` and just use `Math.max(1, differenceInCalendarDays(checkOut, checkIn))`.

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/planning/
git commit -m "feat(portal): planning event detail modal on click"
```

---

## Task 3: Biens Detail — Access Codes + Guest Reviews

**Files:**
- Modify: `apps/portal/lib/dal/properties.ts`
- Create: `apps/portal/components/biens/property-access-card.tsx`
- Create: `apps/portal/components/biens/property-reviews.tsx`
- Modify: `apps/portal/app/(protected)/biens/[id]/page.tsx`

### Context

`/biens/[id]` currently shows only property info, monthly revenue, and 3 bookings. The DB has `PropertyAccess` (WiFi, door code, instructions) and `Review` (guest ratings from Airbnb). Owners have a legitimate need to see their own property's access credentials and know how their property is rated.

`PropertyAccess` is linked to `Property` with a 1-to-1 `@unique` on `property_id`. `Review` is linked to `Booking` which is linked to `Property`. The DAL is extended to include both.

- [ ] **Step 1: Extend `apps/portal/lib/dal/properties.ts`**

Read the file. In `getOwnerPropertyById`, in the `mandate.findFirst` query, the `property` include block currently has `bookings`, `cleaningTasks`, `blockedDates`. Add `access: true` and `reviews via bookings` to get access info.

Also, after the `revenusThisMonth` aggregate query, add a `db.review.findMany` query.

Replace the entire file with:

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
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1) // exclusive

  const mandate = await db.mandate.findFirst({
    where: { owner_id: ownerId, property_id: propertyId, statut: "ACTIF" },
    include: {
      property: {
        include: {
          bookings: {
            where: {
              statut: { notIn: ["CANCELLED"] },
              OR: [
                { check_in: { gte: firstOfMonth, lt: lastOfMonth } },
                { check_out: { gte: firstOfMonth, lt: lastOfMonth } },
                { check_in: { lte: firstOfMonth }, check_out: { gte: lastOfMonth } },
              ],
            },
            include: {
              guest: { select: { prenom: true, nom: true } },
            },
            orderBy: { check_in: "desc" },
            take: 10,
          },
          cleaningTasks: {
            where: { date_prevue: { gte: firstOfMonth, lt: lastOfMonth } },
            orderBy: { date_prevue: "asc" },
          },
          blockedDates: {
            where: {
              OR: [
                { date_debut: { gte: firstOfMonth, lt: lastOfMonth } },
                { date_fin: { gte: firstOfMonth, lt: lastOfMonth } },
              ],
            },
          },
          access: true,
        },
      },
    },
  })

  if (!mandate) return null

  const [revenusThisMonth, reviews] = await Promise.all([
    db.booking.aggregate({
      where: {
        property_id: propertyId,
        statut: "CHECKEDOUT",
        check_out: { gte: firstOfMonth, lt: lastOfMonth },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    db.review.findMany({
      where: { booking: { property_id: propertyId } },
      orderBy: { date_avis: "desc" },
      take: 5,
      include: {
        booking: {
          select: {
            check_in: true,
            check_out: true,
            guest: { select: { prenom: true } },
          },
        },
      },
    }),
  ])

  return {
    ...mandate.property,
    revenusThisMonth: revenusThisMonth._sum.revenu_net_proprietaire ?? 0,
    reviews,
  }
}
```

- [ ] **Step 2: Create `apps/portal/components/biens/property-access-card.tsx`**

```tsx
"use client"

import { useState } from "react"
import { Wifi, Key, FileText, Eye, EyeOff } from "lucide-react"

interface PropertyAccessCardProps {
  wifi_nom: string | null
  wifi_mdp: string | null
  code_acces: string | null
  instructions_arrivee: string | null
  notes_depart: string | null
}

export function PropertyAccessCard({
  wifi_nom,
  wifi_mdp,
  code_acces,
  instructions_arrivee,
  notes_depart,
}: PropertyAccessCardProps) {
  const [showWifi, setShowWifi] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const hasAny = wifi_nom || wifi_mdp || code_acces || instructions_arrivee || notes_depart
  if (!hasAny) return null

  return (
    <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-argile-200/40">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
          Informations d'accès
        </h2>
      </div>
      <div className="px-5 py-4 space-y-4">
        {(wifi_nom || wifi_mdp) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <Wifi size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Wi-Fi
              </p>
              {wifi_nom && (
                <p className="text-sm text-garrigue-900 font-medium">{wifi_nom}</p>
              )}
              {wifi_mdp && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-garrigue-600 font-mono">
                    {showWifi ? wifi_mdp : "••••••••"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowWifi((v) => !v)}
                    className="text-garrigue-400 hover:text-garrigue-700 transition-fast cursor-pointer"
                    aria-label={showWifi ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showWifi ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {code_acces && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <Key size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Code d&apos;accès
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-garrigue-600 font-mono tracking-widest">
                  {showCode ? code_acces : "••••"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="text-garrigue-400 hover:text-garrigue-700 transition-fast cursor-pointer"
                  aria-label={showCode ? "Masquer le code" : "Afficher le code"}
                >
                  {showCode ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {instructions_arrivee && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Instructions d&apos;arrivée
              </p>
              <p className="text-sm text-garrigue-600 leading-relaxed whitespace-pre-line">
                {instructions_arrivee}
              </p>
            </div>
          </div>
        )}

        {notes_depart && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Instructions de départ
              </p>
              <p className="text-sm text-garrigue-600 leading-relaxed whitespace-pre-line">
                {notes_depart}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `apps/portal/components/biens/property-reviews.tsx`**

```tsx
import { Star } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Review {
  id: string
  note_globale: number
  note_proprete: number | null
  note_communication: number | null
  commentaire_voyageur: string | null
  date_avis: Date
  booking: {
    check_in: Date
    check_out: Date
    guest: { prenom: string }
  }
}

interface PropertyReviewsProps {
  reviews: Review[]
}

function StarRating({ note }: { note: number }) {
  const stars = Math.round(note)
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= stars ? "fill-or-400 text-or-400" : "text-argile-300"}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-garrigue-500 ml-1 tabular-nums">{note.toFixed(1)}</span>
    </div>
  )
}

export function PropertyReviews({ reviews }: PropertyReviewsProps) {
  if (reviews.length === 0) return null

  const avgNote = reviews.reduce((s, r) => s + r.note_globale, 0) / reviews.length

  return (
    <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-argile-200/40 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
          Avis voyageurs
        </h2>
        <div className="flex items-center gap-1.5">
          <Star size={13} className="fill-or-400 text-or-400" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-garrigue-900 tabular-nums">
            {avgNote.toFixed(1)}
          </span>
          <span className="text-xs text-garrigue-400">
            ({reviews.length} avis)
          </span>
        </div>
      </div>
      <div className="divide-y divide-argile-100">
        {reviews.map((r) => (
          <div key={r.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-garrigue-900">
                  {r.booking.guest.prenom}
                </p>
                <p className="text-xs text-garrigue-400">
                  {format(r.booking.check_in, "d MMM", { locale: fr })} →{" "}
                  {format(r.booking.check_out, "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <StarRating note={r.note_globale} />
            </div>
            {r.commentaire_voyageur && (
              <p className="text-sm text-garrigue-600 leading-relaxed italic">
                &ldquo;{r.commentaire_voyageur}&rdquo;
              </p>
            )}
            {(r.note_proprete !== null || r.note_communication !== null) && (
              <div className="flex gap-4 mt-2">
                {r.note_proprete !== null && (
                  <div>
                    <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Propreté</p>
                    <StarRating note={r.note_proprete} />
                  </div>
                )}
                {r.note_communication !== null && (
                  <div>
                    <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Communication</p>
                    <StarRating note={r.note_communication} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Replace `apps/portal/app/(protected)/biens/[id]/page.tsx`**

Read the file first. Replace entirely with:

```tsx
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOwnerPropertyById } from "@/lib/dal/properties"
import { PropertyAccessCard } from "@/components/biens/property-access-card"
import { PropertyReviews } from "@/components/biens/property-reviews"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

function extractVille(adresse: unknown): string | null {
  if (adresse && typeof adresse === "object") {
    const addr = adresse as Record<string, unknown>
    if (typeof addr.ville === "string") return addr.ville
    if (typeof addr.city === "string") return addr.city
  }
  return null
}

const STATUT_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmé",
  CHECKEDIN: "En cours",
  CHECKEDOUT: "Terminé",
  PENDING: "En attente",
}

const STATUT_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-600",
  CHECKEDIN: "bg-emerald-50 text-emerald-600",
  CHECKEDOUT: "bg-gray-100 text-gray-500",
  PENDING: "bg-amber-50 text-amber-600",
}

export default async function BienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { id } = await params
  const property = await getOwnerPropertyById(session.user.ownerId, id)
  if (!property) notFound()

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const recentBookings = property.bookings.slice(0, 3)
  const ville = extractVille(property.adresse)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/biens"
          className="text-garrigue-400 hover:text-garrigue-700 transition-colors"
          aria-label="Retour aux biens"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-serif text-3xl text-garrigue-900 font-light italic">
          {property.nom}
        </h1>
      </div>

      {/* Property info + monthly revenue */}
      <div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-calcaire-100 rounded-lg">
            <Home size={20} className="text-garrigue-500" />
          </div>
          <div>
            <p className="font-medium text-garrigue-900">{property.nom}</p>
            {ville && <p className="text-sm text-garrigue-400">{ville}</p>}
            {property.superficie && (
              <p className="text-sm text-garrigue-400">{property.superficie} m²</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-argile-200/40">
          <p className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-1">
            Revenus du mois
          </p>
          <p className="font-serif text-xl text-garrigue-900">{fmt(property.revenusThisMonth)}</p>
        </div>
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-3">
            Réservations récentes
          </h2>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl px-4 py-3 shadow-luxury-card border border-argile-200/40 flex items-center justify-between"
              >
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
                    STATUT_STYLES[String(b.statut)] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUT_LABELS[String(b.statut)] ?? String(b.statut)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Access info */}
      {property.access && (
        <PropertyAccessCard
          wifi_nom={property.access.wifi_nom}
          wifi_mdp={property.access.wifi_mdp}
          code_acces={property.access.code_acces}
          instructions_arrivee={property.access.instructions_arrivee}
          notes_depart={property.access.notes_depart}
        />
      )}

      {/* Guest reviews */}
      <PropertyReviews reviews={property.reviews} />
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors. Note: `params` is typed as `Promise<{ id: string }>` following Next.js 15 convention. If the project uses Next.js 14 and type errors appear, change back to `{ params: { id: string } }` (non-Promise). Check the existing page signature to confirm.

- [ ] **Step 6: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/properties.ts apps/portal/components/biens/ "apps/portal/app/(protected)/biens/[id]/page.tsx"
git commit -m "feat(portal): access codes + guest reviews on property detail page"
```

---

## Task 4: Revenue Bar Chart (recharts)

**Files:**
- Create: `apps/portal/components/revenus/revenus-chart.tsx`
- Modify: `apps/portal/app/(protected)/revenus/page.tsx`

### Context

The revenus page shows a static table of monthly reports. We add a bar chart showing `montant_reverse` per month (the net amount transferred to the owner). Chart color: `#C9A84C` (or-400 from the design system). recharts is a lightweight composable charting library (BarChart + ResponsiveContainer + Tooltip). No recharts types package needed — types ship with recharts.

- [ ] **Step 1: Install recharts**

```bash
cd C:/Developpement/conciergerie && pnpm add recharts --filter=@conciergerie/portal
```

Expected output: recharts added to `apps/portal/package.json` dependencies.

- [ ] **Step 2: Create `apps/portal/components/revenus/revenus-chart.tsx`**

```tsx
"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ReportEntry {
  id: string
  periode_debut: Date
  montant_reverse: number
  revenus_sejours: number
}

interface RevenusChartProps {
  reports: ReportEntry[]
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-argile-200 rounded-xl shadow-luxury px-4 py-3">
      <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-wide mb-1 capitalize">
        {label}
      </p>
      <p className="text-sm font-semibold text-garrigue-900 tabular-nums">
        {fmtEur(payload[0].value)}
      </p>
    </div>
  )
}

export function RevenusChart({ reports }: RevenusChartProps) {
  if (reports.length === 0) return null

  const data = reports
    .slice()
    .sort((a, b) => a.periode_debut.getTime() - b.periode_debut.getTime())
    .map((r) => ({
      mois: format(r.periode_debut, "MMM", { locale: fr }),
      reversé: Math.round(r.montant_reverse),
    }))

  return (
    <div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 px-5 pt-5 pb-4">
      <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">
        Montant reversé par mois
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -16, bottom: 0 }} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e3da" vertical={false} />
          <XAxis
            dataKey="mois"
            tick={{ fill: "#9c9488", fontSize: 11, textAnchor: "middle" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
            tick={{ fill: "#9c9488", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f2ed", radius: 6 }} />
          <Bar dataKey="reversé" fill="#C9A84C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Update `apps/portal/app/(protected)/revenus/page.tsx`**

Read the file. Add the `RevenusChart` import and render it between the header/filter area and the table.

Replace the file with:

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerReports } from "@/lib/dal/revenus"
import { RevenusTable } from "@/components/revenus/revenus-table"
import { RevenusChart } from "@/components/revenus/revenus-chart"
import { YearFilter } from "@/components/revenus/year-filter"

export default async function RevenusPage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { annee } = await searchParams
  const currentYear = new Date().getFullYear()
  const selectedYear = annee ? Number(annee) : currentYear
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const reports = await getOwnerReports(session.user.ownerId, selectedYear)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Vos revenus.</h1>
          <p className="text-sm text-garrigue-400 mt-1">Comptes-rendus de gestion</p>
        </div>
        <YearFilter years={years} selected={selectedYear} />
      </div>
      <RevenusChart reports={reports} />
      <RevenusTable reports={reports} year={selectedYear} />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors. If recharts types are missing, run `pnpm add -D @types/recharts --filter=@conciergerie/portal` (though recharts 2.x ships its own types).

- [ ] **Step 5: Final build + push**

```bash
cd C:/Developpement/conciergerie && pnpm turbo build --filter=@conciergerie/portal 2>&1 | tail -20
```

Expected: build success.

```bash
cd C:/Developpement/conciergerie
git add apps/portal/components/revenus/revenus-chart.tsx "apps/portal/app/(protected)/revenus/page.tsx" apps/portal/package.json pnpm-lock.yaml
git commit -m "feat(portal): revenue bar chart (recharts)"
git push
```

---

## Self-Review

### Spec coverage
- [x] Bottom nav: Planning added, replaces Docs (Task 1)
- [x] Messagerie contact name: `to_name ?? "Équipe ERA"` shown (Task 1)
- [x] Planning event modal: booking/cleaning/blocked all handled (Task 2)
- [x] Biens access codes: WiFi + door code with reveal toggle (Task 3)
- [x] Biens guest reviews: last 5 reviews with star rating + comments (Task 3)
- [x] Revenue chart: bar chart montant_reverse per month (Task 4)

### Placeholder scan
- All code blocks are complete. No TBD, TODO, or "similar to" patterns.

### Type consistency
- `EventMeta` defined in `event-detail-modal.tsx`, imported and used in `calendar-portal.tsx` — consistent.
- `BookingMeta.nbNuits: number` maps to `nb_nuits: b.nb_nuits` from Booking model.
- `PropertyAccessCard` props map directly to `PropertyAccess` model field names.
- `PropertyReviews` Review type has `booking.guest.prenom` — matches the `include` in `getOwnerPropertyById`.
- `RevenusChart` receives `reports` which include `periode_debut: Date` and `montant_reverse: number` — these are top-level fields on `ManagementReport` returned by `getOwnerReports`.
- `params` type in biens/[id] — note that Next.js 14 uses `{ params: { id: string } }` (non-Promise). Check the current file — if it uses non-Promise, revert that signature. The current file in the repo uses `{ params: { id: string } }` without await, so use that same pattern.
