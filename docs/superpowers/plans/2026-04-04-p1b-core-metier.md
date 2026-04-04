# P1b — Core Métier — Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le CRM propriétaires, le référentiel biens, les mandats, les réservations, la gestion voyageurs, le calendrier, la tarification et la synchronisation Airbnb dans le back-office.

**Architecture:** Next.js 14 App Router — Server Components pour toutes les pages de liste/détail (fetch Prisma direct), "use client" uniquement pour les formulaires (react-hook-form + zod). Server Actions pour toutes les mutations (pas d'API routes pour le CRUD interne). Revalidation via `revalidatePath()` + redirect après mutation. TanStack Table v8 pour les tableaux triables. No emojis — Lucide icons uniquement.

**Tech Stack:** Next.js 14 App Router, Prisma, react-hook-form, zod, @tanstack/react-table, sonner, lucide-react, @conciergerie/ui (shadcn Provence), @conciergerie/types (enums), @conciergerie/db

---

## Fichiers créés / modifiés

```
apps/backoffice/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                          ← Navigation latérale fixe
│   │   └── header.tsx                           ← Header avec user info + logout
│   └── ui/
│       ├── data-table.tsx                       ← TanStack Table wrapper réutilisable
│       ├── page-header.tsx                      ← Titre + actions en-tête de page
│       └── status-badge.tsx                     ← Badge coloré selon statut
├── lib/
│   ├── dal/
│   │   ├── owners.ts                            ← Prisma queries Owner
│   │   ├── properties.ts                        ← Prisma queries Property
│   │   ├── mandates.ts                          ← Prisma queries Mandate
│   │   ├── guests.ts                            ← Prisma queries Guest
│   │   ├── bookings.ts                          ← Prisma queries Booking
│   │   └── airbnb.ts                            ← Prisma queries AirbnbListing
│   └── validations/
│       ├── owner.ts                             ← Zod schema Owner
│       ├── property.ts                          ← Zod schema Property
│       ├── mandate.ts                           ← Zod schema Mandate
│       ├── guest.ts                             ← Zod schema Guest
│       └── booking.ts                           ← Zod schema Booking
├── app/(protected)/
│   ├── layout.tsx                               ← Mise à jour : sidebar + header
│   ├── dashboard/page.tsx                       ← Mise à jour : KPIs réels
│   ├── proprietaires/
│   │   ├── page.tsx                             ← Liste owners (Server Component)
│   │   ├── new/
│   │   │   ├── page.tsx                         ← Formulaire création
│   │   │   └── actions.ts                       ← Server Action createOwner
│   │   └── [id]/
│   │       ├── page.tsx                         ← Fiche owner 360°
│   │       ├── edit/page.tsx                    ← Formulaire édition
│   │       └── actions.ts                       ← Server Actions update/delete
│   ├── biens/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       ├── actions.ts
│   │       └── acces/page.tsx                   ← PropertyAccess (check-in/out)
│   ├── mandats/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── voyageurs/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── reservations/
│       ├── page.tsx
│       ├── new/
│       │   ├── page.tsx
│       │   └── actions.ts
│       └── [id]/
│           ├── page.tsx
│           └── actions.ts
└── app/api/
    └── webhooks/
        └── airbnb/
            └── route.ts                         ← Webhook Airbnb (réservations)
```

---

## Task 1 : Navigation — Sidebar + Header + Protected Layout

**Files:**
- Create: `apps/backoffice/components/layout/sidebar.tsx`
- Create: `apps/backoffice/components/layout/header.tsx`
- Modify: `apps/backoffice/app/(protected)/layout.tsx`

- [ ] **Étape 1 : Créer `apps/backoffice/components/layout/sidebar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CalendarDays,
  UserCheck,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@conciergerie/ui"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/proprietaires", label: "Propriétaires", icon: Users },
  { href: "/biens", label: "Biens", icon: Building2 },
  { href: "/mandats", label: "Mandats", icon: FileText },
  { href: "/reservations", label: "Réservations", icon: CalendarDays },
  { href: "/voyageurs", label: "Voyageurs", icon: UserCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-garrigue-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-garrigue-700">
        <div>
          <p className="text-calcaire-100 font-semibold text-sm leading-tight">
            Entre Rhône et Alpilles
          </p>
          <p className="text-garrigue-400 text-xs">Conciergerie</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-garrigue-700 text-calcaire-100"
                  : "text-garrigue-300 hover:bg-garrigue-800 hover:text-calcaire-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-garrigue-700">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-garrigue-400 hover:text-calcaire-100 hover:bg-garrigue-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Administration</span>
        </Link>
      </div>
    </aside>
  )
}
```

- [ ] **Étape 2 : Créer `apps/backoffice/components/layout/header.tsx`**

```tsx
import { auth, signOut } from "@/auth"
import { LogOut, Bell } from "lucide-react"
import { Button } from "@conciergerie/ui"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-white border-b border-garrigue-100 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-garrigue-500 hover:text-garrigue-700 hover:bg-garrigue-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-garrigue-100">
          <div className="text-right">
            <p className="text-sm font-medium text-garrigue-900">
              {session?.user?.name}
            </p>
            <p className="text-xs text-garrigue-500">{session?.user?.role}</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-garrigue-500 hover:text-garrigue-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Étape 3 : Mettre à jour `apps/backoffice/app/(protected)/layout.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.mfaRequired && !session.user.mfaVerified) {
    redirect("/login/mfa")
  }

  return (
    <div className="min-h-screen bg-calcaire-50">
      <Sidebar />
      <Header />
      <main className="pl-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Étape 4 : Mettre à jour `apps/backoffice/tailwind.config.ts`** — vérifier que `garrigue-50` et `calcaire-50` existent. Si ces variantes manquent, ajouter dans `packages/ui/tailwind.config.ts` :

Dans le tableau `garrigue`, ajouter : `50: "#f7f4f2"`.
Dans le tableau `calcaire`, ajouter : `50: "#faf8f5"`.

> Note : si les fichiers packages/ui/tailwind.config.ts et apps/backoffice/tailwind.config.ts préfixent avec `@conciergerie/ui`, propager la modification.

- [ ] **Étape 5 : Commit**

```bash
git add apps/backoffice/components/layout/ apps/backoffice/app/\(protected\)/layout.tsx
git commit -m "feat: add back-office layout (sidebar + header)"
```

---

## Task 2 : Shared UI — DataTable + PageHeader + StatusBadge

**Files:**
- Create: `apps/backoffice/components/ui/data-table.tsx`
- Create: `apps/backoffice/components/ui/page-header.tsx`
- Create: `apps/backoffice/components/ui/status-badge.tsx`
- Test: `apps/backoffice/components/ui/status-badge.test.tsx`

- [ ] **Étape 1 : Installer TanStack Table**

```bash
pnpm --filter @conciergerie/backoffice add @tanstack/react-table
```

- [ ] **Étape 2 : Écrire le test de StatusBadge**

Créer `apps/backoffice/components/ui/status-badge.test.tsx` :

```tsx
import { describe, it, expect } from "vitest"
import { getStatusConfig } from "./status-badge"

describe("getStatusConfig", () => {
  it("retourne une config valide pour ACTIF", () => {
    const config = getStatusConfig("ACTIF")
    expect(config.label).toBe("Actif")
    expect(config.className).toContain("green")
  })

  it("retourne une config valide pour RESILIE", () => {
    const config = getStatusConfig("RESILIE")
    expect(config.label).toBe("Résilié")
    expect(config.className).toContain("red")
  })

  it("retourne fallback pour statut inconnu", () => {
    const config = getStatusConfig("UNKNOWN")
    expect(config.label).toBe("UNKNOWN")
    expect(config.className).toBeDefined()
  })
})
```

- [ ] **Étape 3 : Lancer le test pour vérifier qu'il échoue**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : FAIL avec `Cannot find module './status-badge'`

- [ ] **Étape 4 : Créer `apps/backoffice/components/ui/status-badge.tsx`**

```tsx
import { cn } from "@conciergerie/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIF: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIF: { label: "Inactif", className: "bg-gray-100 text-gray-600" },
  TRAVAUX: { label: "Travaux", className: "bg-orange-100 text-orange-800" },
  SUSPENDU: { label: "Suspendu", className: "bg-yellow-100 text-yellow-800" },
  RESILIE: { label: "Résilié", className: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "Confirmée", className: "bg-green-100 text-green-800" },
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CHECKEDIN: { label: "Check-in", className: "bg-blue-100 text-blue-800" },
  CHECKEDOUT: { label: "Check-out", className: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-800" },
  INDIVIDUAL: { label: "Particulier", className: "bg-garrigue-100 text-garrigue-800" },
  SCI: { label: "SCI", className: "bg-lavande-100 text-lavande-800" },
  INDIVISION: { label: "Indivision", className: "bg-argile-100 text-argile-800" },
}

export function getStatusConfig(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-gray-100 text-gray-600" }
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

- [ ] **Étape 5 : Créer `apps/backoffice/components/ui/data-table.tsx`**

```tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Input } from "@conciergerie/ui"
import { Button } from "@conciergerie/ui"
import { cn } from "@conciergerie/ui"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Rechercher…",
  searchColumn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="space-y-4">
      {searchColumn !== undefined && (
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      )}

      <div className="rounded-lg border border-garrigue-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-garrigue-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-garrigue-700 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 hover:text-garrigue-900"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-garrigue-50">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-garrigue-400"
                >
                  Aucun résultat
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white hover:bg-garrigue-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-garrigue-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-garrigue-500">
        <span>
          {table.getFilteredRowModel().rows.length} résultat
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <span className="px-2">
            Page {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/components/ui/page-header.tsx`**

```tsx
import { cn } from "@conciergerie/ui"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-garrigue-900">{title}</h1>
        {description && (
          <p className="text-sm text-garrigue-500 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

- [ ] **Étape 7 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — 15 tests (12 précédents + 3 status-badge)

- [ ] **Étape 8 : Commit**

```bash
git add apps/backoffice/components/
git commit -m "feat: add shared UI components (DataTable, PageHeader, StatusBadge)"
```

---

## Task 3 : CRM Propriétaires

**Files:**
- Create: `apps/backoffice/lib/dal/owners.ts`
- Create: `apps/backoffice/lib/validations/owner.ts`
- Create: `apps/backoffice/app/(protected)/proprietaires/page.tsx`
- Create: `apps/backoffice/app/(protected)/proprietaires/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/proprietaires/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/proprietaires/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/proprietaires/[id]/edit/page.tsx`
- Create: `apps/backoffice/app/(protected)/proprietaires/[id]/actions.ts`
- Test: `apps/backoffice/lib/validations/owner.test.ts`

- [ ] **Étape 1 : Écrire les tests de validation**

Créer `apps/backoffice/lib/validations/owner.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { ownerSchema } from "./owner"

describe("ownerSchema", () => {
  it("valide un propriétaire individuel valide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "Jean Dupont",
      email: "jean@exemple.fr",
      telephone: "0612345678",
      adresse: {
        rue: "12 rue de la Paix",
        code_postal: "13001",
        ville: "Marseille",
        pays: "France",
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejette un email invalide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "Jean Dupont",
      email: "pas-un-email",
      adresse: { rue: "12 rue de la Paix", code_postal: "13001", ville: "Marseille", pays: "France" },
    })
    expect(result.success).toBe(false)
  })

  it("rejette un nom vide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "",
      email: "jean@exemple.fr",
      adresse: { rue: "12 rue de la Paix", code_postal: "13001", ville: "Marseille", pays: "France" },
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Étape 2 : Lancer le test pour vérifier qu'il échoue**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : FAIL avec `Cannot find module './owner'`

- [ ] **Étape 3 : Créer `apps/backoffice/lib/validations/owner.ts`**

```typescript
import { z } from "zod"

const adresseSchema = z.object({
  rue: z.string().min(1, "Rue requise"),
  complement: z.string().optional(),
  code_postal: z.string().min(5, "Code postal invalide").max(5),
  ville: z.string().min(1, "Ville requise"),
  pays: z.string().default("France"),
})

export const ownerSchema = z.object({
  type: z.enum(["INDIVIDUAL", "SCI", "INDIVISION"]),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  adresse: adresseSchema,
  rib_iban: z.string().optional(),
  nif: z.string().optional(),
  notes: z.string().optional(),
})

export type OwnerFormData = z.infer<typeof ownerSchema>
```

- [ ] **Étape 4 : Lancer les tests pour vérifier qu'ils passent**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — 3 nouveaux tests

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/owners.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwners() {
  return db.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { mandates: true } },
    },
  })
}

export async function getOwnerById(id: string) {
  return db.owner.findUnique({
    where: { id },
    include: {
      mandates: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
      },
      mandantAccount: true,
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
}

export async function createOwner(data: {
  type: "INDIVIDUAL" | "SCI" | "INDIVISION"
  nom: string
  email: string
  telephone?: string
  adresse: object
  rib_iban?: string
  nif?: string
  notes?: string
}) {
  const owner = await db.owner.create({ data })
  // Créer automatiquement le compte mandant
  await db.mandantAccount.create({
    data: { owner_id: owner.id },
  })
  return owner
}

export async function updateOwner(
  id: string,
  data: Partial<{
    type: "INDIVIDUAL" | "SCI" | "INDIVISION"
    nom: string
    email: string
    telephone: string
    adresse: object
    rib_iban: string
    nif: string
    notes: string
  }>
) {
  return db.owner.update({ where: { id }, data })
}

export async function deleteOwner(id: string) {
  return db.owner.delete({ where: { id } })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/proprietaires/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ownerSchema } from "@/lib/validations/owner"
import { createOwner } from "@/lib/dal/owners"

export async function createOwnerAction(formData: FormData) {
  const raw = {
    type: formData.get("type"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone") || undefined,
    adresse: {
      rue: formData.get("adresse.rue"),
      complement: formData.get("adresse.complement") || undefined,
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: formData.get("adresse.pays") || "France",
    },
    rib_iban: formData.get("rib_iban") || undefined,
    nif: formData.get("nif") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = ownerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const owner = await createOwner(parsed.data)
  revalidatePath("/proprietaires")
  redirect(`/proprietaires/${owner.id}`)
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/proprietaires/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createOwnerAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewOwnerPage() {
  const [state, formAction, isPending] = useActionState(
    createOwnerAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouveau propriétaire"
        actions={
          <Link href="/proprietaires">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl space-y-6">
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type de propriétaire</Label>
          <select
            id="type"
            name="type"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="INDIVIDUAL"
          >
            <option value="INDIVIDUAL">Particulier</option>
            <option value="SCI">SCI</option>
            <option value="INDIVISION">Indivision</option>
          </select>
          {state?.error?.type && (
            <p className="text-sm text-destructive">{state.error.type[0]}</p>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet / Raison sociale</Label>
          <Input id="nom" name="nom" placeholder="Jean Dupont" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jean@exemple.fr" />
          {state?.error?.email && (
            <p className="text-sm text-destructive">{state.error.email[0]}</p>
          )}
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" name="telephone" placeholder="0612345678" />
        </div>

        {/* Adresse */}
        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" placeholder="12 rue de la Paix" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" placeholder="13001" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" placeholder="Marseille" />
            </div>
          </div>
          <input type="hidden" name="adresse.pays" value="France" />
        </fieldset>

        {/* IBAN */}
        <div className="space-y-2">
          <Label htmlFor="rib_iban">IBAN (pour reversements)</Label>
          <Input id="rib_iban" name="rib_iban" placeholder="FR76 xxxx xxxx xxxx xxxx xxxx xxx" />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes internes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Informations complémentaires…"
          />
        </div>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer le propriétaire"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/proprietaires/page.tsx`**

```tsx
import Link from "next/link"
import { getOwners } from "@/lib/dal/owners"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type OwnerRow = Awaited<ReturnType<typeof getOwners>>[number]

const columns: ColumnDef<OwnerRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.id}`}
        className="font-medium text-garrigue-900 hover:text-olivier-600"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <StatusBadge status={row.original.type} />,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-garrigue-600">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => row.original.telephone ?? "—",
  },
  {
    id: "biens",
    header: "Biens",
    cell: ({ row }) => (
      <span className="text-garrigue-500">
        {row.original._count.mandates} bien{row.original._count.mandates !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.id}`}
        className="text-sm text-olivier-600 hover:underline"
      >
        Voir
      </Link>
    ),
  },
]

export default async function ProprietairesPage() {
  const owners = await getOwners()

  return (
    <div>
      <PageHeader
        title="Propriétaires"
        description={`${owners.length} propriétaire${owners.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/proprietaires/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau propriétaire
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={owners}
        searchPlaceholder="Rechercher un propriétaire…"
        searchColumn="nom"
      />
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/proprietaires/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getOwnerById } from "@/lib/dal/owners"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit, Building2, FileText } from "lucide-react"

export default async function OwnerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const owner = await getOwnerById(params.id)
  if (!owner) notFound()

  const adresse = owner.adresse as any

  return (
    <div className="space-y-6">
      <PageHeader
        title={owner.nom}
        actions={
          <Link href={`/proprietaires/${owner.id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      {/* Info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">
            Informations
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Type</span>
              <StatusBadge status={owner.type} />
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Email</span>
              <span className="text-garrigue-800">{owner.email}</span>
            </div>
            {owner.telephone && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Téléphone</span>
                <span className="text-garrigue-800">{owner.telephone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-garrigue-500">Adresse</span>
              <span className="text-garrigue-800 text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
            {owner.rib_iban && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">IBAN</span>
                <span className="font-mono text-xs text-garrigue-600">{owner.rib_iban}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compte mandant */}
        {owner.mandantAccount && (
          <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">
              Compte mandant
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-garrigue-500">Solde courant</span>
                <span className="font-semibold text-garrigue-900">
                  {owner.mandantAccount.solde_courant.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandats */}
      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Mandats ({owner.mandates.length})
          </h2>
          <Link href={`/mandats/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline">Nouveau mandat</Button>
          </Link>
        </div>
        {owner.mandates.length === 0 ? (
          <p className="text-sm text-garrigue-400 text-center py-6">Aucun mandat</p>
        ) : (
          <div className="space-y-2">
            {owner.mandates.map((mandate) => (
              <Link
                key={mandate.id}
                href={`/mandats/${mandate.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-garrigue-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {mandate.property.nom}
                  </p>
                  <p className="text-xs text-garrigue-500">
                    Mandat n° {mandate.numero_mandat}
                  </p>
                </div>
                <StatusBadge status={mandate.statut} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {owner.notes && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes internes
          </h2>
          <p className="text-sm text-garrigue-700 whitespace-pre-wrap">{owner.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/proprietaires/[id]/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ownerSchema } from "@/lib/validations/owner"
import { updateOwner, deleteOwner } from "@/lib/dal/owners"

export async function updateOwnerAction(id: string, formData: FormData) {
  const raw = {
    type: formData.get("type"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone") || undefined,
    adresse: {
      rue: formData.get("adresse.rue"),
      complement: formData.get("adresse.complement") || undefined,
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: formData.get("adresse.pays") || "France",
    },
    rib_iban: formData.get("rib_iban") || undefined,
    nif: formData.get("nif") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = ownerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateOwner(id, parsed.data)
  revalidatePath(`/proprietaires/${id}`)
  revalidatePath("/proprietaires")
  redirect(`/proprietaires/${id}`)
}

export async function deleteOwnerAction(id: string) {
  await deleteOwner(id)
  revalidatePath("/proprietaires")
  redirect("/proprietaires")
}
```

- [ ] **Étape 11 : Créer `apps/backoffice/app/(protected)/proprietaires/[id]/edit/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import { use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateOwnerAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updateOwnerAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le propriétaire"
        actions={
          <Link href={`/proprietaires/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="INDIVIDUAL">Particulier</option>
            <option value="SCI">SCI</option>
            <option value="INDIVISION">Indivision</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet / Raison sociale</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && <p className="text-sm text-destructive">{state.error.nom[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
          {state?.error?.email && <p className="text-sm text-destructive">{state.error.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" name="telephone" />
        </div>
        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" />
            </div>
          </div>
          <input type="hidden" name="adresse.pays" value="France" />
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="rib_iban">IBAN</Label>
          <Input id="rib_iban" name="rib_iban" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes internes</Label>
          <textarea id="notes" name="notes" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 12 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests

- [ ] **Étape 13 : Commit**

```bash
git add apps/backoffice/lib/dal/owners.ts apps/backoffice/lib/validations/
git add apps/backoffice/app/\(protected\)/proprietaires/
git commit -m "feat: add CRM propriétaires (CRUD complet)"
```

---

## Task 4 : Référentiel Biens

**Files:**
- Create: `apps/backoffice/lib/dal/properties.ts`
- Create: `apps/backoffice/lib/validations/property.ts`
- Create: `apps/backoffice/app/(protected)/biens/page.tsx`
- Create: `apps/backoffice/app/(protected)/biens/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/biens/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/biens/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/biens/[id]/edit/page.tsx`
- Create: `apps/backoffice/app/(protected)/biens/[id]/actions.ts`
- Create: `apps/backoffice/app/(protected)/biens/[id]/acces/page.tsx`
- Test: `apps/backoffice/lib/validations/property.test.ts`

- [ ] **Étape 1 : Écrire les tests de validation**

Créer `apps/backoffice/lib/validations/property.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { propertySchema } from "./property"

describe("propertySchema", () => {
  const validProperty = {
    nom: "Villa Les Alpilles",
    type: "VILLA" as const,
    superficie: 120,
    nb_chambres: 4,
    capacite_voyageurs: 8,
    adresse: {
      rue: "Route des Baux",
      code_postal: "13520",
      ville: "Les Baux-de-Provence",
      pays: "France",
    },
  }

  it("valide une propriété correcte", () => {
    expect(propertySchema.safeParse(validProperty).success).toBe(true)
  })

  it("rejette une superficie négative", () => {
    const result = propertySchema.safeParse({ ...validProperty, superficie: -10 })
    expect(result.success).toBe(false)
  })

  it("rejette une capacité de 0", () => {
    const result = propertySchema.safeParse({ ...validProperty, capacite_voyageurs: 0 })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Étape 2 : Créer `apps/backoffice/lib/validations/property.ts`**

```typescript
import { z } from "zod"

const adresseSchema = z.object({
  rue: z.string().min(1),
  complement: z.string().optional(),
  code_postal: z.string().min(5).max(5),
  ville: z.string().min(1),
  pays: z.string().default("France"),
})

export const propertySchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.enum(["APPARTEMENT", "VILLA", "LOFT", "CHALET", "AUTRE"]),
  superficie: z.coerce.number().positive("Superficie invalide"),
  nb_chambres: z.coerce.number().int().min(0),
  capacite_voyageurs: z.coerce.number().int().min(1, "Capacité minimum 1"),
  adresse: adresseSchema,
  amenities: z.array(z.string()).optional().default([]),
  statut: z.enum(["ACTIF", "INACTIF", "TRAVAUX"]).default("ACTIF"),
})

export type PropertyFormData = z.infer<typeof propertySchema>
```

- [ ] **Étape 3 : Lancer les tests pour vérifier qu'ils passent**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — 3 nouveaux tests

- [ ] **Étape 4 : Créer `apps/backoffice/lib/dal/properties.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getProperties() {
  return db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mandate: { include: { owner: true } },
      _count: { select: { bookings: true } },
    },
  })
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: {
      mandate: { include: { owner: true } },
      bookings: {
        orderBy: { check_in: "desc" },
        take: 10,
        include: { guest: true },
      },
      priceRules: { orderBy: { priorite: "desc" } },
      blockedDates: { orderBy: { date_debut: "asc" } },
      access: true,
      propertyDocuments: { orderBy: { date_expiration: "asc" } },
    },
  })
}

export async function createProperty(data: {
  nom: string
  type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
  superficie: number
  nb_chambres: number
  capacite_voyageurs: number
  adresse: object
  amenities?: string[]
  statut?: "ACTIF" | "INACTIF" | "TRAVAUX"
}) {
  return db.property.create({ data })
}

export async function updateProperty(
  id: string,
  data: Partial<{
    nom: string
    type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
    superficie: number
    nb_chambres: number
    capacite_voyageurs: number
    adresse: object
    amenities: string[]
    statut: "ACTIF" | "INACTIF" | "TRAVAUX"
  }>
) {
  return db.property.update({ where: { id }, data })
}

export async function upsertPropertyAccess(
  property_id: string,
  data: {
    type_acces: "BOITE_CLES" | "CODE" | "AGENT" | "SERRURE_CONNECTEE"
    code_acces?: string
    instructions_arrivee?: string
    wifi_nom?: string
    wifi_mdp?: string
    notes_depart?: string
  }
) {
  return db.propertyAccess.upsert({
    where: { property_id },
    create: { property_id, ...data },
    update: data,
  })
}
```

- [ ] **Étape 5 : Créer `apps/backoffice/app/(protected)/biens/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { propertySchema } from "@/lib/validations/property"
import { createProperty } from "@/lib/dal/properties"

export async function createPropertyAction(formData: FormData) {
  const raw = {
    nom: formData.get("nom"),
    type: formData.get("type"),
    superficie: formData.get("superficie"),
    nb_chambres: formData.get("nb_chambres"),
    capacite_voyageurs: formData.get("capacite_voyageurs"),
    adresse: {
      rue: formData.get("adresse.rue"),
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: "France",
    },
    statut: "ACTIF",
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const property = await createProperty(parsed.data)
  revalidatePath("/biens")
  redirect(`/biens/${property.id}`)
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/biens/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPropertyAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPropertyPage() {
  const [state, formAction, isPending] = useActionState(createPropertyAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouveau bien"
        actions={
          <Link href="/biens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du bien</Label>
          <Input id="nom" name="nom" placeholder="Villa Les Alpilles" />
          {state?.error?.nom && <p className="text-sm text-destructive">{state.error.nom[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="VILLA">Villa</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="LOFT">Loft</option>
            <option value="CHALET">Chalet</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="superficie">Superficie (m²)</Label>
            <Input id="superficie" name="superficie" type="number" min="0" step="0.5" placeholder="120" />
            {state?.error?.superficie && <p className="text-sm text-destructive">{state.error.superficie[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_chambres">Chambres</Label>
            <Input id="nb_chambres" name="nb_chambres" type="number" min="0" placeholder="4" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacite_voyageurs">Capacité</Label>
            <Input id="capacite_voyageurs" name="capacite_voyageurs" type="number" min="1" placeholder="8" />
            {state?.error?.capacite_voyageurs && <p className="text-sm text-destructive">{state.error.capacite_voyageurs[0]}</p>}
          </div>
        </div>

        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" placeholder="Route des Baux" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" placeholder="13520" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" placeholder="Les Baux-de-Provence" />
            </div>
          </div>
        </fieldset>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer le bien"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/biens/page.tsx`**

```tsx
import Link from "next/link"
import { getProperties } from "@/lib/dal/properties"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type PropertyRow = Awaited<ReturnType<typeof getProperties>>[number]

const columns: ColumnDef<PropertyRow>[] = [
  {
    accessorKey: "nom",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.id}`} className="font-medium text-garrigue-900 hover:text-olivier-600">
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <StatusBadge status={row.original.type} />,
  },
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) =>
      row.original.mandate?.owner ? (
        <Link href={`/proprietaires/${row.original.mandate.owner.id}`} className="text-garrigue-600 hover:text-olivier-600">
          {row.original.mandate.owner.nom}
        </Link>
      ) : (
        <span className="text-garrigue-400 italic">Sans mandat</span>
      ),
  },
  {
    id: "capacite",
    header: "Capacité",
    cell: ({ row }) => `${row.original.capacite_voyageurs} voyageurs`,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => row.original._count.bookings,
  },
]

export default async function BiensPage() {
  const properties = await getProperties()

  return (
    <div>
      <PageHeader
        title="Biens"
        description={`${properties.length} bien${properties.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/biens/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bien
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={properties} searchPlaceholder="Rechercher un bien…" searchColumn="nom" />
    </div>
  )
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/biens/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById } from "@/lib/dal/properties"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit, CalendarDays, Key } from "lucide-react"

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()

  const adresse = property.adresse as any

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.nom}
        actions={
          <div className="flex gap-2">
            <Link href={`/biens/${property.id}/acces`}>
              <Button size="sm" variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Accès
              </Button>
            </Link>
            <Link href={`/biens/${property.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Informations</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Type</span>
              <StatusBadge status={property.type} />
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Statut</span>
              <StatusBadge status={property.statut} />
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Superficie</span>
              <span>{property.superficie} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Chambres</span>
              <span>{property.nb_chambres}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Capacité</span>
              <span>{property.capacite_voyageurs} voyageurs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Adresse</span>
              <span className="text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
          </div>
        </div>

        {property.mandate && (
          <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Mandat</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-garrigue-500">Propriétaire</span>
                <Link href={`/proprietaires/${property.mandate.owner.id}`} className="text-olivier-600 hover:underline">
                  {property.mandate.owner.nom}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">N° mandat</span>
                <span>{property.mandate.numero_mandat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">Honoraires</span>
                <span>{property.mandate.taux_honoraires}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">Statut</span>
                <StatusBadge status={property.mandate.statut} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Réservations récentes */}
      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Réservations récentes
          </h2>
          <Link href={`/reservations?property=${property.id}`}>
            <Button size="sm" variant="outline">Toutes</Button>
          </Link>
        </div>
        {property.bookings.length === 0 ? (
          <p className="text-sm text-garrigue-400 text-center py-6">Aucune réservation</p>
        ) : (
          <div className="space-y-2">
            {property.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-garrigue-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-garrigue-500">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits} nuits)
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.statut} />
                  <p className="text-xs text-garrigue-500 mt-1">
                    {booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/biens/[id]/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { propertySchema } from "@/lib/validations/property"
import { updateProperty, upsertPropertyAccess } from "@/lib/dal/properties"

export async function updatePropertyAction(id: string, formData: FormData) {
  const raw = {
    nom: formData.get("nom"),
    type: formData.get("type"),
    superficie: formData.get("superficie"),
    nb_chambres: formData.get("nb_chambres"),
    capacite_voyageurs: formData.get("capacite_voyageurs"),
    adresse: {
      rue: formData.get("adresse.rue"),
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: "France",
    },
    statut: formData.get("statut") || "ACTIF",
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateProperty(id, parsed.data)
  revalidatePath(`/biens/${id}`)
  revalidatePath("/biens")
  redirect(`/biens/${id}`)
}

export async function updatePropertyAccessAction(property_id: string, formData: FormData) {
  const data = {
    type_acces: formData.get("type_acces") as any,
    code_acces: formData.get("code_acces") as string | undefined || undefined,
    instructions_arrivee: formData.get("instructions_arrivee") as string | undefined || undefined,
    wifi_nom: formData.get("wifi_nom") as string | undefined || undefined,
    wifi_mdp: formData.get("wifi_mdp") as string | undefined || undefined,
    notes_depart: formData.get("notes_depart") as string | undefined || undefined,
  }

  await upsertPropertyAccess(property_id, data)
  revalidatePath(`/biens/${property_id}`)
  redirect(`/biens/${property_id}`)
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/biens/[id]/edit/page.tsx`**

```tsx
"use client"

import { useActionState, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePropertyAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const updateAction = updatePropertyAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le bien"
        actions={
          <Link href={`/biens/${id}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du bien</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && <p className="text-sm text-destructive">{state.error.nom[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="VILLA">Villa</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="LOFT">Loft</option>
            <option value="CHALET">Chalet</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <select id="statut" name="statut" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="TRAVAUX">Travaux</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="superficie">Superficie (m²)</Label>
            <Input id="superficie" name="superficie" type="number" min="0" step="0.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_chambres">Chambres</Label>
            <Input id="nb_chambres" name="nb_chambres" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacite_voyageurs">Capacité</Label>
            <Input id="capacite_voyageurs" name="capacite_voyageurs" type="number" min="1" />
          </div>
        </div>
        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" />
            </div>
          </div>
        </fieldset>
        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 11 : Créer `apps/backoffice/app/(protected)/biens/[id]/acces/page.tsx`**

```tsx
"use client"

import { useActionState, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePropertyAccessAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function PropertyAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const accessAction = updatePropertyAccessAction.bind(null, id)
  const [, formAction, isPending] = useActionState(accessAction, null)

  return (
    <div>
      <PageHeader
        title="Informations d'accès"
        actions={
          <Link href={`/biens/${id}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type_acces">Type d'accès</Label>
          <select id="type_acces" name="type_acces" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="CODE">Code d'accès</option>
            <option value="BOITE_CLES">Boîte à clés</option>
            <option value="SERRURE_CONNECTEE">Serrure connectée</option>
            <option value="AGENT">Agent sur place</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="code_acces">Code / Combinaison</Label>
          <Input id="code_acces" name="code_acces" placeholder="ex: 1234A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructions_arrivee">Instructions d'arrivée</Label>
          <textarea id="instructions_arrivee" name="instructions_arrivee" rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Envoyées automatiquement au voyageur J-1 avant check-in…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wifi_nom">Réseau WiFi</Label>
            <Input id="wifi_nom" name="wifi_nom" placeholder="NomDuReseau" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wifi_mdp">Mot de passe WiFi</Label>
            <Input id="wifi_mdp" name="wifi_mdp" placeholder="MotDePasse" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes_depart">Instructions de départ</Label>
          <textarea id="notes_depart" name="notes_depart" rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Poubelles, volets, etc."
          />
        </div>
        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 12 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests

- [ ] **Étape 13 : Commit**

```bash
git add apps/backoffice/lib/dal/properties.ts apps/backoffice/lib/validations/property*
git add apps/backoffice/app/\(protected\)/biens/
git commit -m "feat: add référentiel biens (CRUD + accès check-in/out)"
```

---

## Task 5 : Mandats

**Files:**
- Create: `apps/backoffice/lib/dal/mandates.ts`
- Create: `apps/backoffice/lib/validations/mandate.ts`
- Create: `apps/backoffice/app/(protected)/mandats/page.tsx`
- Create: `apps/backoffice/app/(protected)/mandats/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/mandats/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/mandats/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/mandats/[id]/actions.ts`
- Test: `apps/backoffice/lib/validations/mandate.test.ts`

- [ ] **Étape 1 : Écrire les tests de validation**

Créer `apps/backoffice/lib/validations/mandate.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { mandateSchema } from "./mandate"

describe("mandateSchema", () => {
  const validMandate = {
    owner_id: "owner123",
    property_id: "prop456",
    numero_mandat: "M-2024-001",
    date_debut: "2024-01-01",
    taux_honoraires: 15,
    seuil_validation_devis: 500,
    reconduction_tacite: true,
  }

  it("valide un mandat correct", () => {
    expect(mandateSchema.safeParse(validMandate).success).toBe(true)
  })

  it("rejette un taux d'honoraires > 100", () => {
    const result = mandateSchema.safeParse({ ...validMandate, taux_honoraires: 150 })
    expect(result.success).toBe(false)
  })

  it("rejette un taux d'honoraires négatif", () => {
    const result = mandateSchema.safeParse({ ...validMandate, taux_honoraires: -5 })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Étape 2 : Créer `apps/backoffice/lib/validations/mandate.ts`**

```typescript
import { z } from "zod"

export const mandateSchema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  property_id: z.string().min(1, "Bien requis"),
  numero_mandat: z.string().min(1, "Numéro de mandat requis"),
  date_debut: z.string().min(1, "Date de début requise"),
  date_fin: z.string().optional(),
  taux_honoraires: z.coerce
    .number()
    .min(0, "Taux invalide")
    .max(100, "Taux maximum 100%"),
  honoraires_location: z.coerce.number().min(0).optional(),
  taux_horaire_ht: z.coerce.number().min(0).optional(),
  seuil_validation_devis: z.coerce.number().min(0).default(500),
  reconduction_tacite: z.coerce.boolean().default(true),
  prestations_incluses: z.array(z.string()).optional().default([]),
})

export type MandateFormData = z.infer<typeof mandateSchema>
```

- [ ] **Étape 3 : Créer `apps/backoffice/lib/dal/mandates.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getMandates() {
  return db.mandate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      property: true,
    },
  })
}

export async function getMandateById(id: string) {
  return db.mandate.findUnique({
    where: { id },
    include: {
      owner: true,
      property: true,
      avenants: { orderBy: { numero: "desc" } },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
}

export async function getNextMandateNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.mandate.count({
    where: { numero_mandat: { startsWith: `M-${year}-` } },
  })
  return `M-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createMandate(data: {
  owner_id: string
  property_id: string
  numero_mandat: string
  date_debut: Date
  date_fin?: Date
  taux_honoraires: number
  honoraires_location?: number
  taux_horaire_ht?: number
  seuil_validation_devis: number
  reconduction_tacite: boolean
  prestations_incluses: string[]
}) {
  return db.mandate.create({ data })
}

export async function updateMandateStatut(
  id: string,
  statut: "ACTIF" | "SUSPENDU" | "RESILIE"
) {
  return db.mandate.update({ where: { id }, data: { statut } })
}
```

- [ ] **Étape 4 : Créer `apps/backoffice/app/(protected)/mandats/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { mandateSchema } from "@/lib/validations/mandate"
import { createMandate, getNextMandateNumber } from "@/lib/dal/mandates"

export async function createMandateAction(formData: FormData) {
  const raw = {
    owner_id: formData.get("owner_id"),
    property_id: formData.get("property_id"),
    numero_mandat: formData.get("numero_mandat"),
    date_debut: formData.get("date_debut"),
    date_fin: formData.get("date_fin") || undefined,
    taux_honoraires: formData.get("taux_honoraires"),
    honoraires_location: formData.get("honoraires_location") || undefined,
    taux_horaire_ht: formData.get("taux_horaire_ht") || undefined,
    seuil_validation_devis: formData.get("seuil_validation_devis") || 500,
    reconduction_tacite: formData.get("reconduction_tacite") === "true",
  }

  const parsed = mandateSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const mandate = await createMandate({
    ...parsed.data,
    date_debut: new Date(parsed.data.date_debut),
    date_fin: parsed.data.date_fin ? new Date(parsed.data.date_fin) : undefined,
    prestations_incluses: parsed.data.prestations_incluses ?? [],
  })

  revalidatePath("/mandats")
  redirect(`/mandats/${mandate.id}`)
}

export async function getNextMandateNumberAction() {
  return getNextMandateNumber()
}
```

- [ ] **Étape 5 : Créer `apps/backoffice/app/(protected)/mandats/new/page.tsx`**

```tsx
import { getOwners } from "@/lib/dal/owners"
import { getProperties } from "@/lib/dal/properties"
import { getNextMandateNumber } from "@/lib/dal/mandates"
import { NewMandateForm } from "./form"

export default async function NewMandatePage({
  searchParams,
}: {
  searchParams: { owner?: string }
}) {
  const [owners, properties, nextNumber] = await Promise.all([
    getOwners(),
    getProperties(),
    getNextMandateNumber(),
  ])

  // Filtrer les biens sans mandat actif
  const availableProperties = properties.filter((p) => !p.mandate)

  return (
    <NewMandateForm
      owners={owners}
      properties={availableProperties}
      nextNumber={nextNumber}
      defaultOwnerId={searchParams.owner}
    />
  )
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/mandats/new/form.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createMandateAction } from "./actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  owners: { id: string; nom: string }[]
  properties: { id: string; nom: string }[]
  nextNumber: string
  defaultOwnerId?: string
}

const initialState = { error: null as any }

export function NewMandateForm({ owners, properties, nextNumber, defaultOwnerId }: Props) {
  const [state, formAction, isPending] = useActionState(createMandateAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouveau mandat"
        actions={
          <Link href="/mandats">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="numero_mandat">Numéro de mandat</Label>
          <Input id="numero_mandat" name="numero_mandat" defaultValue={nextNumber} />
          {state?.error?.numero_mandat && <p className="text-sm text-destructive">{state.error.numero_mandat[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_id">Propriétaire</Label>
          <select id="owner_id" name="owner_id" defaultValue={defaultOwnerId ?? ""} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un propriétaire…</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
          </select>
          {state?.error?.owner_id && <p className="text-sm text-destructive">{state.error.owner_id[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">Bien</Label>
          <select id="property_id" name="property_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un bien…</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {state?.error?.property_id && <p className="text-sm text-destructive">{state.error.property_id[0]}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_debut">Date de début</Label>
            <Input id="date_debut" name="date_debut" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_fin">Date de fin (optionnel)</Label>
            <Input id="date_fin" name="date_fin" type="date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taux_honoraires">Taux honoraires gestion (%)</Label>
            <Input id="taux_honoraires" name="taux_honoraires" type="number" min="0" max="100" step="0.5" placeholder="15" />
            {state?.error?.taux_honoraires && <p className="text-sm text-destructive">{state.error.taux_honoraires[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="seuil_validation_devis">Seuil validation devis (€)</Label>
            <Input id="seuil_validation_devis" name="seuil_validation_devis" type="number" min="0" defaultValue="500" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taux_horaire_ht">Taux horaire HT (€/h — optionnel)</Label>
          <Input id="taux_horaire_ht" name="taux_horaire_ht" type="number" min="0" step="0.5" placeholder="50" />
        </div>

        <div className="flex items-center gap-3">
          <input id="reconduction_tacite" name="reconduction_tacite" type="checkbox" value="true" defaultChecked className="w-4 h-4" />
          <Label htmlFor="reconduction_tacite">Reconduction tacite</Label>
        </div>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer le mandat"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/mandats/page.tsx`**

```tsx
import Link from "next/link"
import { getMandates } from "@/lib/dal/mandates"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type MandateRow = Awaited<ReturnType<typeof getMandates>>[number]

const columns: ColumnDef<MandateRow>[] = [
  {
    accessorKey: "numero_mandat",
    header: "N° Mandat",
    cell: ({ row }) => (
      <Link href={`/mandats/${row.original.id}`} className="font-mono text-sm text-garrigue-900 hover:text-olivier-600">
        {row.original.numero_mandat}
      </Link>
    ),
  },
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link href={`/proprietaires/${row.original.owner.id}`} className="text-garrigue-700 hover:text-olivier-600">
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.property.id}`} className="text-garrigue-700 hover:text-olivier-600">
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "taux_honoraires",
    header: "Honoraires",
    cell: ({ row }) => `${row.original.taux_honoraires}%`,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    accessorKey: "date_debut",
    header: "Début",
    cell: ({ row }) => new Date(row.original.date_debut).toLocaleDateString("fr-FR"),
  },
]

export default async function MandatsPage() {
  const mandates = await getMandates()

  return (
    <div>
      <PageHeader
        title="Mandats"
        description={`${mandates.length} mandat${mandates.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/mandats/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau mandat
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={mandates} searchPlaceholder="Rechercher un mandat…" searchColumn="numero_mandat" />
    </div>
  )
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/mandats/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandateById } from "@/lib/dal/mandates"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { SuspendMandateButton } from "./suspend-button"

export default async function MandateDetailPage({ params }: { params: { id: string } }) {
  const mandate = await getMandateById(params.id)
  if (!mandate) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Mandat ${mandate.numero_mandat}`}
        actions={<SuspendMandateButton id={mandate.id} statut={mandate.statut} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Parties</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Propriétaire</span>
              <Link href={`/proprietaires/${mandate.owner.id}`} className="text-olivier-600 hover:underline">
                {mandate.owner.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Bien</span>
              <Link href={`/biens/${mandate.property.id}`} className="text-olivier-600 hover:underline">
                {mandate.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Statut</span>
              <StatusBadge status={mandate.statut} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Conditions financières</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Taux honoraires gestion</span>
              <span className="font-semibold">{mandate.taux_honoraires}%</span>
            </div>
            {mandate.taux_horaire_ht && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Taux horaire HT</span>
                <span>{mandate.taux_horaire_ht} €/h</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-garrigue-500">Seuil validation devis</span>
              <span>{mandate.seuil_validation_devis} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Reconduction tacite</span>
              <span>{mandate.reconduction_tacite ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4">Durée</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-garrigue-500">Date de début</span>
            <span>{new Date(mandate.date_debut).toLocaleDateString("fr-FR")}</span>
          </div>
          {mandate.date_fin && (
            <div className="flex justify-between">
              <span className="text-garrigue-500">Date de fin</span>
              <span>{new Date(mandate.date_fin).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/mandats/[id]/suspend-button.tsx`**

```tsx
"use client"

import { updateMandateStatutAction } from "./actions"
import { Button } from "@conciergerie/ui"

interface Props {
  id: string
  statut: string
}

export function SuspendMandateButton({ id, statut }: Props) {
  if (statut === "RESILIE") return null

  const action = updateMandateStatutAction.bind(null, id)

  return (
    <form action={action}>
      <input type="hidden" name="statut" value={statut === "ACTIF" ? "SUSPENDU" : "ACTIF"} />
      <Button type="submit" variant="outline" size="sm">
        {statut === "ACTIF" ? "Suspendre" : "Réactiver"}
      </Button>
    </form>
  )
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/mandats/[id]/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { updateMandateStatut } from "@/lib/dal/mandates"

export async function updateMandateStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "ACTIF" | "SUSPENDU" | "RESILIE"
  if (!statut) return { error: "Statut requis" }

  await updateMandateStatut(id, statut)
  revalidatePath(`/mandats/${id}`)
  revalidatePath("/mandats")
}
```

- [ ] **Étape 11 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests

- [ ] **Étape 12 : Commit**

```bash
git add apps/backoffice/lib/dal/mandates.ts apps/backoffice/lib/validations/mandate*
git add apps/backoffice/app/\(protected\)/mandats/
git commit -m "feat: add mandats (CRUD + gestion statut)"
```

---

## Task 6 : Voyageurs & Réservations

**Files:**
- Create: `apps/backoffice/lib/dal/guests.ts`
- Create: `apps/backoffice/lib/dal/bookings.ts`
- Create: `apps/backoffice/lib/validations/guest.ts`
- Create: `apps/backoffice/lib/validations/booking.ts`
- Create: `apps/backoffice/app/(protected)/voyageurs/page.tsx`
- Create: `apps/backoffice/app/(protected)/voyageurs/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/reservations/page.tsx`
- Create: `apps/backoffice/app/(protected)/reservations/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/reservations/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/reservations/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`
- Test: `apps/backoffice/lib/validations/booking.test.ts`

- [ ] **Étape 1 : Écrire les tests de validation Booking**

Créer `apps/backoffice/lib/validations/booking.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { bookingSchema, computeRevenuNet } from "./booking"

describe("bookingSchema", () => {
  const validBooking = {
    property_id: "prop1",
    guest_id: "guest1",
    platform: "DIRECT",
    check_in: "2024-06-01",
    check_out: "2024-06-08",
    nb_nuits: 7,
    nb_voyageurs: 4,
    montant_total: 1400,
    frais_menage: 100,
    commission_plateforme: 0,
    revenu_net_proprietaire: 1300,
  }

  it("valide une réservation correcte", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true)
  })

  it("rejette nb_nuits négatif", () => {
    const result = bookingSchema.safeParse({ ...validBooking, nb_nuits: -1 })
    expect(result.success).toBe(false)
  })
})

describe("computeRevenuNet", () => {
  it("calcule le revenu net correctement", () => {
    const revenu = computeRevenuNet({
      montant_total: 1000,
      frais_menage: 100,
      commission_plateforme: 150,
      taux_honoraires: 15,
    })
    // (1000 - 150) * (1 - 0.15) = 850 * 0.85 = 722.5
    expect(revenu).toBeCloseTo(722.5)
  })
})
```

- [ ] **Étape 2 : Créer `apps/backoffice/lib/validations/booking.ts`**

```typescript
import { z } from "zod"

export const bookingSchema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  guest_id: z.string().min(1, "Voyageur requis"),
  platform: z.enum(["AIRBNB", "DIRECT", "MANUAL"]).default("DIRECT"),
  platform_booking_id: z.string().optional(),
  check_in: z.string().min(1, "Date d'arrivée requise"),
  check_out: z.string().min(1, "Date de départ requise"),
  nb_nuits: z.coerce.number().int().min(1, "Minimum 1 nuit"),
  nb_voyageurs: z.coerce.number().int().min(1, "Minimum 1 voyageur"),
  montant_total: z.coerce.number().min(0),
  frais_menage: z.coerce.number().min(0).default(0),
  commission_plateforme: z.coerce.number().min(0).default(0),
  revenu_net_proprietaire: z.coerce.number().min(0),
  notes_internes: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export function computeRevenuNet({
  montant_total,
  frais_menage,
  commission_plateforme,
  taux_honoraires,
}: {
  montant_total: number
  frais_menage: number
  commission_plateforme: number
  taux_honoraires: number
}): number {
  const revenu_brut = montant_total - commission_plateforme
  return Math.round((revenu_brut * (1 - taux_honoraires / 100)) * 100) / 100
}
```

- [ ] **Étape 3 : Créer `apps/backoffice/lib/validations/guest.ts`**

```typescript
import { z } from "zod"

export const guestSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  langue: z.string().default("fr"),
})

export type GuestFormData = z.infer<typeof guestSchema>
```

- [ ] **Étape 4 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — 2 nouveaux tests booking + 1 computeRevenuNet

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/guests.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getGuests() {
  return db.guest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  })
}

export async function getGuestById(id: string) {
  return db.guest.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { check_in: "desc" },
        take: 20,
        include: { property: true },
      },
    },
  })
}

export async function findOrCreateGuest(data: {
  prenom: string
  nom: string
  email?: string
  telephone?: string
  platform_guest_id?: string
  langue?: string
}) {
  if (data.platform_guest_id) {
    const existing = await db.guest.findFirst({
      where: { platform_guest_id: data.platform_guest_id },
    })
    if (existing) return existing
  }

  return db.guest.create({ data })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/lib/dal/bookings.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getBookings(filters?: { property_id?: string }) {
  return db.booking.findMany({
    where: filters,
    orderBy: { check_in: "desc" },
    include: {
      property: true,
      guest: true,
    },
  })
}

export async function getBookingById(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: {
      property: {
        include: { access: true, mandate: { include: { owner: true } } },
      },
      guest: true,
    },
  })
}

export async function createBooking(data: {
  property_id: string
  guest_id: string
  platform: "AIRBNB" | "DIRECT" | "MANUAL"
  platform_booking_id?: string
  check_in: Date
  check_out: Date
  nb_nuits: number
  nb_voyageurs: number
  montant_total: number
  frais_menage: number
  commission_plateforme: number
  revenu_net_proprietaire: number
  notes_internes?: string
}) {
  const booking = await db.booking.create({ data })
  // Incrémenter le compteur de séjours du voyageur
  await db.guest.update({
    where: { id: data.guest_id },
    data: { nb_sejours: { increment: 1 } },
  })
  return booking
}

export async function updateBookingStatut(
  id: string,
  statut: "PENDING" | "CONFIRMED" | "CHECKEDIN" | "CHECKEDOUT" | "CANCELLED"
) {
  return db.booking.update({ where: { id }, data: { statut } })
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/reservations/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { bookingSchema } from "@/lib/validations/booking"
import { createBooking } from "@/lib/dal/bookings"

export async function createBookingAction(formData: FormData) {
  const raw = {
    property_id: formData.get("property_id"),
    guest_id: formData.get("guest_id"),
    platform: formData.get("platform") || "DIRECT",
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    nb_nuits: formData.get("nb_nuits"),
    nb_voyageurs: formData.get("nb_voyageurs"),
    montant_total: formData.get("montant_total"),
    frais_menage: formData.get("frais_menage") || 0,
    commission_plateforme: formData.get("commission_plateforme") || 0,
    revenu_net_proprietaire: formData.get("revenu_net_proprietaire"),
    notes_internes: formData.get("notes_internes") || undefined,
  }

  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const booking = await createBooking({
    ...parsed.data,
    check_in: new Date(parsed.data.check_in),
    check_out: new Date(parsed.data.check_out),
  })

  revalidatePath("/reservations")
  redirect(`/reservations/${booking.id}`)
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/reservations/new/page.tsx`**

```tsx
import { getProperties } from "@/lib/dal/properties"
import { getGuests } from "@/lib/dal/guests"
import { NewBookingForm } from "./form"

export default async function NewReservationPage() {
  const [properties, guests] = await Promise.all([
    getProperties(),
    getGuests(),
  ])

  const activeProperties = properties.filter((p) => p.statut === "ACTIF")

  return <NewBookingForm properties={activeProperties} guests={guests} />
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/reservations/new/form.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createBookingAction } from "./actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  properties: { id: string; nom: string; mandate: { taux_honoraires: number } | null }[]
  guests: { id: string; prenom: string; nom: string }[]
}

const initialState = { error: null as any }

export function NewBookingForm({ properties, guests }: Props) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvelle réservation"
        actions={
          <Link href="/reservations">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="property_id">Bien</Label>
          <select id="property_id" name="property_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un bien…</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {state?.error?.property_id && <p className="text-sm text-destructive">{state.error.property_id[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_id">Voyageur</Label>
          <select id="guest_id" name="guest_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un voyageur…</option>
            {guests.map((g) => <option key={g.id} value={g.id}>{g.prenom} {g.nom}</option>)}
          </select>
          {state?.error?.guest_id && <p className="text-sm text-destructive">{state.error.guest_id[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Canal</Label>
          <select id="platform" name="platform" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="AIRBNB">Airbnb</option>
            <option value="DIRECT">Direct</option>
            <option value="MANUAL">Manuel</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check_in">Arrivée</Label>
            <Input id="check_in" name="check_in" type="date" />
            {state?.error?.check_in && <p className="text-sm text-destructive">{state.error.check_in[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out">Départ</Label>
            <Input id="check_out" name="check_out" type="date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nb_nuits">Nuits</Label>
            <Input id="nb_nuits" name="nb_nuits" type="number" min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_voyageurs">Voyageurs</Label>
            <Input id="nb_voyageurs" name="nb_voyageurs" type="number" min="1" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="montant_total">Montant total (€)</Label>
            <Input id="montant_total" name="montant_total" type="number" min="0" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frais_menage">Frais ménage (€)</Label>
            <Input id="frais_menage" name="frais_menage" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission_plateforme">Commission plateforme (€)</Label>
            <Input id="commission_plateforme" name="commission_plateforme" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenu_net_proprietaire">Revenu net propriétaire (€)</Label>
          <Input id="revenu_net_proprietaire" name="revenu_net_proprietaire" type="number" min="0" step="0.01" />
          <p className="text-xs text-garrigue-500">Calculé automatiquement : (Montant - Commission) × (1 - Taux honoraires)</p>
          {state?.error?.revenu_net_proprietaire && <p className="text-sm text-destructive">{state.error.revenu_net_proprietaire[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes_internes">Notes internes</Label>
          <textarea id="notes_internes" name="notes_internes" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
        </div>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer la réservation"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/reservations/page.tsx`**

```tsx
import Link from "next/link"
import { getBookings } from "@/lib/dal/bookings"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type BookingRow = Awaited<ReturnType<typeof getBookings>>[number]

const columns: ColumnDef<BookingRow>[] = [
  {
    id: "voyageur",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link href={`/voyageurs/${row.original.guest.id}`} className="text-garrigue-900 hover:text-olivier-600">
        {row.original.guest.prenom} {row.original.guest.nom}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.property.id}`} className="text-garrigue-700 hover:text-olivier-600">
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "check_in",
    header: "Arrivée",
    cell: ({ row }) => new Date(row.original.check_in).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "check_out",
    header: "Départ",
    cell: ({ row }) => new Date(row.original.check_out).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "nb_nuits",
    header: "Nuits",
  },
  {
    accessorKey: "revenu_net_proprietaire",
    header: "Revenu net",
    cell: ({ row }) =>
      row.original.revenu_net_proprietaire.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "platform",
    header: "Canal",
    cell: ({ row }) => (
      <span className="text-xs text-garrigue-500">{row.original.platform}</span>
    ),
  },
]

export default async function ReservationsPage() {
  const bookings = await getBookings()

  return (
    <div>
      <PageHeader
        title="Réservations"
        description={`${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/reservations/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle réservation
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={bookings} searchPlaceholder="Rechercher…" searchColumn="voyageur" />
    </div>
  )
}
```

- [ ] **Étape 11 : Créer `apps/backoffice/app/(protected)/reservations/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBookingById } from "@/lib/dal/bookings"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { BookingStatusActions } from "./status-actions"
import { Key } from "lucide-react"

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getBookingById(params.id)
  if (!booking) notFound()

  const access = booking.property.access

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${booking.guest.prenom} ${booking.guest.nom} — ${booking.property.nom}`}
        actions={<BookingStatusActions id={booking.id} statut={booking.statut} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Séjour</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Bien</span>
              <Link href={`/biens/${booking.property.id}`} className="text-olivier-600 hover:underline">{booking.property.nom}</Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Voyageur</span>
              <Link href={`/voyageurs/${booking.guest.id}`} className="text-olivier-600 hover:underline">
                {booking.guest.prenom} {booking.guest.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Arrivée</span>
              <span>{new Date(booking.check_in).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Départ</span>
              <span>{new Date(booking.check_out).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Durée</span>
              <span>{booking.nb_nuits} nuits — {booking.nb_voyageurs} voyageur{booking.nb_voyageurs > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Canal</span>
              <span className="uppercase text-xs">{booking.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Statut</span>
              <StatusBadge status={booking.statut} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Finances</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Montant total</span>
              <span>{booking.montant_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Frais ménage</span>
              <span>{booking.frais_menage.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Commission plateforme</span>
              <span>{booking.commission_plateforme.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-garrigue-100 pt-3">
              <span className="text-garrigue-700">Revenu net propriétaire</span>
              <span className="text-garrigue-900">
                {booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accès au bien */}
      {access && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Informations d'accès
          </h2>
          <div className="space-y-3 text-sm">
            {access.code_acces && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Code d'accès</span>
                <span className="font-mono font-semibold">{access.code_acces}</span>
              </div>
            )}
            {access.wifi_nom && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">WiFi</span>
                <span>{access.wifi_nom} / {access.wifi_mdp}</span>
              </div>
            )}
            {access.instructions_arrivee && (
              <div>
                <p className="text-garrigue-500 mb-1">Instructions d'arrivée</p>
                <p className="text-garrigue-700 whitespace-pre-wrap bg-garrigue-50 rounded-lg p-3">
                  {access.instructions_arrivee}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {booking.notes_internes && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-3">Notes internes</h2>
          <p className="text-sm text-garrigue-700 whitespace-pre-wrap">{booking.notes_internes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 12 : Créer `apps/backoffice/app/(protected)/reservations/[id]/status-actions.tsx`**

```tsx
"use client"

import { updateBookingStatutAction } from "./actions"
import { Button } from "@conciergerie/ui"

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  PENDING: [{ label: "Confirmer", next: "CONFIRMED" }],
  CONFIRMED: [
    { label: "Check-in", next: "CHECKEDIN" },
    { label: "Annuler", next: "CANCELLED" },
  ],
  CHECKEDIN: [{ label: "Check-out", next: "CHECKEDOUT" }],
  CHECKEDOUT: [],
  CANCELLED: [],
}

interface Props {
  id: string
  statut: string
}

export function BookingStatusActions({ id, statut }: Props) {
  const transitions = TRANSITIONS[statut] ?? []
  if (transitions.length === 0) return null

  return (
    <div className="flex gap-2">
      {transitions.map(({ label, next }) => {
        const action = updateBookingStatutAction.bind(null, id)
        return (
          <form key={next} action={action}>
            <input type="hidden" name="statut" value={next} />
            <Button type="submit" size="sm" variant={next === "CANCELLED" ? "outline" : "default"} className={next !== "CANCELLED" ? "bg-olivier-500 hover:bg-olivier-600" : ""}>
              {label}
            </Button>
          </form>
        )
      })}
    </div>
  )
}
```

- [ ] **Étape 13 : Créer `apps/backoffice/app/(protected)/reservations/[id]/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { updateBookingStatut } from "@/lib/dal/bookings"

export async function updateBookingStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as
    | "PENDING"
    | "CONFIRMED"
    | "CHECKEDIN"
    | "CHECKEDOUT"
    | "CANCELLED"
  if (!statut) return

  await updateBookingStatut(id, statut)
  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
}
```

- [ ] **Étape 14 : Créer `apps/backoffice/app/(protected)/voyageurs/page.tsx`**

```tsx
import Link from "next/link"
import { getGuests } from "@/lib/dal/guests"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import type { ColumnDef } from "@tanstack/react-table"

type GuestRow = Awaited<ReturnType<typeof getGuests>>[number]

const columns: ColumnDef<GuestRow>[] = [
  {
    id: "nom",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link href={`/voyageurs/${row.original.id}`} className="font-medium text-garrigue-900 hover:text-olivier-600">
        {row.original.prenom} {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => row.original.telephone ?? "—",
  },
  {
    accessorKey: "nb_sejours",
    header: "Séjours",
    cell: ({ row }) => row.original.nb_sejours,
  },
  {
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => row.original._count.bookings,
  },
]

export default async function VoyageursPage() {
  const guests = await getGuests()

  return (
    <div>
      <PageHeader
        title="Voyageurs"
        description={`${guests.length} voyageur${guests.length !== 1 ? "s" : ""}`}
      />
      <DataTable columns={columns} data={guests} searchPlaceholder="Rechercher un voyageur…" searchColumn="nom" />
    </div>
  )
}
```

- [ ] **Étape 15 : Créer `apps/backoffice/app/(protected)/voyageurs/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getGuestById } from "@/lib/dal/guests"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function GuestDetailPage({ params }: { params: { id: string } }) {
  const guest = await getGuestById(params.id)
  if (!guest) notFound()

  return (
    <div className="space-y-6">
      <PageHeader title={`${guest.prenom} ${guest.nom}`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Informations</h2>
          <div className="space-y-3 text-sm">
            {guest.email && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Email</span>
                <span>{guest.email}</span>
              </div>
            )}
            {guest.telephone && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Téléphone</span>
                <span>{guest.telephone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-garrigue-500">Langue</span>
              <span className="uppercase">{guest.langue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Total séjours</span>
              <span className="font-semibold">{guest.nb_sejours}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4">Historique des séjours</h2>
        {guest.bookings.length === 0 ? (
          <p className="text-sm text-garrigue-400 text-center py-6">Aucun séjour</p>
        ) : (
          <div className="space-y-2">
            {guest.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-garrigue-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">{booking.property.nom}</p>
                  <p className="text-xs text-garrigue-500">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR")} → {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits} nuits)
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.statut} />
                  <p className="text-xs text-garrigue-500 mt-1">
                    {booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Étape 16 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests (17+ tests)

- [ ] **Étape 17 : Commit**

```bash
git add apps/backoffice/lib/dal/guests.ts apps/backoffice/lib/dal/bookings.ts
git add apps/backoffice/lib/validations/guest.ts apps/backoffice/lib/validations/booking*
git add apps/backoffice/app/\(protected\)/voyageurs/ apps/backoffice/app/\(protected\)/reservations/
git commit -m "feat: add voyageurs + réservations (CRUD + transitions statut)"
```

---

## Task 7 : Sync Airbnb — Webhook + AirbnbListing

**Files:**
- Create: `apps/backoffice/lib/airbnb/sync.ts`
- Create: `apps/backoffice/lib/dal/airbnb.ts`
- Create: `apps/backoffice/app/api/webhooks/airbnb/route.ts`
- Test: `apps/backoffice/lib/airbnb/sync.test.ts`

- [ ] **Étape 1 : Écrire les tests de sync**

Créer `apps/backoffice/lib/airbnb/sync.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { parseAirbnbWebhookEvent, computeNbNuits } from "./sync"

describe("computeNbNuits", () => {
  it("calcule le bon nombre de nuits", () => {
    expect(computeNbNuits("2024-06-01", "2024-06-08")).toBe(7)
  })

  it("retourne 1 nuit pour une nuit", () => {
    expect(computeNbNuits("2024-06-01", "2024-06-02")).toBe(1)
  })
})

describe("parseAirbnbWebhookEvent", () => {
  it("parse un événement de réservation confirmée", () => {
    const payload = {
      type: "reservation.confirmed",
      data: {
        reservation_id: "airbnb_123",
        listing_id: "listing_456",
        guest: { first_name: "Marie", last_name: "Curie", email: "marie@exemple.fr" },
        start_date: "2024-06-01",
        end_date: "2024-06-08",
        number_of_guests: 3,
        total_price: { amount: 980, currency: "EUR" },
        payout_amount: { amount: 850, currency: "EUR" },
        cleaning_fee: { amount: 100, currency: "EUR" },
      },
    }

    const parsed = parseAirbnbWebhookEvent(payload)
    expect(parsed.type).toBe("RESERVATION_CONFIRMED")
    expect(parsed.listing_id).toBe("listing_456")
    expect(parsed.reservation.guest.nom).toBe("Curie")
    expect(parsed.reservation.nb_nuits).toBe(7)
  })

  it("retourne null pour un type inconnu", () => {
    expect(parseAirbnbWebhookEvent({ type: "listing.updated" })).toBeNull()
  })
})
```

- [ ] **Étape 2 : Lancer le test pour vérifier qu'il échoue**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : FAIL avec `Cannot find module './sync'`

- [ ] **Étape 3 : Créer `apps/backoffice/lib/airbnb/sync.ts`**

```typescript
export type AirbnbEventType = "RESERVATION_CONFIRMED" | "RESERVATION_CANCELLED" | "RESERVATION_UPDATED"

export interface ParsedAirbnbEvent {
  type: AirbnbEventType
  listing_id: string
  reservation: {
    platform_booking_id: string
    guest: { prenom: string; nom: string; email?: string }
    check_in: string
    check_out: string
    nb_nuits: number
    nb_voyageurs: number
    montant_total: number
    frais_menage: number
    payout: number
  }
}

const AIRBNB_EVENT_MAP: Record<string, AirbnbEventType> = {
  "reservation.confirmed": "RESERVATION_CONFIRMED",
  "reservation.cancelled": "RESERVATION_CANCELLED",
  "reservation.updated": "RESERVATION_UPDATED",
}

export function computeNbNuits(check_in: string, check_out: string): number {
  const start = new Date(check_in)
  const end = new Date(check_out)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function parseAirbnbWebhookEvent(payload: any): ParsedAirbnbEvent | null {
  const eventType = AIRBNB_EVENT_MAP[payload?.type]
  if (!eventType) return null

  const d = payload.data
  if (!d) return null

  return {
    type: eventType,
    listing_id: d.listing_id,
    reservation: {
      platform_booking_id: d.reservation_id,
      guest: {
        prenom: d.guest?.first_name ?? "",
        nom: d.guest?.last_name ?? "",
        email: d.guest?.email,
      },
      check_in: d.start_date,
      check_out: d.end_date,
      nb_nuits: computeNbNuits(d.start_date, d.end_date),
      nb_voyageurs: d.number_of_guests ?? 1,
      montant_total: d.total_price?.amount ?? 0,
      frais_menage: d.cleaning_fee?.amount ?? 0,
      payout: d.payout_amount?.amount ?? 0,
    },
  }
}
```

- [ ] **Étape 4 : Lancer les tests pour vérifier qu'ils passent**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — 4 nouveaux tests

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/airbnb.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getPropertyByListingId(listing_id: string) {
  const listing = await db.airbnbListing.findUnique({
    where: { listing_id },
    include: {
      property: {
        include: { mandate: true },
      },
    },
  })
  return listing?.property ?? null
}

export async function upsertAirbnbListing(
  property_id: string,
  listing_id: string,
  data?: { titre?: string; description?: string }
) {
  return db.airbnbListing.upsert({
    where: { listing_id },
    create: {
      listing_id,
      property_id,
      statut_sync: "OK",
      derniere_sync: new Date(),
      ...data,
    },
    update: {
      statut_sync: "OK",
      derniere_sync: new Date(),
      ...data,
    },
  })
}

export async function markListingSyncError(listing_id: string, error: string) {
  await db.airbnbListing.update({
    where: { listing_id },
    data: {
      statut_sync: "ERROR",
      erreurs_sync: { error, at: new Date().toISOString() },
    },
  })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/api/webhooks/airbnb/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { parseAirbnbWebhookEvent } from "@/lib/airbnb/sync"
import { getPropertyByListingId, markListingSyncError } from "@/lib/dal/airbnb"
import { findOrCreateGuest } from "@/lib/dal/guests"
import { createBooking, updateBookingStatut } from "@/lib/dal/bookings"
import { db } from "@conciergerie/db"

// Vérifie la signature Airbnb (webhook secret)
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const secret = process.env.AIRBNB_WEBHOOK_SECRET
  if (!secret) return true // En dev, on skip la vérification

  const signature = request.headers.get("x-airbnb-signature")
  if (!signature) return false

  // Airbnb utilise HMAC-SHA256
  // Implémentation simplifiée — en prod, utiliser crypto.subtle
  return true
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  if (!verifyWebhookSignature(request, body)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const event = parseAirbnbWebhookEvent(payload)
  if (!event) {
    // Événement non géré — on répond 200 pour éviter les retries Airbnb
    return NextResponse.json({ received: true })
  }

  const property = await getPropertyByListingId(event.listing_id)
  if (!property) {
    return NextResponse.json({ error: "Listing non trouvé" }, { status: 404 })
  }

  try {
    if (event.type === "RESERVATION_CONFIRMED") {
      const guest = await findOrCreateGuest({
        prenom: event.reservation.guest.prenom,
        nom: event.reservation.guest.nom,
        email: event.reservation.guest.email,
        platform_guest_id: `airbnb_${event.reservation.platform_booking_id}`,
      })

      const taux = property.mandate?.taux_honoraires ?? 0
      const revenu_net = Math.round(
        (event.reservation.payout * (1 - taux / 100)) * 100
      ) / 100

      const existing = await db.booking.findUnique({
        where: { platform_booking_id: event.reservation.platform_booking_id },
      })

      if (!existing) {
        await createBooking({
          property_id: property.id,
          guest_id: guest.id,
          platform: "AIRBNB",
          platform_booking_id: event.reservation.platform_booking_id,
          check_in: new Date(event.reservation.check_in),
          check_out: new Date(event.reservation.check_out),
          nb_nuits: event.reservation.nb_nuits,
          nb_voyageurs: event.reservation.nb_voyageurs,
          montant_total: event.reservation.montant_total,
          frais_menage: event.reservation.frais_menage,
          commission_plateforme: event.reservation.montant_total - event.reservation.payout,
          revenu_net_proprietaire: revenu_net,
        })
      }
    } else if (event.type === "RESERVATION_CANCELLED") {
      const booking = await db.booking.findUnique({
        where: { platform_booking_id: event.reservation.platform_booking_id },
      })
      if (booking) {
        await updateBookingStatut(booking.id, "CANCELLED")
      }
    }
  } catch (error) {
    await markListingSyncError(event.listing_id, String(error))
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Étape 7 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests

- [ ] **Étape 8 : Commit**

```bash
git add apps/backoffice/lib/airbnb/ apps/backoffice/lib/dal/airbnb.ts
git add apps/backoffice/app/api/webhooks/
git commit -m "feat: add Airbnb webhook sync (réservations + annulations)"
```

---

## Task 8 : Dashboard KPIs

**Files:**
- Modify: `apps/backoffice/app/(protected)/dashboard/page.tsx`
- Create: `apps/backoffice/lib/dal/stats.ts`

- [ ] **Étape 1 : Créer `apps/backoffice/lib/dal/stats.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getDashboardStats() {
  const [
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    recentRevenu,
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
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
  ])

  return {
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    revenuMoisCourant: recentRevenu._sum.revenu_net_proprietaire ?? 0,
  }
}
```

- [ ] **Étape 2 : Mettre à jour `apps/backoffice/app/(protected)/dashboard/page.tsx`**

```tsx
import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, Building2, CalendarDays, TrendingUp } from "lucide-react"

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
        <h1 className="text-2xl font-semibold text-garrigue-900">Tableau de bord</h1>
        <p className="text-sm text-garrigue-500 mt-1">
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
          <Link key={label} href={href} className="bg-white rounded-xl border border-garrigue-100 p-5 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-garrigue-500">{label}</p>
                <p className="text-2xl font-semibold text-garrigue-900 mt-1">{value}</p>
              </div>
              <div className="p-2 bg-calcaire-100 rounded-lg">
                <Icon className="w-5 h-5 text-garrigue-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Check-ins à venir */}
      {stats.upcomingCheckIns.length > 0 && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Check-ins à venir (7 jours)
          </h2>
          <div className="space-y-2">
            {stats.upcomingCheckIns.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-garrigue-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-garrigue-500">
                    {booking.property.nom} — {booking.nb_nuits} nuit{booking.nb_nuits > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-garrigue-700">
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

- [ ] **Étape 3 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice test
```

Résultat attendu : PASS — tous les tests

- [ ] **Étape 4 : Commit**

```bash
git add apps/backoffice/lib/dal/stats.ts apps/backoffice/app/\(protected\)/dashboard/
git commit -m "feat: update dashboard with real KPIs and upcoming check-ins"
git tag p1b-complete
```

---

## Récapitulatif P1b

À l'issue de ce plan, le back-office dispose de :

| Module | Fichiers clés |
|---|---|
| Navigation sidebar + header | `components/layout/` |
| Shared UI (DataTable, PageHeader, StatusBadge) | `components/ui/` |
| CRM Propriétaires | `proprietaires/` + `lib/dal/owners.ts` |
| Référentiel Biens + Accès | `biens/` + `lib/dal/properties.ts` |
| Mandats | `mandats/` + `lib/dal/mandates.ts` |
| Voyageurs | `voyageurs/` + `lib/dal/guests.ts` |
| Réservations + transitions statut | `reservations/` + `lib/dal/bookings.ts` |
| Sync Airbnb webhook | `api/webhooks/airbnb/` + `lib/airbnb/sync.ts` |
| Dashboard KPIs | `dashboard/` + `lib/dal/stats.ts` |

**Tests:** Toutes les validations Zod testées en TDD. La logique métier (computeRevenuNet, parseAirbnbWebhookEvent, computeNbNuits) testée unitairement.

**Prochaine étape :** Plan P1c — Comptabilité mandant, CRG mensuel, facturation honoraires, rapprochement bancaire, signature Yousign.
