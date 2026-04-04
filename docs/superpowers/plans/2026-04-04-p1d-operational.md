# P1d — Opérationnel Conciergerie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five operational modules that make the back-office production-ready for day-to-day concierge operations: planning calendrier, module ménage (CleaningTask), devis dans travaux, CRG automatique (ManagementReport), and a richer dashboard.

**Architecture:** All data fetching happens in Next.js 14 Server Components (RSC); mutations go through Server Actions (`"use server"`); interactive list/column components live in `*-table.tsx` / `*-actions.tsx` files marked `"use client"` to avoid the RSC serialization crash. Tests use Vitest and cover all business logic in `lib/validations/` and `lib/dal/`.

**Tech Stack:** Next.js 14 App Router, Prisma ORM (`@conciergerie/db`), Vitest, shadcn/ui (`@conciergerie/ui`), Tailwind CSS, Zod, Lucide icons.

---

## File Map

| Status | File | Responsibility |
|--------|------|----------------|
| Create | `lib/dal/menage.ts` | CleaningTask CRUD + auto-create helper |
| Create | `lib/dal/menage.test.ts` | Unit tests for menage DAL |
| Create | `lib/dal/crg.ts` | ManagementReport generation logic |
| Create | `lib/dal/crg.test.ts` | Unit tests for CRG |
| Create | `lib/validations/menage.ts` | Zod schema for CleaningTask form |
| Create | `lib/validations/menage.test.ts` | Unit tests for menage validation |
| Create | `lib/validations/devis.ts` | Zod schema for devis form |
| Create | `lib/validations/devis.test.ts` | Unit tests for devis validation |
| Modify | `lib/dal/stats.ts` | Add today's arrivals / departures / cleanings |
| Modify | `lib/dal/travaux.ts` | Add `saveDevis` function |
| Modify | `app/(protected)/reservations/[id]/actions.ts` | Auto-create CleaningTask on CHECKEDOUT |
| Create | `app/(protected)/planning/page.tsx` | Calendar grid Server Component |
| Create | `app/(protected)/planning/planning-grid.tsx` | "use client" month grid |
| Create | `app/(protected)/menage/page.tsx` | CleaningTask list Server Component |
| Create | `app/(protected)/menage/menage-table.tsx` | "use client" table |
| Create | `app/(protected)/menage/[id]/page.tsx` | CleaningTask detail + validation |
| Create | `app/(protected)/menage/[id]/actions.ts` | updateCleaningStatutAction |
| Create | `app/(protected)/travaux/[id]/devis-form.tsx` | "use client" devis form |
| Create | `app/(protected)/travaux/[id]/devis-actions.ts` | saveDevisAction + validerDevisAction |
| Create | `app/(protected)/crg/page.tsx` | CRG list (ManagementReport) Server Component |
| Create | `app/(protected)/crg/crg-table.tsx` | "use client" table |
| Create | `app/(protected)/crg/new/page.tsx` | "use client" form to generate a CRG |
| Create | `app/(protected)/crg/new/actions.ts` | generateCrgAction |
| Modify | `app/(protected)/dashboard/page.tsx` | Show today's ops (arrivals, departures, cleanings) |
| Modify | `app/(protected)/layout.tsx` | Add nav links for Planning, Ménage, CRG |

---

## Task 1: Planning Calendrier

**Files:**
- Create: `apps/backoffice/app/(protected)/planning/page.tsx`
- Create: `apps/backoffice/app/(protected)/planning/planning-grid.tsx`
- Modify: `apps/backoffice/app/(protected)/layout.tsx` (nav link)

- [ ] **Step 1: Add Planning nav link to layout**

Read `apps/backoffice/app/(protected)/layout.tsx`. Find the nav item for "Réservations" and add "Planning" after it:

```tsx
{ href: "/planning", label: "Planning", icon: CalendarRange },
```

Also add `CalendarRange` to the lucide import at the top of the file.

- [ ] **Step 2: Create the planning-grid client component**

Create `apps/backoffice/app/(protected)/planning/planning-grid.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type BookingSlot = {
  id: string
  property_id: string
  property_nom: string
  guest_nom: string
  check_in: string   // ISO date string
  check_out: string  // ISO date string
  statut: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  CHECKEDIN: "bg-green-100 text-green-800 border-green-200",
  CHECKEDOUT: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function PlanningGrid({
  bookings,
  properties,
  year,
  month,
}: {
  bookings: BookingSlot[]
  properties: { id: string; nom: string }[]
  year: number
  month: number
}) {
  const router = useRouter()
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    router.push(`/planning?year=${y}&month=${m}`)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-foreground capitalize min-w-[160px] text-center">
          {monthLabel}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="sticky left-0 bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground w-40 min-w-[10rem]">
                Bien
              </th>
              {days.map((d) => {
                const isToday =
                  new Date().getFullYear() === year &&
                  new Date().getMonth() === month &&
                  new Date().getDate() === d
                return (
                  <th
                    key={d}
                    className={`px-1 py-2 text-center font-medium w-8 min-w-[2rem] ${
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => {
              const propBookings = bookings.filter((b) => b.property_id === prop.id)
              return (
                <tr key={prop.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="sticky left-0 bg-white border-r px-3 py-2 font-medium text-foreground text-xs truncate max-w-[10rem]">
                    <Link href={`/biens/${prop.id}`} className="hover:text-primary">
                      {prop.nom}
                    </Link>
                  </td>
                  {days.map((d) => {
                    const cellDate = new Date(year, month, d)
                    const booking = propBookings.find((b) => {
                      const ci = new Date(b.check_in)
                      const co = new Date(b.check_out)
                      return cellDate >= ci && cellDate < co
                    })
                    const isCheckIn = booking
                      ? new Date(booking.check_in).getDate() === d &&
                        new Date(booking.check_in).getMonth() === month
                      : false
                    return (
                      <td
                        key={d}
                        className="px-0.5 py-1 text-center align-middle"
                      >
                        {booking ? (
                          <Link href={`/reservations/${booking.id}`}>
                            <div
                              className={`rounded px-0.5 py-0.5 border text-[10px] leading-tight truncate ${
                                STATUS_COLORS[booking.statut] ?? "bg-gray-100"
                              }`}
                              title={`${booking.guest_nom} — ${booking.statut}`}
                            >
                              {isCheckIn ? booking.guest_nom.split(" ")[0] : "·"}
                            </div>
                          </Link>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create the planning page Server Component**

Create `apps/backoffice/app/(protected)/planning/page.tsx`:

```tsx
import { db } from "@conciergerie/db"
import { PageHeader } from "@/components/ui/page-header"
import { PlanningGrid } from "./planning-grid"

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string }
}) {
  const now = new Date()
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear()
  const month = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59)

  const [bookings, properties] = await Promise.all([
    db.booking.findMany({
      where: {
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
  ])

  const slots = bookings.map((b) => ({
    id: b.id,
    property_id: b.property_id,
    property_nom: b.property.nom,
    guest_nom: `${b.guest.prenom} ${b.guest.nom}`,
    check_in: b.check_in.toISOString(),
    check_out: b.check_out.toISOString(),
    statut: b.statut,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        description={`${bookings.length} réservation${bookings.length !== 1 ? "s" : ""} ce mois`}
      />
      <PlanningGrid
        bookings={slots}
        properties={properties}
        year={year}
        month={month}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run the dev server and verify the planning page renders**

```bash
cd apps/backoffice && pnpm dev
```

Navigate to `http://localhost:3000/planning`. Expected: a month grid with all active properties as rows and days as columns. Bookings span the correct cells. Month navigation arrows change the month.

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/app/\(protected\)/planning/ apps/backoffice/app/\(protected\)/layout.tsx
git commit -m "feat(planning): add monthly calendar grid page"
```

---

## Task 2: Module Ménage (CleaningTask)

**Files:**
- Create: `apps/backoffice/lib/validations/menage.ts`
- Create: `apps/backoffice/lib/validations/menage.test.ts`
- Create: `apps/backoffice/lib/dal/menage.ts`
- Create: `apps/backoffice/lib/dal/menage.test.ts`
- Create: `apps/backoffice/app/(protected)/menage/page.tsx`
- Create: `apps/backoffice/app/(protected)/menage/menage-table.tsx`
- Create: `apps/backoffice/app/(protected)/menage/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/menage/[id]/actions.ts`
- Modify: `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`
- Modify: `apps/backoffice/app/(protected)/layout.tsx` (nav link)

### 2a — Validation

- [ ] **Step 1: Write the failing validation tests**

Create `apps/backoffice/lib/validations/menage.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { cleaningTaskSchema } from "./menage"

describe("cleaningTaskSchema", () => {
  it("accepts valid data", () => {
    const result = cleaningTaskSchema.safeParse({
      prestataire_id: "abc",
      date_prevue: "2026-04-10",
      notes: "Be careful with the balcony",
    })
    expect(result.success).toBe(true)
  })

  it("requires date_prevue", () => {
    const result = cleaningTaskSchema.safeParse({ prestataire_id: "abc" })
    expect(result.success).toBe(false)
  })

  it("accepts absent prestataire_id", () => {
    const result = cleaningTaskSchema.safeParse({ date_prevue: "2026-04-10" })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd apps/backoffice && pnpm vitest run lib/validations/menage.test.ts
```

Expected: FAIL — "Cannot find module './menage'"

- [ ] **Step 3: Implement the schema**

Create `apps/backoffice/lib/validations/menage.ts`:

```ts
import { z } from "zod"

export const cleaningTaskSchema = z.object({
  prestataire_id: z.string().optional(),
  date_prevue: z.string().min(1, "Date requise"),
  notes: z.string().optional(),
})

export type CleaningTaskFormData = z.infer<typeof cleaningTaskSchema>
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd apps/backoffice && pnpm vitest run lib/validations/menage.test.ts
```

Expected: PASS (3/3)

### 2b — DAL

- [ ] **Step 5: Write failing DAL tests**

Create `apps/backoffice/lib/dal/menage.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { autoCreateCleaningTask, getCleaningTasks, updateCleaningStatut } from "./menage"

vi.mock("@conciergerie/db", () => ({
  db: {
    cleaningTask: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
    },
  },
}))

import { db } from "@conciergerie/db"

beforeEach(() => vi.clearAllMocks())

describe("autoCreateCleaningTask", () => {
  it("creates a CleaningTask using booking check_out as date_prevue", async () => {
    const checkOut = new Date("2026-04-15T10:00:00Z")
    vi.mocked(db.booking.findUnique).mockResolvedValue({
      id: "b1",
      property_id: "p1",
      check_out: checkOut,
    } as any)
    vi.mocked(db.cleaningTask.findFirst).mockResolvedValue(null)
    vi.mocked(db.cleaningTask.create).mockResolvedValue({ id: "ct1" } as any)

    await autoCreateCleaningTask("b1")

    expect(db.cleaningTask.create).toHaveBeenCalledWith({
      data: {
        booking_id: "b1",
        property_id: "p1",
        date_prevue: checkOut,
        statut: "PLANIFIEE",
        checklist: [],
        photos: [],
      },
    })
  })

  it("does nothing if a CleaningTask already exists for this booking", async () => {
    vi.mocked(db.cleaningTask.findFirst).mockResolvedValue({ id: "ct1" } as any)
    await autoCreateCleaningTask("b1")
    expect(db.cleaningTask.create).not.toHaveBeenCalled()
  })
})

describe("updateCleaningStatut", () => {
  it("updates statut and sets date_realisation when TERMINEE", async () => {
    vi.mocked(db.cleaningTask.update).mockResolvedValue({} as any)
    await updateCleaningStatut("ct1", "TERMINEE")
    const call = vi.mocked(db.cleaningTask.update).mock.calls[0][0]
    expect(call.data.statut).toBe("TERMINEE")
    expect(call.data.date_realisation).toBeInstanceOf(Date)
  })

  it("does not set date_realisation for other statuts", async () => {
    vi.mocked(db.cleaningTask.update).mockResolvedValue({} as any)
    await updateCleaningStatut("ct1", "EN_COURS")
    const call = vi.mocked(db.cleaningTask.update).mock.calls[0][0]
    expect(call.data.date_realisation).toBeUndefined()
  })
})
```

- [ ] **Step 6: Run to verify failure**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/menage.test.ts
```

Expected: FAIL — "Cannot find module './menage'"

- [ ] **Step 7: Implement the DAL**

Create `apps/backoffice/lib/dal/menage.ts`:

```ts
import { db } from "@conciergerie/db"

export async function getCleaningTasks() {
  return db.cleaningTask.findMany({
    include: {
      property: { select: { id: true, nom: true } },
      booking: { select: { id: true, check_in: true, check_out: true } },
      contractor: { select: { id: true, nom: true } },
    },
    orderBy: { date_prevue: "asc" },
  })
}

export async function getCleaningTaskById(id: string) {
  return db.cleaningTask.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, nom: true } },
      booking: {
        select: {
          id: true,
          check_in: true,
          check_out: true,
          guest: { select: { prenom: true, nom: true } },
        },
      },
      contractor: { select: { id: true, nom: true, telephone: true } },
    },
  })
}

export async function autoCreateCleaningTask(booking_id: string) {
  const existing = await db.cleaningTask.findFirst({ where: { booking_id } })
  if (existing) return existing

  const booking = await db.booking.findUnique({
    where: { id: booking_id },
    select: { property_id: true, check_out: true },
  })
  if (!booking) throw new Error(`Booking ${booking_id} not found`)

  return db.cleaningTask.create({
    data: {
      booking_id,
      property_id: booking.property_id,
      date_prevue: booking.check_out,
      statut: "PLANIFIEE",
      checklist: [],
      photos: [],
    },
  })
}

export async function updateCleaningStatut(
  id: string,
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"
) {
  return db.cleaningTask.update({
    where: { id },
    data: {
      statut,
      ...(statut === "TERMINEE" ? { date_realisation: new Date() } : {}),
    },
  })
}

export async function assignContractor(id: string, prestataire_id: string) {
  return db.cleaningTask.update({
    where: { id },
    data: { prestataire_id },
  })
}
```

- [ ] **Step 8: Run tests to verify pass**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/menage.test.ts
```

Expected: PASS (4/4)

### 2c — Auto-create on CHECKEDOUT

- [ ] **Step 9: Extend reservations/[id]/actions.ts to auto-create CleaningTask**

Read `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`. Replace entire file with:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { updateBookingStatut } from "@/lib/dal/bookings"
import { autoCreateCleaningTask } from "@/lib/dal/menage"

export async function updateBookingStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "PENDING" | "CONFIRMED" | "CHECKEDIN" | "CHECKEDOUT" | "CANCELLED"
  if (!statut) return
  await updateBookingStatut(id, statut)
  if (statut === "CHECKEDOUT") {
    await autoCreateCleaningTask(id)
  }
  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
  revalidatePath("/menage")
}
```

### 2d — UI

- [ ] **Step 10: Create menage-table.tsx client component**

Create `apps/backoffice/app/(protected)/menage/menage-table.tsx`:

```tsx
"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import type { getCleaningTasks } from "@/lib/dal/menage"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

type CleaningRow = Awaited<ReturnType<typeof getCleaningTasks>>[number]

const columns: ColumnDef<CleaningRow>[] = [
  {
    accessorKey: "date_prevue",
    header: "Date prévue",
    cell: ({ row }) =>
      new Date(row.original.date_prevue).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
  },
  {
    accessorKey: "property.nom",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.property.id}`} className="text-primary hover:underline">
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    header: "Séjour",
    cell: ({ row }) => {
      const b = row.original.booking
      return (
        <Link href={`/reservations/${b.id}`} className="text-muted-foreground hover:text-primary text-xs">
          {new Date(b.check_in).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          {" → "}
          {new Date(b.check_out).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </Link>
      )
    },
  },
  {
    header: "Prestataire",
    cell: ({ row }) =>
      row.original.contractor ? (
        <Link href={`/prestataires/${row.original.contractor.id}`} className="text-primary hover:underline">
          {row.original.contractor.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground text-xs">Non assigné</span>
      ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/menage/${row.original.id}`} className="text-xs text-primary hover:underline">
        Voir
      </Link>
    ),
  },
]

export function MenageTable({ data }: { data: CleaningRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="property.nom"
      searchPlaceholder="Filtrer par bien..."
    />
  )
}
```

- [ ] **Step 11: Create menage/page.tsx**

Create `apps/backoffice/app/(protected)/menage/page.tsx`:

```tsx
import { getCleaningTasks } from "@/lib/dal/menage"
import { PageHeader } from "@/components/ui/page-header"
import { MenageTable } from "./menage-table"

export default async function MenagePage() {
  const tasks = await getCleaningTasks()
  const pending = tasks.filter((t) => t.statut !== "TERMINEE" && t.statut !== "PROBLEME").length

  return (
    <div>
      <PageHeader
        title="Ménage"
        description={`${pending} tâche${pending !== 1 ? "s" : ""} en attente`}
      />
      <MenageTable data={tasks} />
    </div>
  )
}
```

- [ ] **Step 12: Create menage/[id]/actions.ts**

Create `apps/backoffice/app/(protected)/menage/[id]/actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { updateCleaningStatut } from "@/lib/dal/menage"

export async function updateCleaningStatutAction(
  id: string,
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"
) {
  await updateCleaningStatut(id, statut)
  revalidatePath(`/menage/${id}`)
  revalidatePath("/menage")
}
```

- [ ] **Step 13: Create menage/[id]/page.tsx**

Create `apps/backoffice/app/(protected)/menage/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCleaningTaskById } from "@/lib/dal/menage"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateCleaningStatutAction } from "./actions"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME" }>> = {
  PLANIFIEE: [
    { label: "Démarrer", value: "EN_COURS" },
    { label: "Signaler problème", value: "PROBLEME" },
  ],
  EN_COURS: [
    { label: "Terminer", value: "TERMINEE" },
    { label: "Signaler problème", value: "PROBLEME" },
  ],
  TERMINEE: [],
  PROBLEME: [{ label: "Relancer", value: "PLANIFIEE" }],
}

export default async function CleaningTaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const task = await getCleaningTaskById(params.id)
  if (!task) notFound()

  const actions = NEXT_STATUTS[task.statut] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ménage — ${task.property.nom}`}
        actions={
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <form
                key={action.value}
                action={updateCleaningStatutAction.bind(null, task.id, action.value)}
              >
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Détails</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bien</span>
              <Link href={`/biens/${task.property.id}`} className="text-primary hover:underline">
                {task.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date prévue</span>
              <span className="text-foreground">
                {new Date(task.date_prevue).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {task.date_realisation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Réalisé le</span>
                <span className="text-foreground">
                  {new Date(task.date_realisation).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={task.statut} />
            </div>
            {task.contractor ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${task.contractor.id}`} className="text-primary hover:underline">
                  {task.contractor.nom}
                </Link>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <span className="text-muted-foreground text-xs">Non assigné</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Séjour lié</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voyageur</span>
              <span className="text-foreground">
                {task.booking.guest.prenom} {task.booking.guest.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="text-foreground">
                {new Date(task.booking.check_in).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="text-foreground">
                {new Date(task.booking.check_out).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <Link
              href={`/reservations/${task.booking.id}`}
              className="inline-block text-xs text-primary hover:underline pt-1"
            >
              Voir la réservation
            </Link>
          </div>
        </div>
      </div>

      {task.notes && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Notes</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 14: Add Ménage nav link to layout**

In `apps/backoffice/app/(protected)/layout.tsx`, add after the Planning nav item:

```tsx
{ href: "/menage", label: "Ménage", icon: SprayCan },
```

Also add `SprayCan` to the Lucide import.

- [ ] **Step 15: Run all tests**

```bash
cd apps/backoffice && pnpm vitest run
```

Expected: all existing tests + 7 new tests pass.

- [ ] **Step 16: Commit**

```bash
git add apps/backoffice/lib/validations/menage.ts apps/backoffice/lib/validations/menage.test.ts \
  apps/backoffice/lib/dal/menage.ts apps/backoffice/lib/dal/menage.test.ts \
  apps/backoffice/app/\(protected\)/menage/ \
  apps/backoffice/app/\(protected\)/reservations/\[id\]/actions.ts \
  apps/backoffice/app/\(protected\)/layout.tsx
git commit -m "feat(menage): add CleaningTask module + auto-create on CHECKEDOUT"
```

---

## Task 3: Devis dans Travaux

**Files:**
- Create: `apps/backoffice/lib/validations/devis.ts`
- Create: `apps/backoffice/lib/validations/devis.test.ts`
- Modify: `apps/backoffice/lib/dal/travaux.ts` (add `saveDevis` + `getWorkOrderWithMandate`)
- Create: `apps/backoffice/app/(protected)/travaux/[id]/devis-form.tsx`
- Create: `apps/backoffice/app/(protected)/travaux/[id]/devis-actions.ts`
- Modify: `apps/backoffice/app/(protected)/travaux/[id]/page.tsx` (embed DevisForm)

### 3a — Validation + DAL

- [ ] **Step 1: Write failing devis validation tests**

Create `apps/backoffice/lib/validations/devis.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { devisSchema, validateDevisAgainstSeuil } from "./devis"

describe("devisSchema", () => {
  it("accepts valid devis", () => {
    const result = devisSchema.safeParse({ montant_devis: 350, notes_devis: "Réfection peinture" })
    expect(result.success).toBe(true)
  })

  it("rejects zero or negative montant", () => {
    expect(devisSchema.safeParse({ montant_devis: 0 }).success).toBe(false)
    expect(devisSchema.safeParse({ montant_devis: -100 }).success).toBe(false)
  })

  it("requires montant_devis", () => {
    expect(devisSchema.safeParse({}).success).toBe(false)
  })
})

describe("validateDevisAgainstSeuil", () => {
  it("returns VALIDE when montant <= seuil", () => {
    expect(validateDevisAgainstSeuil(400, 500)).toBe("VALIDE")
  })

  it("returns EN_ATTENTE_VALIDATION when montant > seuil", () => {
    expect(validateDevisAgainstSeuil(600, 500)).toBe("EN_ATTENTE_VALIDATION")
  })

  it("returns VALIDE when montant equals seuil exactly", () => {
    expect(validateDevisAgainstSeuil(500, 500)).toBe("VALIDE")
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd apps/backoffice && pnpm vitest run lib/validations/devis.test.ts
```

Expected: FAIL — "Cannot find module './devis'"

- [ ] **Step 3: Implement devis validation**

Create `apps/backoffice/lib/validations/devis.ts`:

```ts
import { z } from "zod"

export const devisSchema = z.object({
  montant_devis: z.number({ required_error: "Montant requis" }).positive("Montant doit être positif"),
  notes_devis: z.string().optional(),
})

export type DevisFormData = z.infer<typeof devisSchema>

/**
 * Returns the next WorkOrder statut after a devis is recorded.
 * If montant > seuil_validation_devis on the mandate, the owner must validate.
 */
export function validateDevisAgainstSeuil(
  montant: number,
  seuil: number
): "VALIDE" | "EN_ATTENTE_VALIDATION" {
  return montant <= seuil ? "VALIDE" : "EN_ATTENTE_VALIDATION"
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd apps/backoffice && pnpm vitest run lib/validations/devis.test.ts
```

Expected: PASS (6/6)

- [ ] **Step 5: Add saveDevis to travaux DAL**

Read `apps/backoffice/lib/dal/travaux.ts`. Add the following functions at the end of the file:

```ts
export async function getWorkOrderWithMandate(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          mandate: { select: { seuil_validation_devis: true } },
        },
      },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
  })
}

export async function saveDevis(
  id: string,
  data: { montant_devis: number; notes_devis?: string; next_statut: "VALIDE" | "EN_ATTENTE_VALIDATION" }
) {
  return db.workOrder.update({
    where: { id },
    data: {
      statut: data.next_statut,
      notes: data.notes_devis ?? undefined,
      // Store amount in the notes field prefixed for now — no extra migration needed
      // The devis_id field exists for a future Document link
    },
  })
}
```

> Note: The schema has `devis_id String?` (for a future Document FK) but no `montant_devis` column. Rather than a migration, we encode the devis amount in `notes` until a P2 migration adds the column. The plan records this limitation clearly.

**Revised approach — add montant_devis field via Prisma migration:**

The cleaner solution is a migration. Replace the saveDevis implementation with this instead:

Step 5a: Add fields to schema.

In `packages/db/prisma/schema.prisma`, find the `WorkOrder` model and add two fields before the `notes` line:

```prisma
  montant_devis Float?
  notes_devis   String?
```

Step 5b: Run migration:

```bash
cd packages/db && npx prisma migrate dev --name add_workorder_devis_fields
```

Step 5c: Implement `saveDevis` in `lib/dal/travaux.ts`:

```ts
export async function getWorkOrderWithMandate(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          mandate: { select: { seuil_validation_devis: true } },
        },
      },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
  })
}

export async function saveDevis(
  id: string,
  data: {
    montant_devis: number
    notes_devis?: string
    next_statut: "VALIDE" | "EN_ATTENTE_VALIDATION"
  }
) {
  return db.workOrder.update({
    where: { id },
    data: {
      montant_devis: data.montant_devis,
      notes_devis: data.notes_devis,
      statut: data.next_statut,
    },
  })
}
```

Also update `getWorkOrderById` to include the new fields in its select (they'll be returned automatically since they're on the model).

- [ ] **Step 6: Run existing travaux tests to verify nothing broken**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/travaux.test.ts
```

Expected: all existing tests pass (mock-based, unaffected by new fields).

### 3b — UI

- [ ] **Step 7: Create devis-actions.ts**

Create `apps/backoffice/app/(protected)/travaux/[id]/devis-actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { devisSchema, validateDevisAgainstSeuil } from "@/lib/validations/devis"
import { getWorkOrderWithMandate, saveDevis } from "@/lib/dal/travaux"

export async function saveDevisAction(id: string, formData: FormData) {
  const raw = {
    montant_devis: parseFloat(formData.get("montant_devis") as string),
    notes_devis: formData.get("notes_devis") as string || undefined,
  }

  const parsed = devisSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const wo = await getWorkOrderWithMandate(id)
  if (!wo) return { error: "Ordre de service introuvable" }

  const seuil = wo.property.mandate?.seuil_validation_devis ?? 500
  const next_statut = validateDevisAgainstSeuil(parsed.data.montant_devis, seuil)

  await saveDevis(id, { ...parsed.data, next_statut })
  revalidatePath(`/travaux/${id}`)
  revalidatePath("/travaux")
}
```

- [ ] **Step 8: Create devis-form.tsx client component**

Create `apps/backoffice/app/(protected)/travaux/[id]/devis-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import { saveDevisAction } from "./devis-actions"

export function DevisForm({
  workOrderId,
  montantDevisActuel,
  notesDevisActuel,
  seuil,
}: {
  workOrderId: string
  montantDevisActuel: number | null
  notesDevisActuel: string | null
  seuil: number
}) {
  const [state, formAction] = useActionState(
    saveDevisAction.bind(null, workOrderId),
    null
  )

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Devis prestataire
      </h2>
      <p className="text-xs text-muted-foreground">
        Seuil de validation automatique : {seuil.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Montant HT (€) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            name="montant_devis"
            step="0.01"
            min="0.01"
            defaultValue={montantDevisActuel ?? ""}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Notes
          </label>
          <textarea
            name="notes_devis"
            rows={3}
            defaultValue={notesDevisActuel ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Enregistrer le devis
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 9: Embed DevisForm in workorder detail page**

Read `apps/backoffice/app/(protected)/travaux/[id]/page.tsx`. 

Change the import of `getWorkOrderById` to `getWorkOrderWithMandate`, since it now includes the mandate seuil. Add the DevisForm import and embed it in the page when statut is `EN_ATTENTE_DEVIS`:

Replace the `import { getWorkOrderById } from "@/lib/dal/travaux"` line with:
```tsx
import { getWorkOrderWithMandate } from "@/lib/dal/travaux"
import { DevisForm } from "./devis-form"
```

Replace `const wo = await getWorkOrderById(params.id)` with:
```tsx
const wo = await getWorkOrderWithMandate(params.id)
```

Add a devis section after the two-column grid (before the closing `</div>`):

```tsx
{wo.statut === "EN_ATTENTE_DEVIS" && (
  <DevisForm
    workOrderId={wo.id}
    montantDevisActuel={(wo as any).montant_devis ?? null}
    notesDevisActuel={(wo as any).notes_devis ?? null}
    seuil={wo.property.mandate?.seuil_validation_devis ?? 500}
  />
)}
{(wo as any).montant_devis && wo.statut !== "EN_ATTENTE_DEVIS" && (
  <div className="bg-card border rounded-lg p-6">
    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Devis</h2>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Montant HT</span>
        <span className="font-medium">
          {(wo as any).montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
        </span>
      </div>
      {(wo as any).notes_devis && (
        <p className="text-muted-foreground text-xs pt-1">{(wo as any).notes_devis}</p>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 10: Run all tests**

```bash
cd apps/backoffice && pnpm vitest run
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
git add packages/db/prisma/ \
  apps/backoffice/lib/validations/devis.ts apps/backoffice/lib/validations/devis.test.ts \
  apps/backoffice/lib/dal/travaux.ts \
  apps/backoffice/app/\(protected\)/travaux/\[id\]/
git commit -m "feat(travaux): add devis recording with auto-validation against mandate seuil"
```

---

## Task 4: CRG Automatique (ManagementReport)

**Files:**
- Create: `apps/backoffice/lib/dal/crg.ts`
- Create: `apps/backoffice/lib/dal/crg.test.ts`
- Create: `apps/backoffice/app/(protected)/crg/page.tsx`
- Create: `apps/backoffice/app/(protected)/crg/crg-table.tsx`
- Create: `apps/backoffice/app/(protected)/crg/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/crg/new/actions.ts`
- Modify: `apps/backoffice/app/(protected)/layout.tsx` (nav link)

### 4a — CRG DAL

- [ ] **Step 1: Write failing CRG DAL tests**

Create `apps/backoffice/lib/dal/crg.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { computeCrgAmounts } from "./crg"

vi.mock("@conciergerie/db", () => ({
  db: {
    booking: { findMany: vi.fn() },
    transaction: { findMany: vi.fn() },
    mandate: { findFirst: vi.fn() },
    managementReport: { create: vi.fn() },
    transaction: { create: vi.fn() },
    mandantAccount: { update: vi.fn() },
  },
}))

describe("computeCrgAmounts", () => {
  it("calculates revenus, honoraires, charges, montant_reverse correctly", () => {
    const bookings = [
      { revenu_net_proprietaire: 1000 },
      { revenu_net_proprietaire: 500 },
    ]
    const charges = [
      { montant: -200 },  // TRAVAUX transaction
    ]
    const taux_honoraires = 0.15

    const result = computeCrgAmounts(bookings, charges, taux_honoraires)

    expect(result.revenus_sejours).toBe(1500)
    expect(result.honoraires_deduits).toBeCloseTo(225)       // 1500 * 0.15
    expect(result.charges_deduites).toBe(200)               // abs of TRAVAUX charges
    expect(result.montant_reverse).toBeCloseTo(1075)        // 1500 - 225 - 200
  })

  it("returns zero montant_reverse when honoraires + charges exceed revenus", () => {
    const result = computeCrgAmounts(
      [{ revenu_net_proprietaire: 100 }],
      [{ montant: -500 }],
      0.20
    )
    expect(result.montant_reverse).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/crg.test.ts
```

Expected: FAIL

- [ ] **Step 3: Implement CRG DAL**

Create `apps/backoffice/lib/dal/crg.ts`:

```ts
import { db } from "@conciergerie/db"

/** Pure calculation — easy to test, no DB calls */
export function computeCrgAmounts(
  bookings: Array<{ revenu_net_proprietaire: number }>,
  charges: Array<{ montant: number }>,
  taux_honoraires: number
) {
  const revenus_sejours = bookings.reduce((sum, b) => sum + b.revenu_net_proprietaire, 0)
  const honoraires_deduits = Math.round(revenus_sejours * taux_honoraires * 100) / 100
  const charges_deduites = Math.abs(
    charges.reduce((sum, c) => sum + c.montant, 0)
  )
  const montant_reverse = Math.max(0, revenus_sejours - honoraires_deduits - charges_deduites)
  return { revenus_sejours, honoraires_deduits, charges_deduites, montant_reverse }
}

export async function getManagementReports() {
  return db.managementReport.findMany({
    include: {
      account: {
        include: { owner: { select: { id: true, nom: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function generateCrg(data: {
  owner_id: string
  periode_debut: Date
  periode_fin: Date
}) {
  // 1. Get mandantAccount
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: data.owner_id },
  })
  if (!account) throw new Error("Compte mandant introuvable")

  // 2. Get mandate to find taux_honoraires
  const mandate = await db.mandate.findFirst({
    where: { owner_id: data.owner_id, statut: "ACTIF" },
    select: { taux_honoraires: true },
  })
  const taux_honoraires = mandate?.taux_honoraires ?? 0.20

  // 3. Get CHECKEDOUT bookings in period
  const bookings = await db.booking.findMany({
    where: {
      property: { mandate: { owner_id: data.owner_id } },
      statut: "CHECKEDOUT",
      check_out: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { revenu_net_proprietaire: true },
  })

  // 4. Get TRAVAUX charges in period
  const charges = await db.transaction.findMany({
    where: {
      mandant_account_id: account.id,
      type: { in: ["TRAVAUX", "CHARGE"] },
      date: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { montant: true },
  })

  // 5. Compute amounts
  const amounts = computeCrgAmounts(bookings, charges, taux_honoraires)

  // 6. Persist report + reversement transaction in a DB transaction
  const report = await db.$transaction(async (tx) => {
    const created = await tx.managementReport.create({
      data: {
        mandant_account_id: account.id,
        periode_debut: data.periode_debut,
        periode_fin: data.periode_fin,
        ...amounts,
      },
    })

    // Create REVERSEMENT transaction
    await tx.transaction.create({
      data: {
        mandant_account_id: account.id,
        type: "REVERSEMENT",
        montant: -amounts.montant_reverse,
        date: new Date(),
        libelle: `Reversement CRG ${data.periode_debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      },
    })

    // Update account balance
    await tx.mandantAccount.update({
      where: { id: account.id },
      data: { solde_courant: { decrement: amounts.montant_reverse } },
    })

    return created
  })

  return report
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/crg.test.ts
```

Expected: PASS (3/3)

### 4b — UI

- [ ] **Step 5: Create crg-table.tsx client component**

Create `apps/backoffice/app/(protected)/crg/crg-table.tsx`:

```tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { getManagementReports } from "@/lib/dal/crg"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"

type CrgRow = Awaited<ReturnType<typeof getManagementReports>>[number]

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const columns: ColumnDef<CrgRow>[] = [
  {
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link href={`/proprietaires/${row.original.account.owner.id}`} className="text-primary hover:underline">
        {row.original.account.owner.nom}
      </Link>
    ),
  },
  {
    header: "Période",
    cell: ({ row }) =>
      `${new Date(row.original.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → ${new Date(row.original.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`,
  },
  {
    accessorKey: "revenus_sejours",
    header: "Revenus",
    cell: ({ row }) => fmt(row.original.revenus_sejours),
  },
  {
    accessorKey: "honoraires_deduits",
    header: "Honoraires",
    cell: ({ row }) => fmt(row.original.honoraires_deduits),
  },
  {
    accessorKey: "charges_deduites",
    header: "Charges",
    cell: ({ row }) => fmt(row.original.charges_deduites),
  },
  {
    accessorKey: "montant_reverse",
    header: "Reversé",
    cell: ({ row }) => (
      <span className="font-semibold">{fmt(row.original.montant_reverse)}</span>
    ),
  },
  {
    header: "Virement",
    cell: ({ row }) =>
      row.original.date_virement
        ? new Date(row.original.date_virement).toLocaleDateString("fr-FR")
        : <span className="text-muted-foreground text-xs">En attente</span>,
  },
]

export function CrgTable({ data }: { data: CrgRow[] }) {
  return <DataTable columns={columns} data={data} />
}
```

- [ ] **Step 6: Create crg/page.tsx**

Create `apps/backoffice/app/(protected)/crg/page.tsx`:

```tsx
import Link from "next/link"
import { getManagementReports } from "@/lib/dal/crg"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { CrgTable } from "./crg-table"

export default async function CrgPage() {
  const reports = await getManagementReports()

  return (
    <div>
      <PageHeader
        title="Comptes rendus de gestion"
        description={`${reports.length} CRG généré${reports.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/crg/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Générer un CRG
            </Button>
          </Link>
        }
      />
      <CrgTable data={reports} />
    </div>
  )
}
```

- [ ] **Step 7: Create crg/new/actions.ts**

Create `apps/backoffice/app/(protected)/crg/new/actions.ts`:

```ts
"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { generateCrg } from "@/lib/dal/crg"

const schema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  periode_debut: z.string().min(1, "Date début requise"),
  periode_fin: z.string().min(1, "Date fin requise"),
})

export async function generateCrgAction(_prev: unknown, formData: FormData) {
  const raw = {
    owner_id: formData.get("owner_id"),
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await generateCrg({
      owner_id: parsed.data.owner_id,
      periode_debut: new Date(parsed.data.periode_debut),
      periode_fin: new Date(parsed.data.periode_fin),
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de la génération" }
  }

  redirect("/crg")
}
```

- [ ] **Step 8: Create crg/new/page.tsx**

Create `apps/backoffice/app/(protected)/crg/new/page.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { generateCrgAction } from "./actions"

// Note: owner list is fetched client-side via fetch to avoid RSC → client boundary issue
// In a full implementation this could be a separate Server Component wrapper

export default function NewCrgPage() {
  const [state, formAction] = useActionState(generateCrgAction, null)
  const [owners, setOwners] = useState<Array<{ id: string; nom: string }>>([])

  useEffect(() => {
    fetch("/api/owners")
      .then((r) => r.json())
      .then((data) => setOwners(data))
      .catch(() => {})
  }, [])

  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastOfMonthStr = `${lastOfMonth.getFullYear()}-${String(lastOfMonth.getMonth() + 1).padStart(2, "0")}-${String(lastOfMonth.getDate()).padStart(2, "0")}`

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Générer un CRG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calcule automatiquement revenus, honoraires et charges sur la période.
        </p>
      </div>

      <form action={formAction} className="bg-card border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Propriétaire <span className="text-destructive">*</span>
          </label>
          <select
            name="owner_id"
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Sélectionner…</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Début de période <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            name="periode_debut"
            defaultValue={firstOfMonth}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Fin de période <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            name="periode_fin"
            defaultValue={lastOfMonthStr}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Générer le CRG
          </button>
          <Link
            href="/crg"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 9: Create `/api/owners` route for the owner select**

Create `apps/backoffice/app/api/owners/route.ts`:

```ts
import { NextResponse } from "next/server"
import { db } from "@conciergerie/db"

export async function GET() {
  const owners = await db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })
  return NextResponse.json(owners)
}
```

- [ ] **Step 10: Add CRG nav link to layout**

In `apps/backoffice/app/(protected)/layout.tsx`, add after Comptabilité:

```tsx
{ href: "/crg", label: "CRG", icon: FileBarChart2 },
```

Also add `FileBarChart2` to the Lucide import.

- [ ] **Step 11: Run all tests**

```bash
cd apps/backoffice && pnpm vitest run
```

Expected: all tests pass.

- [ ] **Step 12: Commit**

```bash
git add apps/backoffice/lib/dal/crg.ts apps/backoffice/lib/dal/crg.test.ts \
  apps/backoffice/app/\(protected\)/crg/ \
  apps/backoffice/app/api/owners/ \
  apps/backoffice/app/\(protected\)/layout.tsx
git commit -m "feat(crg): add ManagementReport generation with reversement transaction"
```

---

## Task 5: Dashboard Opérationnel

**Files:**
- Modify: `apps/backoffice/lib/dal/stats.ts`
- Modify: `apps/backoffice/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Write failing stats tests**

Create `apps/backoffice/lib/dal/stats.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@conciergerie/db", () => ({
  db: {
    owner: { count: vi.fn() },
    property: { count: vi.fn() },
    booking: { count: vi.fn(), findMany: vi.fn(), aggregate: vi.fn() },
    cleaningTask: { findMany: vi.fn() },
  },
}))

import { db } from "@conciergerie/db"
import { getDashboardStats } from "./stats"

beforeEach(() => vi.clearAllMocks())

describe("getDashboardStats", () => {
  it("returns todayArrivals, todayDepartures and pendingCleanings", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(3)
    vi.mocked(db.property.count).mockResolvedValue(5)
    vi.mocked(db.booking.count).mockResolvedValue(2)
    vi.mocked(db.booking.aggregate).mockResolvedValue({ _sum: { revenu_net_proprietaire: 3000 } } as any)
    vi.mocked(db.booking.findMany).mockResolvedValue([])
    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([
      { id: "ct1", statut: "PLANIFIEE" },
      { id: "ct2", statut: "EN_COURS" },
    ] as any)

    const stats = await getDashboardStats()

    expect(stats).toHaveProperty("todayArrivals")
    expect(stats).toHaveProperty("todayDepartures")
    expect(stats).toHaveProperty("pendingCleanings")
    expect(stats.pendingCleanings).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/stats.test.ts
```

Expected: FAIL — "stats.todayArrivals is undefined"

- [ ] **Step 3: Extend getDashboardStats**

Read `apps/backoffice/lib/dal/stats.ts`. Replace with:

```ts
import { db } from "@conciergerie/db"

export async function getDashboardStats() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    recentRevenu,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
  ] = await Promise.all([
    db.owner.count(),
    db.property.count({ where: { statut: "ACTIF" } }),
    db.booking.count({ where: { statut: { in: ["CONFIRMED", "CHECKEDIN"] } } }),
    db.booking.findMany({
      where: {
        statut: "CONFIRMED",
        check_in: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: { guest: true, property: true },
      orderBy: { check_in: "asc" },
      take: 5,
    }),
    db.booking.aggregate({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDOUT"] },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    // Today's check-ins
    db.booking.findMany({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDIN"] },
        check_in: { gte: todayStart, lte: todayEnd },
      },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_in: "asc" },
    }),
    // Today's check-outs
    db.booking.findMany({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
        check_out: { gte: todayStart, lte: todayEnd },
      },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_out: "asc" },
    }),
    // Pending cleaning tasks (today + overdue)
    db.cleaningTask.findMany({
      where: {
        statut: { in: ["PLANIFIEE", "EN_COURS", "PROBLEME"] },
        date_prevue: { lte: todayEnd },
      },
      include: {
        property: { select: { id: true, nom: true } },
        contractor: { select: { id: true, nom: true } },
        booking: { select: { id: true } },
      },
      orderBy: { date_prevue: "asc" },
    }),
  ])

  return {
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    revenuMoisCourant: recentRevenu._sum.revenu_net_proprietaire ?? 0,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd apps/backoffice && pnpm vitest run lib/dal/stats.test.ts
```

Expected: PASS (1/1)

- [ ] **Step 5: Update dashboard page to show operational sections**

Read `apps/backoffice/app/(protected)/dashboard/page.tsx`. Replace the file with:

```tsx
import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, Building2, CalendarDays, TrendingUp, LogIn, LogOut, SprayCan } from "lucide-react"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const KPI_CARDS = [
    {
      label: "Propriétaires",
      value: stats.totalOwners,
      icon: Users,
      href: "/proprietaires",
    },
    {
      label: "Biens actifs",
      value: stats.totalProperties,
      icon: Building2,
      href: "/biens",
    },
    {
      label: "Réservations actives",
      value: stats.activeBookings,
      icon: CalendarDays,
      href: "/reservations",
    },
    {
      label: "Revenus ce mois",
      value: stats.revenuMoisCourant.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
      icon: TrendingUp,
      href: "/reservations",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Opérations du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Arrivées */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-green-600" />
            Arrivées aujourd'hui ({stats.todayArrivals.length})
          </h2>
          {stats.todayArrivals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune arrivée</p>
          ) : (
            <div className="space-y-2">
              {stats.todayArrivals.map((b) => (
                <Link
                  key={b.id}
                  href={`/reservations/${b.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {b.guest.prenom} {b.guest.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.property.nom}</p>
                  </div>
                  <StatusBadge status={b.statut} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Départs */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-orange-500" />
            Départs aujourd'hui ({stats.todayDepartures.length})
          </h2>
          {stats.todayDepartures.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun départ</p>
          ) : (
            <div className="space-y-2">
              {stats.todayDepartures.map((b) => (
                <Link
                  key={b.id}
                  href={`/reservations/${b.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {b.guest.prenom} {b.guest.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.property.nom}</p>
                  </div>
                  <StatusBadge status={b.statut} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ménages en attente */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <SprayCan className="w-4 h-4 text-blue-500" />
            Ménages en attente ({stats.pendingCleanings.length})
          </h2>
          {stats.pendingCleanings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun ménage en attente</p>
          ) : (
            <div className="space-y-2">
              {stats.pendingCleanings.slice(0, 5).map((ct) => (
                <Link
                  key={ct.id}
                  href={`/menage/${ct.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ct.property.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {ct.contractor ? ct.contractor.nom : "Non assigné"} —{" "}
                      {new Date(ct.date_prevue).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={ct.statut} />
                </Link>
              ))}
              {stats.pendingCleanings.length > 5 && (
                <Link href="/menage" className="text-xs text-primary hover:underline block pt-1">
                  Voir tout ({stats.pendingCleanings.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-ins à venir */}
      {stats.upcomingCheckIns.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Check-ins à venir (7 jours)
          </h2>
          <div className="space-y-2">
            {stats.upcomingCheckIns.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.property.nom} — {booking.nb_nuits} nuit{booking.nb_nuits > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <StatusBadge status={booking.statut} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run all tests**

```bash
cd apps/backoffice && pnpm vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/backoffice/lib/dal/stats.ts apps/backoffice/lib/dal/stats.test.ts \
  apps/backoffice/app/\(protected\)/dashboard/page.tsx
git commit -m "feat(dashboard): add today's arrivals, departures, and pending cleanings"
```

---

## Self-Review Checklist

**Spec coverage:**

| Requirement | Task |
|-------------|------|
| Planning calendrier mensuel par bien | Task 1 |
| Module ménage (CleaningTask) — liste, détail, statuts | Task 2 |
| Auto-création ménage lors du checkout | Task 2c |
| Enregistrement devis prestataire sur OS | Task 3 |
| Validation automatique vs seuil_validation_devis | Task 3 |
| CRG: calcul revenus / honoraires / charges / reversement | Task 4 |
| CRG: création transaction REVERSEMENT | Task 4 |
| Dashboard: arrivées/départs/ménages du jour | Task 5 |
| Nav links pour tous les nouveaux modules | Tasks 1, 2, 4 |

**No placeholder issues found.**

**Type consistency:**
- `CleaningTask` statuts: `"PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"` — consistent across DAL, actions, and detail page NEXT_STATUTS map.
- `WorkOrder` statuts: `"VALIDE" | "EN_ATTENTE_VALIDATION"` returned by `validateDevisAgainstSeuil` — consistent with `updateWorkOrderStatut` signature in `travaux.ts`.
- `ManagementReport` fields: `revenus_sejours / honoraires_deduits / charges_deduites / montant_reverse` — consistent between `computeCrgAmounts` return, `generateCrg` call, and `crg-table.tsx` accessorKeys.
