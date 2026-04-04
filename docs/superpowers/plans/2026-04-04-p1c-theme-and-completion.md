# Back-office P1c — Theme classique shadcn + Modules restants

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer 100% du back-office vers un thème ERP classique 100% shadcn/ui (supprimer la palette provençale), puis implémenter les modules manquants : Comptabilité mandant, Facturation honoraires, Prestataires, Travaux, Administration.

**Architecture:** Remplacement des tokens de design (CSS variables + tailwind configs) + remplacement en masse des classes Provence par des classes sémantiques shadcn. Nouveaux modules suivent le pattern DAL/validation/pages existant. Server Actions pour les mutations, Server Components pour les lectures.

**Tech Stack:** Next.js 14 App Router, shadcn/ui, Tailwind CSS, Prisma, Zod, Vitest, TanStack Table v8

---

## Correspondance des classes Provence → shadcn

| Classe Provence | Classe shadcn/Tailwind |
|---|---|
| `text-garrigue-900` | `text-foreground` |
| `text-garrigue-800` | `text-foreground` |
| `text-garrigue-700` | `text-foreground` |
| `text-garrigue-600` | `text-muted-foreground` |
| `text-garrigue-500` | `text-muted-foreground` |
| `text-garrigue-400` | `text-muted-foreground` |
| `text-garrigue-300` | `text-slate-300` (sidebar seulement) |
| `bg-garrigue-900` | `bg-slate-900` (sidebar) |
| `bg-garrigue-800` | `bg-slate-800` (sidebar hover) |
| `bg-garrigue-700` | `bg-slate-700` (sidebar actif) |
| `bg-garrigue-50` | `bg-muted` |
| `bg-garrigue-50/50` | `bg-muted/50` |
| `border-garrigue-100` | `border` (i.e. supprimer le suffixe) |
| `border-garrigue-700` | `border-slate-700` (sidebar) |
| `border-garrigue-50` | `border-border` |
| `hover:bg-garrigue-50` | `hover:bg-muted/50` |
| `hover:bg-garrigue-800` | `hover:bg-slate-800` |
| `hover:text-garrigue-900` | `hover:text-foreground` |
| `hover:text-garrigue-700` | `hover:text-foreground` |
| `divide-garrigue-50` | `divide-border` |
| `text-calcaire-100` | `text-white` |
| `bg-calcaire-100` | `bg-muted` |
| `bg-olivier-500 hover:bg-olivier-600` | *(supprimer ces classes — Button variant="default" = bleu)* |
| `text-olivier-600 hover:underline` | `text-primary hover:underline` |
| `hover:text-olivier-600` | `hover:text-primary` |
| `text-olivier-600` | `text-primary` |
| `bg-lavande-100 text-lavande-800` | `bg-violet-100 text-violet-800` |
| `bg-argile-100 text-argile-800` | `bg-amber-100 text-amber-800` |
| `shadow-card` | `shadow-sm` |
| `shadow-soft` | `shadow-sm` |
| `shadow-hover` | `shadow-md` |
| `rounded-xl` | `rounded-lg` |
| `font-playfair` / `font-serif` | *(supprimer)* |

---

## Structure des fichiers

**Modifiés (theme) :**
- `apps/backoffice/app/globals.css`
- `apps/backoffice/tailwind.config.ts`
- `packages/ui/tailwind.config.ts`
- `apps/backoffice/components/layout/sidebar.tsx`
- `apps/backoffice/components/layout/header.tsx`
- `apps/backoffice/app/(protected)/layout.tsx`
- `apps/backoffice/app/(auth)/login/page.tsx`
- `apps/backoffice/app/(auth)/login/mfa/page.tsx`
- `apps/backoffice/components/ui/data-table.tsx`
- `apps/backoffice/components/ui/page-header.tsx`
- `apps/backoffice/components/ui/status-badge.tsx`
- Tous les 19 fichiers de pages `app/(protected)/**/*.tsx`

**Créés (modules) :**
- `apps/backoffice/lib/dal/comptes.ts`
- `apps/backoffice/lib/dal/facturation.ts`
- `apps/backoffice/lib/dal/prestataires.ts`
- `apps/backoffice/lib/dal/travaux.ts`
- `apps/backoffice/lib/dal/admin.ts`
- `apps/backoffice/lib/validations/prestataire.ts` + `.test.ts`
- `apps/backoffice/lib/validations/workorder.ts` + `.test.ts`
- `apps/backoffice/app/(protected)/comptabilite/page.tsx`
- `apps/backoffice/app/(protected)/comptabilite/[id]/page.tsx`
- `apps/backoffice/app/(protected)/facturation/page.tsx`
- `apps/backoffice/app/(protected)/facturation/new/page.tsx`
- `apps/backoffice/app/(protected)/facturation/new/actions.ts`
- `apps/backoffice/app/(protected)/facturation/[id]/page.tsx`
- `apps/backoffice/app/(protected)/prestataires/page.tsx`
- `apps/backoffice/app/(protected)/prestataires/new/page.tsx`
- `apps/backoffice/app/(protected)/prestataires/new/actions.ts`
- `apps/backoffice/app/(protected)/prestataires/[id]/page.tsx`
- `apps/backoffice/app/(protected)/prestataires/[id]/edit/page.tsx`
- `apps/backoffice/app/(protected)/prestataires/[id]/actions.ts`
- `apps/backoffice/app/(protected)/travaux/page.tsx`
- `apps/backoffice/app/(protected)/travaux/new/page.tsx`
- `apps/backoffice/app/(protected)/travaux/new/actions.ts`
- `apps/backoffice/app/(protected)/travaux/[id]/page.tsx`
- `apps/backoffice/app/(protected)/travaux/[id]/actions.ts`
- `apps/backoffice/app/(protected)/admin/page.tsx`
- `apps/backoffice/app/(protected)/admin/users/new/page.tsx`
- `apps/backoffice/app/(protected)/admin/users/new/actions.ts`
- `apps/backoffice/app/(protected)/admin/users/[id]/edit/page.tsx`
- `apps/backoffice/app/(protected)/admin/users/[id]/actions.ts`

---

## Task 1 : Design Tokens — globals.css + tailwind.config.ts

**Files:**
- Modify: `apps/backoffice/app/globals.css`
- Modify: `apps/backoffice/tailwind.config.ts`
- Modify: `packages/ui/tailwind.config.ts`

- [ ] **Étape 1 : Réécrire `apps/backoffice/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Étape 2 : Réécrire `apps/backoffice/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgb(0 0 0 / 0.06)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [animate],
}

export default config
```

- [ ] **Étape 3 : Réécrire `packages/ui/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgb(0 0 0 / 0.06)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [animate],
}

export default config
```

- [ ] **Étape 4 : Lancer les tests pour vérifier que rien n'est cassé**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — tous les tests passent

- [ ] **Étape 5 : Commit**

```bash
git add apps/backoffice/app/globals.css apps/backoffice/tailwind.config.ts packages/ui/tailwind.config.ts
git commit -m "feat: switch to classic shadcn ERP design tokens (remove Provence palette)"
```

---

## Task 2 : Layout + Pages auth — réécriture complète

**Files:**
- Modify: `apps/backoffice/components/layout/sidebar.tsx`
- Modify: `apps/backoffice/components/layout/header.tsx`
- Modify: `apps/backoffice/app/(protected)/layout.tsx`
- Modify: `apps/backoffice/app/(auth)/login/page.tsx`
- Modify: `apps/backoffice/app/(auth)/login/mfa/page.tsx`

- [ ] **Étape 1 : Réécrire `apps/backoffice/components/layout/sidebar.tsx`**

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
  Wallet,
  Receipt,
  Wrench,
  HardHat,
} from "lucide-react"
import { cn } from "@conciergerie/ui"

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    ],
  },
  {
    label: "Référentiels",
    items: [
      { href: "/proprietaires", label: "Propriétaires", icon: Users },
      { href: "/biens", label: "Biens", icon: Building2 },
      { href: "/mandats", label: "Mandats", icon: FileText },
    ],
  },
  {
    label: "Activité",
    items: [
      { href: "/reservations", label: "Réservations", icon: CalendarDays },
      { href: "/voyageurs", label: "Voyageurs", icon: UserCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/comptabilite", label: "Comptabilité", icon: Wallet },
      { href: "/facturation", label: "Facturation", icon: Receipt },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/prestataires", label: "Prestataires", icon: HardHat },
      { href: "/travaux", label: "Travaux", icon: Wrench },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            Entre Rhône et Alpilles
          </p>
          <p className="text-slate-400 text-xs">Conciergerie — Back-office</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? "main"}>
            {section.label && (
              <p className="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname.startsWith("/admin")
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Administration</span>
        </Link>
      </div>
    </aside>
  )
}
```

- [ ] **Étape 2 : Réécrire `apps/backoffice/components/layout/header.tsx`**

```tsx
import { auth, signOut } from "@/auth"
import { LogOut, Bell } from "lucide-react"
import { Button } from "@conciergerie/ui"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-background border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground">{session?.user?.role}</p>
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
              className="text-muted-foreground hover:text-foreground"
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

- [ ] **Étape 3 : Lire `apps/backoffice/app/(protected)/layout.tsx` puis le réécrire**

Lire le fichier pour voir son contenu exact. Remplacer toutes les classes Provence selon la table de correspondance. Le fichier contient typiquement :

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <Header />
      <main className="pl-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

Remplacer par ce contenu exact (lire d'abord pour vérifier qu'il n'y a rien de différent).

- [ ] **Étape 4 : Réécrire `apps/backoffice/app/(auth)/login/page.tsx`**

```tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button, Input, Label } from "@conciergerie/ui"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email ou mot de passe incorrect")
        return
      }

      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-8 p-8 bg-card border rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Entre Rhône et Alpilles
          </h1>
          <p className="text-sm text-muted-foreground">
            Connexion à l&apos;espace de gestion
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@conciergerie.fr"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Étape 5 : Lire `apps/backoffice/app/(auth)/login/mfa/page.tsx` et remplacer les classes Provence**

Lire le fichier, puis remplacer selon la table : `bg-calcaire-100` → `bg-muted/30`, `text-garrigue-900` → `text-foreground`, `bg-olivier-500 hover:bg-olivier-600` → *(supprimer ces classes)*, `border-garrigue-100` → `border`, shadow → `shadow-sm`. Le reste de la logique est inchangé.

- [ ] **Étape 6 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS

- [ ] **Étape 7 : Commit**

```bash
git add apps/backoffice/components/layout/ apps/backoffice/app/\(protected\)/layout.tsx apps/backoffice/app/\(auth\)/
git commit -m "feat: migrate layout and auth pages to classic shadcn theme"
```

---

## Task 3 : Shared UI Components — réécriture complète

**Files:**
- Modify: `apps/backoffice/components/ui/data-table.tsx`
- Modify: `apps/backoffice/components/ui/page-header.tsx`
- Modify: `apps/backoffice/components/ui/status-badge.tsx`
- Test: `apps/backoffice/components/ui/status-badge.test.tsx`

- [ ] **Étape 1 : Réécrire `apps/backoffice/components/ui/data-table.tsx`**

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
import { Input, Button, cn } from "@conciergerie/ui"

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

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-foreground whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground text-muted-foreground"
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
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Aucun résultat
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-background hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
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

- [ ] **Étape 2 : Réécrire `apps/backoffice/components/ui/page-header.tsx`**

```tsx
import type { ReactNode } from "react"
import { cn } from "@conciergerie/ui"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

- [ ] **Étape 3 : Réécrire `apps/backoffice/components/ui/status-badge.tsx`**

```tsx
import { cn } from "@conciergerie/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIF: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIF: { label: "Inactif", className: "bg-slate-100 text-slate-600" },
  TRAVAUX: { label: "Travaux", className: "bg-orange-100 text-orange-800" },
  SUSPENDU: { label: "Suspendu", className: "bg-yellow-100 text-yellow-800" },
  RESILIE: { label: "Résilié", className: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "Confirmée", className: "bg-green-100 text-green-800" },
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CHECKEDIN: { label: "Check-in", className: "bg-blue-100 text-blue-800" },
  CHECKEDOUT: { label: "Check-out", className: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-800" },
  INDIVIDUAL: { label: "Particulier", className: "bg-slate-100 text-slate-700" },
  SCI: { label: "SCI", className: "bg-violet-100 text-violet-800" },
  INDIVISION: { label: "Indivision", className: "bg-amber-100 text-amber-800" },
  BROUILLON: { label: "Brouillon", className: "bg-slate-100 text-slate-600" },
  EMISE: { label: "Émise", className: "bg-blue-100 text-blue-800" },
  PAYEE: { label: "Payée", className: "bg-green-100 text-green-800" },
  AVOIR: { label: "Avoir", className: "bg-orange-100 text-orange-800" },
  OUVERT: { label: "Ouvert", className: "bg-blue-100 text-blue-800" },
  EN_COURS: { label: "En cours", className: "bg-yellow-100 text-yellow-800" },
  EN_ATTENTE_DEVIS: { label: "Attente devis", className: "bg-orange-100 text-orange-800" },
  EN_ATTENTE_VALIDATION: { label: "Attente valid.", className: "bg-orange-100 text-orange-800" },
  VALIDE: { label: "Validé", className: "bg-green-100 text-green-800" },
  TERMINE: { label: "Terminé", className: "bg-slate-100 text-slate-600" },
  ANNULE: { label: "Annulé", className: "bg-red-100 text-red-800" },
  NORMALE: { label: "Normale", className: "bg-slate-100 text-slate-600" },
  URGENTE: { label: "Urgente", className: "bg-orange-100 text-orange-800" },
  CRITIQUE: { label: "Critique", className: "bg-red-100 text-red-800" },
  APPARTEMENT: { label: "Appartement", className: "bg-blue-100 text-blue-800" },
  VILLA: { label: "Villa", className: "bg-violet-100 text-violet-800" },
  LOFT: { label: "Loft", className: "bg-cyan-100 text-cyan-800" },
  CHALET: { label: "Chalet", className: "bg-amber-100 text-amber-800" },
  AUTRE: { label: "Autre", className: "bg-slate-100 text-slate-600" },
}

export function getStatusConfig(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
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

- [ ] **Étape 4 : Lancer les tests (StatusBadge est testé)**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS

- [ ] **Étape 5 : Commit**

```bash
git add apps/backoffice/components/ui/
git commit -m "feat: migrate shared UI components to classic shadcn theme"
```

---

## Task 4 : Nettoyage des pages — remplacement en masse des classes Provence

**Files:** Tous les 19 fichiers `.tsx` dans `apps/backoffice/app/(protected)/` (hors `layout.tsx` déjà traité)

- [ ] **Étape 1 : Lancer le script de remplacement en masse**

Depuis le répertoire `apps/backoffice/`, créer et lancer le script `scripts/migrate-theme.mjs` :

```javascript
// apps/backoffice/scripts/migrate-theme.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const REPLACEMENTS = [
  // Text colors
  [/text-garrigue-900/g, "text-foreground"],
  [/text-garrigue-800/g, "text-foreground"],
  [/text-garrigue-700/g, "text-foreground"],
  [/text-garrigue-600/g, "text-muted-foreground"],
  [/text-garrigue-500/g, "text-muted-foreground"],
  [/text-garrigue-400/g, "text-muted-foreground"],
  [/text-garrigue-300/g, "text-slate-300"],
  // Hover text
  [/hover:text-garrigue-900/g, "hover:text-foreground"],
  [/hover:text-garrigue-700/g, "hover:text-foreground"],
  [/hover:text-olivier-600/g, "hover:text-primary"],
  [/text-olivier-600 hover:underline/g, "text-primary hover:underline"],
  [/text-olivier-600/g, "text-primary"],
  // Backgrounds
  [/bg-garrigue-50\/50/g, "bg-muted/50"],
  [/bg-garrigue-50/g, "bg-muted"],
  [/hover:bg-garrigue-50\/50/g, "hover:bg-muted/50"],
  [/hover:bg-garrigue-50/g, "hover:bg-muted/50"],
  [/bg-calcaire-100/g, "bg-muted/30"],
  [/text-calcaire-100/g, "text-white"],
  // Borders
  [/border border-garrigue-100/g, "border"],
  [/border-garrigue-100/g, "border-border"],
  [/border-garrigue-50/g, "border-border"],
  [/divide-garrigue-50/g, "divide-border"],
  // Primary buttons (remove explicit colors, use variant="default")
  [/ bg-olivier-500 hover:bg-olivier-600/g, ""],
  [/bg-olivier-500 hover:bg-olivier-600/g, ""],
  // Shadows
  [/shadow-card/g, "shadow-sm"],
  [/shadow-soft/g, "shadow-sm"],
  [/shadow-hover/g, "shadow-md"],
  // Border radius
  [/rounded-xl/g, "rounded-lg"],
  // Font
  [/font-playfair/g, ""],
  [/font-serif/g, ""],
]

function processFile(filePath) {
  let content = readFileSync(filePath, "utf-8")
  let changed = false
  for (const [from, to] of REPLACEMENTS) {
    const newContent = content.replace(from, to)
    if (newContent !== content) changed = true
    content = newContent
  }
  if (changed) {
    writeFileSync(filePath, content, "utf-8")
    console.log(`  Updated: ${filePath}`)
  }
}

function walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walkDir(full)
    } else if ([".tsx", ".ts"].includes(extname(full))) {
      processFile(full)
    }
  }
}

console.log("Migrating Provence classes to shadcn...")
walkDir("app/(protected)")
console.log("Done.")
```

Lancer :

```bash
cd apps/backoffice
node scripts/migrate-theme.mjs
```

- [ ] **Étape 2 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — tous les 31 tests passent

- [ ] **Étape 3 : Commit**

```bash
git add apps/backoffice/app/\(protected\)/ apps/backoffice/scripts/
git commit -m "feat: bulk-migrate all page components to classic shadcn theme"
```

---

## Task 5 : Extension sidebar + module Comptabilité mandant

**Files:**
- Create: `apps/backoffice/lib/dal/comptes.ts`
- Create: `apps/backoffice/app/(protected)/comptabilite/page.tsx`
- Create: `apps/backoffice/app/(protected)/comptabilite/[id]/page.tsx`

- [ ] **Étape 1 : Créer `apps/backoffice/lib/dal/comptes.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getMandantAccounts() {
  return db.mandantAccount.findMany({
    include: {
      owner: { select: { id: true, nom: true, email: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getMandantAccountById(id: string) {
  return db.mandantAccount.findUnique({
    where: { id },
    include: {
      owner: true,
      transactions: {
        orderBy: { date: "desc" },
        take: 50,
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  })
}

export async function getMandantAccountByOwnerId(owner_id: string) {
  return db.mandantAccount.findUnique({
    where: { owner_id },
    include: { owner: true },
  })
}

export async function createTransaction(data: {
  mandant_account_id: string
  booking_id?: string
  type: "REVENU_SEJOUR" | "HONORAIRES" | "TRAVAUX" | "REVERSEMENT" | "CHARGE" | "AUTRE"
  montant: number
  date: Date
  libelle: string
}) {
  const tx = await db.transaction.create({ data })
  // Mettre à jour le solde courant
  await db.mandantAccount.update({
    where: { id: data.mandant_account_id },
    data: {
      solde_courant: {
        increment: data.montant,
      },
    },
  })
  return tx
}
```

- [ ] **Étape 2 : Créer `apps/backoffice/app/(protected)/comptabilite/page.tsx`**

```tsx
import Link from "next/link"
import { getMandantAccounts } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

type AccountRow = Awaited<ReturnType<typeof getMandantAccounts>>[number]

const columns: ColumnDef<AccountRow>[] = [
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.owner.email}</span>
    ),
  },
  {
    accessorKey: "solde_courant",
    header: "Solde courant",
    cell: ({ row }) => (
      <span
        className={
          row.original.solde_courant >= 0
            ? "font-semibold text-green-700"
            : "font-semibold text-red-600"
        }
      >
        {row.original.solde_courant.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    ),
  },
  {
    accessorKey: "solde_sequestre",
    header: "Séquestre",
    cell: ({ row }) =>
      row.original.solde_sequestre.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
  },
  {
    id: "nb_transactions",
    header: "Transactions",
    cell: ({ row }) => row.original._count.transactions,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="text-sm text-primary hover:underline"
      >
        Voir
      </Link>
    ),
  },
]

export default async function ComptabilitePage() {
  const accounts = await getMandantAccounts()

  return (
    <div>
      <PageHeader
        title="Comptabilité mandant"
        description={`${accounts.length} compte${accounts.length !== 1 ? "s" : ""} mandant`}
      />
      <DataTable
        columns={columns}
        data={accounts}
        searchPlaceholder="Rechercher un propriétaire…"
        searchColumn="proprietaire"
      />
    </div>
  )
}
```

- [ ] **Étape 3 : Créer `apps/backoffice/app/(protected)/comptabilite/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandantAccountById } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft } from "lucide-react"

const TX_TYPE_LABELS: Record<string, string> = {
  REVENU_SEJOUR: "Revenu séjour",
  HONORAIRES: "Honoraires",
  TRAVAUX: "Travaux",
  REVERSEMENT: "Reversement",
  CHARGE: "Charge",
  AUTRE: "Autre",
}

export default async function CompteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const account = await getMandantAccountById(params.id)
  if (!account) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Compte — ${account.owner.nom}`}
        actions={
          <Link
            href="/comptabilite"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        }
      />

      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Solde courant</p>
          <p
            className={`text-2xl font-semibold mt-1 ${
              account.solde_courant >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {account.solde_courant.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Séquestre</p>
          <p className="text-2xl font-semibold mt-1 text-foreground">
            {account.solde_sequestre.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Nb transactions</p>
          <p className="text-2xl font-semibold mt-1 text-foreground">
            {account.transactions.length}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          Dernières transactions
        </h2>
        {account.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune transaction</p>
        ) : (
          <div className="divide-y divide-border">
            {account.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-24 shrink-0">
                    {new Date(tx.date).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-foreground">{tx.libelle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {TX_TYPE_LABELS[tx.type] ?? tx.type}
                  </span>
                  <StatusBadge status={tx.statut} />
                  <span
                    className={`font-semibold w-28 text-right ${
                      tx.montant >= 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {tx.montant >= 0 ? "+" : ""}
                    {tx.montant.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapports CRG */}
      {account.reports.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Comptes rendus de gestion (CRG)
          </h2>
          <div className="divide-y divide-border">
            {account.reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">
                  {new Date(report.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
                <span className="text-foreground">
                  Revenus :{" "}
                  {report.revenus_sejours.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-muted-foreground">
                  Honoraires :{" "}
                  {report.honoraires_deduits.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
                <span className="font-semibold text-foreground">
                  Reversé :{" "}
                  {report.montant_reverse.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 4 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS

- [ ] **Étape 5 : Commit**

```bash
git add apps/backoffice/lib/dal/comptes.ts apps/backoffice/app/\(protected\)/comptabilite/
git commit -m "feat: add Comptabilité mandant module (accounts + transactions)"
```

---

## Task 6 : Module Facturation honoraires

**Files:**
- Create: `apps/backoffice/lib/dal/facturation.ts`
- Create: `apps/backoffice/lib/validations/facture.ts`
- Test: `apps/backoffice/lib/validations/facture.test.ts`
- Create: `apps/backoffice/app/(protected)/facturation/page.tsx`
- Create: `apps/backoffice/app/(protected)/facturation/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/facturation/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/facturation/[id]/page.tsx`

- [ ] **Étape 1 : Écrire le test de validation**

Créer `apps/backoffice/lib/validations/facture.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { factureSchema, computeMontantTTC } from "./facture"

describe("computeMontantTTC", () => {
  it("calcule le TTC avec TVA 20%", () => {
    expect(computeMontantTTC(1000, 0.20)).toBeCloseTo(1200)
  })
  it("calcule le TTC sans TVA", () => {
    expect(computeMontantTTC(500, 0)).toBe(500)
  })
})

describe("factureSchema", () => {
  it("valide une facture correcte", () => {
    const result = factureSchema.safeParse({
      owner_id: "owner_123",
      periode_debut: "2024-06-01",
      periode_fin: "2024-06-30",
      montant_ht: 350,
      tva_rate: 0.20,
    })
    expect(result.success).toBe(true)
  })

  it("rejette un montant négatif", () => {
    const result = factureSchema.safeParse({
      owner_id: "owner_123",
      periode_debut: "2024-06-01",
      periode_fin: "2024-06-30",
      montant_ht: -100,
      tva_rate: 0.20,
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Étape 2 : Vérifier que le test échoue**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/facture.test.ts
```

Résultat attendu : FAIL avec `Cannot find module './facture'`

- [ ] **Étape 3 : Créer `apps/backoffice/lib/validations/facture.ts`**

```typescript
import { z } from "zod"

export const factureSchema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  periode_debut: z.string().min(1, "Date de début requise"),
  periode_fin: z.string().min(1, "Date de fin requise"),
  montant_ht: z.coerce.number().min(0, "Montant doit être positif"),
  tva_rate: z.coerce.number().min(0).max(1).default(0.20),
})

export type FactureFormData = z.infer<typeof factureSchema>

export function computeMontantTTC(montant_ht: number, tva_rate: number): number {
  return Math.round(montant_ht * (1 + tva_rate) * 100) / 100
}
```

- [ ] **Étape 4 : Vérifier que les tests passent**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/facture.test.ts
```

Résultat attendu : PASS — 4 tests

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/facturation.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getFeeInvoices() {
  return db.feeInvoice.findMany({
    include: { owner: { select: { id: true, nom: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getFeeInvoiceById(id: string) {
  return db.feeInvoice.findUnique({
    where: { id },
    include: {
      owner: true,
      timeEntries: { orderBy: { date: "desc" } },
    },
  })
}

export async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.feeInvoice.count({
    where: {
      numero_facture: { startsWith: `F-${year}-` },
    },
  })
  return `F-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createFeeInvoice(data: {
  owner_id: string
  periode_debut: Date
  periode_fin: Date
  montant_ht: number
  tva_rate: number
  montant_ttc: number
}) {
  const numero_facture = await getNextInvoiceNumber()
  return db.feeInvoice.create({
    data: {
      ...data,
      numero_facture,
      statut: "BROUILLON",
    },
  })
}

export async function updateInvoiceStatut(
  id: string,
  statut: "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"
) {
  return db.feeInvoice.update({ where: { id }, data: { statut } })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/facturation/page.tsx`**

```tsx
import Link from "next/link"
import { getFeeInvoices } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type InvoiceRow = Awaited<ReturnType<typeof getFeeInvoices>>[number]

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "numero_facture",
    header: "N° Facture",
    cell: ({ row }) => (
      <Link
        href={`/facturation/${row.original.id}`}
        className="font-mono text-sm font-medium text-foreground hover:text-primary"
      >
        {row.original.numero_facture}
      </Link>
    ),
  },
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.owner.id}`}
        className="text-muted-foreground hover:text-primary"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "periode",
    header: "Période",
    cell: ({ row }) =>
      `${new Date(row.original.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → ${new Date(row.original.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`,
  },
  {
    accessorKey: "montant_ht",
    header: "Montant HT",
    cell: ({ row }) =>
      row.original.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
  },
  {
    accessorKey: "montant_ttc",
    header: "Montant TTC",
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
]

export default async function FacturationPage() {
  const invoices = await getFeeInvoices()

  return (
    <div>
      <PageHeader
        title="Facturation honoraires"
        description={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/facturation/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Rechercher une facture…"
        searchColumn="numero_facture"
      />
    </div>
  )
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/facturation/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { factureSchema, computeMontantTTC } from "@/lib/validations/facture"
import { createFeeInvoice } from "@/lib/dal/facturation"

export async function createFactureAction(
  _prev: unknown,
  formData: FormData
) {
  const raw = {
    owner_id: formData.get("owner_id"),
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
    montant_ht: formData.get("montant_ht"),
    tva_rate: formData.get("tva_rate"),
  }

  const parsed = factureSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { owner_id, periode_debut, periode_fin, montant_ht, tva_rate } = parsed.data
  const montant_ttc = computeMontantTTC(montant_ht, tva_rate)

  await createFeeInvoice({
    owner_id,
    periode_debut: new Date(periode_debut),
    periode_fin: new Date(periode_fin),
    montant_ht,
    tva_rate,
    montant_ttc,
  })

  revalidatePath("/facturation")
  redirect("/facturation")
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/facturation/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createFactureAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewFacturePage() {
  const [state, formAction, isPending] = useActionState(createFactureAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvelle facture d'honoraires"
        actions={
          <Link href="/facturation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="owner_id">ID Propriétaire</Label>
          <Input id="owner_id" name="owner_id" placeholder="cuid du propriétaire" />
          {state?.error?.owner_id && (
            <p className="text-sm text-destructive">{state.error.owner_id[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="periode_debut">Début de période</Label>
            <Input id="periode_debut" name="periode_debut" type="date" />
            {state?.error?.periode_debut && (
              <p className="text-sm text-destructive">{state.error.periode_debut[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="periode_fin">Fin de période</Label>
            <Input id="periode_fin" name="periode_fin" type="date" />
            {state?.error?.periode_fin && (
              <p className="text-sm text-destructive">{state.error.periode_fin[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="montant_ht">Montant HT (€)</Label>
            <Input id="montant_ht" name="montant_ht" type="number" step="0.01" placeholder="350.00" />
            {state?.error?.montant_ht && (
              <p className="text-sm text-destructive">{state.error.montant_ht[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tva_rate">Taux TVA</Label>
            <select
              id="tva_rate"
              name="tva_rate"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="0.20"
            >
              <option value="0">0% (exonéré)</option>
              <option value="0.10">10%</option>
              <option value="0.20">20%</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer la facture"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/facturation/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft } from "lucide-react"

export default async function FactureDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.numero_facture}
        actions={
          <Link href="/facturation" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Facture
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Propriétaire</span>
              <Link href={`/proprietaires/${invoice.owner.id}`} className="text-primary hover:underline">
                {invoice.owner.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Période</span>
              <span>
                {new Date(invoice.periode_debut).toLocaleDateString("fr-FR")} →{" "}
                {new Date(invoice.periode_fin).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={invoice.statut} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Montants
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant HT</span>
              <span>
                {invoice.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</span>
              <span>
                {((invoice.montant_ttc - invoice.montant_ht)).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-3">
              <span className="text-foreground">Total TTC</span>
              <span className="text-foreground">
                {invoice.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {invoice.timeEntries.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Temps passé
          </h2>
          <div className="divide-y divide-border">
            {invoice.timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground w-24 shrink-0">
                  {new Date(entry.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="flex-1 text-foreground">{entry.description}</span>
                <span className="text-muted-foreground ml-4">
                  {entry.nb_heures}h × {entry.taux_horaire}€/h
                </span>
                <span className="font-semibold ml-4">
                  {entry.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 10 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — 35 tests

- [ ] **Étape 11 : Commit**

```bash
git add apps/backoffice/lib/dal/facturation.ts apps/backoffice/lib/validations/facture.ts apps/backoffice/lib/validations/facture.test.ts apps/backoffice/app/\(protected\)/facturation/
git commit -m "feat: add Facturation honoraires module (FeeInvoice)"
```

---

## Task 7 : Module Prestataires

**Files:**
- Create: `apps/backoffice/lib/validations/prestataire.ts` + `.test.ts`
- Create: `apps/backoffice/lib/dal/prestataires.ts`
- Create: `apps/backoffice/app/(protected)/prestataires/page.tsx`
- Create: `apps/backoffice/app/(protected)/prestataires/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/prestataires/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/prestataires/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/prestataires/[id]/edit/page.tsx`
- Create: `apps/backoffice/app/(protected)/prestataires/[id]/actions.ts`

- [ ] **Étape 1 : Écrire le test de validation**

Créer `apps/backoffice/lib/validations/prestataire.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { prestataireSchema } from "./prestataire"

describe("prestataireSchema", () => {
  it("valide un prestataire minimal", () => {
    const result = prestataireSchema.safeParse({
      nom: "Dupont Plomberie",
      metier: "Plombier",
    })
    expect(result.success).toBe(true)
  })

  it("rejette un nom vide", () => {
    const result = prestataireSchema.safeParse({
      nom: "",
      metier: "Plombier",
    })
    expect(result.success).toBe(false)
  })

  it("accepte des champs optionnels", () => {
    const result = prestataireSchema.safeParse({
      nom: "Martin Elec",
      metier: "Électricien",
      email: "martin@elec.fr",
      telephone: "0612345678",
      siret: "12345678901234",
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Étape 2 : Vérifier que le test échoue**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/prestataire.test.ts
```

Résultat attendu : FAIL avec `Cannot find module './prestataire'`

- [ ] **Étape 3 : Créer `apps/backoffice/lib/validations/prestataire.ts`**

```typescript
import { z } from "zod"

export const prestataireSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  metier: z.string().min(1, "Métier requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  siret: z.string().length(14, "SIRET doit faire 14 caractères").optional().or(z.literal("")),
  notes: z.string().optional(),
})

export type PrestataireFormData = z.infer<typeof prestataireSchema>
```

- [ ] **Étape 4 : Vérifier que les tests passent**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/prestataire.test.ts
```

Résultat attendu : PASS — 3 tests

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/prestataires.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getPrestataires() {
  return db.contractor.findMany({
    orderBy: { nom: "asc" },
    include: {
      _count: { select: { workOrders: true, cleaningTasks: true } },
    },
  })
}

export async function getPrestataireById(id: string) {
  return db.contractor.findUnique({
    where: { id },
    include: {
      workOrders: {
        include: { property: { select: { id: true, nom: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })
}

export async function createPrestataire(data: {
  nom: string
  metier: string
  email?: string
  telephone?: string
  siret?: string
  notes?: string
}) {
  return db.contractor.create({
    data: {
      ...data,
      email: data.email || null,
      siret: data.siret || null,
    },
  })
}

export async function updatePrestataire(
  id: string,
  data: Partial<{
    nom: string
    metier: string
    email: string
    telephone: string
    siret: string
    notes: string
    actif: boolean
  }>
) {
  return db.contractor.update({ where: { id }, data })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/prestataires/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prestataireSchema } from "@/lib/validations/prestataire"
import { createPrestataire } from "@/lib/dal/prestataires"

export async function createPrestataireAction(
  _prev: unknown,
  formData: FormData
) {
  const raw = {
    nom: formData.get("nom"),
    metier: formData.get("metier"),
    email: formData.get("email") || undefined,
    telephone: formData.get("telephone") || undefined,
    siret: formData.get("siret") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = prestataireSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createPrestataire(parsed.data)
  revalidatePath("/prestataires")
  redirect("/prestataires")
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/prestataires/[id]/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prestataireSchema } from "@/lib/validations/prestataire"
import { updatePrestataire } from "@/lib/dal/prestataires"

export async function updatePrestataireAction(
  id: string,
  _prev: unknown,
  formData: FormData
) {
  const raw = {
    nom: formData.get("nom"),
    metier: formData.get("metier"),
    email: formData.get("email") || undefined,
    telephone: formData.get("telephone") || undefined,
    siret: formData.get("siret") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = prestataireSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updatePrestataire(id, parsed.data)
  revalidatePath(`/prestataires/${id}`)
  redirect(`/prestataires/${id}`)
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/prestataires/page.tsx`**

```tsx
import Link from "next/link"
import { getPrestataires } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type PrestataireRow = Awaited<ReturnType<typeof getPrestataires>>[number]

const columns: ColumnDef<PrestataireRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/prestataires/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "metier",
    header: "Métier",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.metier}</span>
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
    id: "nb_interventions",
    header: "Interventions",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original._count.workOrders} ordre{row.original._count.workOrders !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    id: "actif",
    header: "Statut",
    cell: ({ row }) => (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          row.original.actif
            ? "bg-green-100 text-green-800"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {row.original.actif ? "Actif" : "Inactif"}
      </span>
    ),
  },
]

export default async function PrestatairesPage() {
  const prestataires = await getPrestataires()

  return (
    <div>
      <PageHeader
        title="Prestataires"
        description={`${prestataires.length} prestataire${prestataires.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/prestataires/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prestataire
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={prestataires}
        searchPlaceholder="Rechercher un prestataire…"
        searchColumn="nom"
      />
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/prestataires/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPrestataireAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPrestatairePage() {
  const [state, formAction, isPending] = useActionState(
    createPrestataireAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouveau prestataire"
        actions={
          <Link href="/prestataires">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom / Raison sociale</Label>
          <Input id="nom" name="nom" placeholder="Dupont Plomberie" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="metier">Métier</Label>
          <Input id="metier" name="metier" placeholder="Plombier, Électricien, Femme de ménage…" />
          {state?.error?.metier && (
            <p className="text-sm text-destructive">{state.error.metier[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contact@prestataire.fr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" name="telephone" placeholder="0612345678" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret">SIRET (14 chiffres)</Label>
          <Input id="siret" name="siret" placeholder="12345678901234" maxLength={14} />
          {state?.error?.siret && (
            <p className="text-sm text-destructive">{state.error.siret[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Informations complémentaires…"
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Créer le prestataire"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/prestataires/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPrestataireById } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit } from "lucide-react"

export default async function PrestataireDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const prestataire = await getPrestataireById(params.id)
  if (!prestataire) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={prestataire.nom}
        actions={
          <Link href={`/prestataires/${prestataire.id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Informations
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Métier</span>
              <span className="text-foreground font-medium">{prestataire.metier}</span>
            </div>
            {prestataire.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{prestataire.email}</span>
              </div>
            )}
            {prestataire.telephone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="text-foreground">{prestataire.telephone}</span>
              </div>
            )}
            {prestataire.siret && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SIRET</span>
                <span className="font-mono text-xs text-foreground">{prestataire.siret}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  prestataire.actif
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {prestataire.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Statistiques
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ordres de travaux</span>
              <span className="text-foreground font-semibold">{prestataire.workOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {prestataire.workOrders.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Ordres de travaux récents
          </h2>
          <div className="divide-y divide-border">
            {prestataire.workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/travaux/${wo.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{wo.titre}</p>
                  <p className="text-xs text-muted-foreground">{wo.property.nom}</p>
                </div>
                <StatusBadge status={wo.statut} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {prestataire.notes && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            Notes
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{prestataire.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 11 : Créer `apps/backoffice/app/(protected)/prestataires/[id]/edit/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePrestataireAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditPrestatairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updatePrestataireAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le prestataire"
        actions={
          <Link href={`/prestataires/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom / Raison sociale</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="metier">Métier</Label>
          <Input id="metier" name="metier" />
          {state?.error?.metier && (
            <p className="text-sm text-destructive">{state.error.metier[0]}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" name="telephone" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input id="siret" name="siret" maxLength={14} />
          {state?.error?.siret && (
            <p className="text-sm text-destructive">{state.error.siret[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 12 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — 38 tests

- [ ] **Étape 13 : Commit**

```bash
git add apps/backoffice/lib/dal/prestataires.ts apps/backoffice/lib/validations/prestataire.ts apps/backoffice/lib/validations/prestataire.test.ts apps/backoffice/app/\(protected\)/prestataires/
git commit -m "feat: add Prestataires module (contractors CRUD)"
```

---

## Task 8 : Module Travaux (Ordres de service)

**Files:**
- Create: `apps/backoffice/lib/validations/workorder.ts` + `.test.ts`
- Create: `apps/backoffice/lib/dal/travaux.ts`
- Create: `apps/backoffice/app/(protected)/travaux/page.tsx`
- Create: `apps/backoffice/app/(protected)/travaux/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/travaux/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/travaux/[id]/page.tsx`
- Create: `apps/backoffice/app/(protected)/travaux/[id]/actions.ts`

- [ ] **Étape 1 : Écrire le test de validation**

Créer `apps/backoffice/lib/validations/workorder.test.ts` :

```typescript
import { describe, it, expect } from "vitest"
import { workorderSchema } from "./workorder"

describe("workorderSchema", () => {
  it("valide un ordre de travaux minimal", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "Fuite robinet cuisine",
      description: "Le robinet de la cuisine fuit",
      type: "Plomberie",
      urgence: "NORMALE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(true)
  })

  it("rejette un titre vide", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "",
      description: "desc",
      type: "Plomberie",
      urgence: "NORMALE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(false)
  })

  it("rejette une urgence inconnue", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "Test",
      description: "desc",
      type: "Plomberie",
      urgence: "TRES_URGENTE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Étape 2 : Vérifier que le test échoue**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/workorder.test.ts
```

Résultat attendu : FAIL avec `Cannot find module './workorder'`

- [ ] **Étape 3 : Créer `apps/backoffice/lib/validations/workorder.ts`**

```typescript
import { z } from "zod"

export const workorderSchema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  contractor_id: z.string().optional(),
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  type: z.string().min(1, "Type requis"),
  urgence: z.enum(["NORMALE", "URGENTE", "CRITIQUE"]),
  imputable_a: z.enum(["PROPRIETAIRE", "SOCIETE"]),
  notes: z.string().optional(),
})

export type WorkOrderFormData = z.infer<typeof workorderSchema>
```

- [ ] **Étape 4 : Vérifier que les tests passent**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run lib/validations/workorder.test.ts
```

Résultat attendu : PASS — 3 tests

- [ ] **Étape 5 : Créer `apps/backoffice/lib/dal/travaux.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getWorkOrders() {
  return db.workOrder.findMany({
    include: {
      property: { select: { id: true, nom: true } },
      contractor: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getWorkOrderById(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, nom: true } },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
  })
}

export async function createWorkOrder(
  created_by: string,
  data: {
    property_id: string
    contractor_id?: string
    titre: string
    description: string
    type: string
    urgence: "NORMALE" | "URGENTE" | "CRITIQUE"
    imputable_a: "PROPRIETAIRE" | "SOCIETE"
    notes?: string
  }
) {
  return db.workOrder.create({
    data: {
      ...data,
      created_by,
      statut: "OUVERT",
    },
  })
}

export async function updateWorkOrderStatut(
  id: string,
  statut:
    | "OUVERT"
    | "EN_COURS"
    | "EN_ATTENTE_DEVIS"
    | "EN_ATTENTE_VALIDATION"
    | "VALIDE"
    | "TERMINE"
    | "ANNULE"
) {
  return db.workOrder.update({ where: { id }, data: { statut } })
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/travaux/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { workorderSchema } from "@/lib/validations/workorder"
import { createWorkOrder } from "@/lib/dal/travaux"

export async function createWorkOrderAction(
  _prev: unknown,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Non authentifié")

  const raw = {
    property_id: formData.get("property_id"),
    contractor_id: formData.get("contractor_id") || undefined,
    titre: formData.get("titre"),
    description: formData.get("description"),
    type: formData.get("type"),
    urgence: formData.get("urgence"),
    imputable_a: formData.get("imputable_a"),
    notes: formData.get("notes") || undefined,
  }

  const parsed = workorderSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createWorkOrder(session.user.email, parsed.data)
  revalidatePath("/travaux")
  redirect("/travaux")
}
```

- [ ] **Étape 7 : Créer `apps/backoffice/app/(protected)/travaux/[id]/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { updateWorkOrderStatut } from "@/lib/dal/travaux"

export async function updateWorkOrderStatutAction(
  id: string,
  statut: "OUVERT" | "EN_COURS" | "EN_ATTENTE_DEVIS" | "EN_ATTENTE_VALIDATION" | "VALIDE" | "TERMINE" | "ANNULE"
) {
  await updateWorkOrderStatut(id, statut)
  revalidatePath(`/travaux/${id}`)
  revalidatePath("/travaux")
}
```

- [ ] **Étape 8 : Créer `apps/backoffice/app/(protected)/travaux/page.tsx`**

```tsx
import Link from "next/link"
import { getWorkOrders } from "@/lib/dal/travaux"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type WorkOrderRow = Awaited<ReturnType<typeof getWorkOrders>>[number]

const columns: ColumnDef<WorkOrderRow>[] = [
  {
    accessorKey: "titre",
    header: "Titre",
    cell: ({ row }) => (
      <Link
        href={`/travaux/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.titre}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.property.id}`}
        className="text-muted-foreground hover:text-primary"
      >
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "urgence",
    header: "Urgence",
    cell: ({ row }) => <StatusBadge status={row.original.urgence} />,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "prestataire",
    header: "Prestataire",
    cell: ({ row }) =>
      row.original.contractor ? (
        <Link
          href={`/prestataires/${row.original.contractor.id}`}
          className="text-muted-foreground hover:text-primary"
        >
          {row.original.contractor.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground italic">Non assigné</span>
      ),
  },
  {
    id: "date",
    header: "Créé le",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("fr-FR"),
  },
]

export default async function TravauxPage() {
  const workOrders = await getWorkOrders()

  return (
    <div>
      <PageHeader
        title="Travaux"
        description={`${workOrders.length} ordre${workOrders.length !== 1 ? "s" : ""} de service`}
        actions={
          <Link href="/travaux/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau travail
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={workOrders}
        searchPlaceholder="Rechercher un travail…"
        searchColumn="titre"
      />
    </div>
  )
}
```

- [ ] **Étape 9 : Créer `apps/backoffice/app/(protected)/travaux/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createWorkOrderAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewTravauxPage() {
  const [state, formAction, isPending] = useActionState(
    createWorkOrderAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouvel ordre de travaux"
        actions={
          <Link href="/travaux">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="property_id">ID du bien</Label>
          <Input id="property_id" name="property_id" placeholder="cuid du bien" />
          {state?.error?.property_id && (
            <p className="text-sm text-destructive">{state.error.property_id[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titre">Titre</Label>
          <Input id="titre" name="titre" placeholder="Fuite robinet cuisine" />
          {state?.error?.titre && (
            <p className="text-sm text-destructive">{state.error.titre[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Décrivez le problème en détail…"
          />
          {state?.error?.description && (
            <p className="text-sm text-destructive">{state.error.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de travaux</Label>
            <Input id="type" name="type" placeholder="Plomberie, Électricité…" />
            {state?.error?.type && (
              <p className="text-sm text-destructive">{state.error.type[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgence">Urgence</Label>
            <select
              id="urgence"
              name="urgence"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="NORMALE"
            >
              <option value="NORMALE">Normale</option>
              <option value="URGENTE">Urgente</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imputable_a">Imputation</Label>
          <select
            id="imputable_a"
            name="imputable_a"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="PROPRIETAIRE"
          >
            <option value="PROPRIETAIRE">Propriétaire</option>
            <option value="SOCIETE">Société</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor_id">ID Prestataire (optionnel)</Label>
          <Input id="contractor_id" name="contractor_id" placeholder="cuid du prestataire" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer l'ordre de travaux"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 10 : Créer `apps/backoffice/app/(protected)/travaux/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getWorkOrderById } from "@/lib/dal/travaux"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateWorkOrderStatutAction } from "./actions"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: string }>> = {
  OUVERT: [
    { label: "Démarrer", value: "EN_COURS" },
    { label: "Demander devis", value: "EN_ATTENTE_DEVIS" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_COURS: [
    { label: "Terminer", value: "TERMINE" },
    { label: "Mettre en attente", value: "EN_ATTENTE_VALIDATION" },
  ],
  EN_ATTENTE_DEVIS: [
    { label: "Valider", value: "VALIDE" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_ATTENTE_VALIDATION: [
    { label: "Valider", value: "VALIDE" },
    { label: "Refuser", value: "ANNULE" },
  ],
  VALIDE: [{ label: "Démarrer", value: "EN_COURS" }],
  TERMINE: [],
  ANNULE: [],
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const wo = await getWorkOrderById(params.id)
  if (!wo) notFound()

  const actions = NEXT_STATUTS[wo.statut] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={wo.titre}
        actions={
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <form
                key={action.value}
                action={updateWorkOrderStatutAction.bind(null, wo.id, action.value as any)}
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
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Détails
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bien</span>
              <Link href={`/biens/${wo.property.id}`} className="text-primary hover:underline">
                {wo.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">{wo.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Urgence</span>
              <StatusBadge status={wo.urgence} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={wo.statut} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Imputable à</span>
              <span className="text-foreground">
                {wo.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société"}
              </span>
            </div>
            {wo.contractor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${wo.contractor.id}`} className="text-primary hover:underline">
                  {wo.contractor.nom}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Description
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{wo.description}</p>
          {wo.notes && (
            <>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide pt-4 border-t">
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wo.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Étape 11 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — 41 tests

- [ ] **Étape 12 : Commit**

```bash
git add apps/backoffice/lib/dal/travaux.ts apps/backoffice/lib/validations/workorder.ts apps/backoffice/lib/validations/workorder.test.ts apps/backoffice/app/\(protected\)/travaux/
git commit -m "feat: add Travaux module (work orders CRUD)"
```

---

## Task 9 : Module Administration (Gestion des utilisateurs)

**Files:**
- Create: `apps/backoffice/lib/dal/admin.ts`
- Create: `apps/backoffice/app/(protected)/admin/page.tsx`
- Create: `apps/backoffice/app/(protected)/admin/users/new/page.tsx`
- Create: `apps/backoffice/app/(protected)/admin/users/new/actions.ts`
- Create: `apps/backoffice/app/(protected)/admin/users/[id]/edit/page.tsx`
- Create: `apps/backoffice/app/(protected)/admin/users/[id]/actions.ts`

- [ ] **Étape 1 : Créer `apps/backoffice/lib/dal/admin.ts`**

```typescript
import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"

export async function getUsers() {
  return db.user.findMany({
    orderBy: { nom: "asc" },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      actif: true,
      createdAt: true,
    },
  })
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      actif: true,
      createdAt: true,
    },
  })
}

export async function createUser(data: {
  email: string
  nom: string
  role: "ADMIN" | "GESTIONNAIRE" | "COMPTABLE" | "RESPONSABLE_TRAVAUX" | "CHARGE_SERVICES" | "DIRECTION"
  password: string
}) {
  const password_hash = await bcrypt.hash(data.password, 12)
  return db.user.create({
    data: {
      email: data.email,
      nom: data.nom,
      role: data.role,
      password_hash,
      actif: true,
    },
  })
}

export async function updateUser(
  id: string,
  data: Partial<{
    nom: string
    role: string
    actif: boolean
  }>
) {
  return db.user.update({ where: { id }, data })
}
```

- [ ] **Étape 2 : Créer `apps/backoffice/app/(protected)/admin/users/new/actions.ts`**

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createUser } from "@/lib/dal/admin"

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  nom: z.string().min(1, "Nom requis"),
  role: z.enum(["ADMIN", "GESTIONNAIRE", "COMPTABLE", "RESPONSABLE_TRAVAUX", "CHARGE_SERVICES", "DIRECTION"]),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
})

export async function createUserAction(_prev: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email"),
    nom: formData.get("nom"),
    role: formData.get("role"),
    password: formData.get("password"),
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createUser(parsed.data)
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: { email: ["Cet email est déjà utilisé"] } }
    }
    throw e
  }

  revalidatePath("/admin")
  redirect("/admin")
}
```

- [ ] **Étape 3 : Créer `apps/backoffice/app/(protected)/admin/users/[id]/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { updateUser } from "@/lib/dal/admin"

export async function updateUserAction(
  id: string,
  _prev: unknown,
  formData: FormData
) {
  const nom = formData.get("nom") as string
  const actif = formData.get("actif") === "true"

  if (!nom) return { error: { nom: ["Nom requis"] } }

  await updateUser(id, { nom, actif })
  revalidatePath("/admin")
  redirect("/admin")
}
```

- [ ] **Étape 4 : Créer `apps/backoffice/app/(protected)/admin/page.tsx`**

```tsx
import Link from "next/link"
import { getUsers } from "@/lib/dal/admin"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@conciergerie/ui"
import { Plus, Shield } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type UserRow = Awaited<ReturnType<typeof getUsers>>[number]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  COMPTABLE: "Comptable",
  RESPONSABLE_TRAVAUX: "Resp. travaux",
  CHARGE_SERVICES: "Chargé services",
  DIRECTION: "Direction",
}

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/admin/users/${row.original.id}/edit`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {ROLE_LABELS[row.original.role] ?? row.original.role}
      </span>
    ),
  },
  {
    accessorKey: "actif",
    header: "Statut",
    cell: ({ row }) => (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          row.original.actif
            ? "bg-green-100 text-green-800"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {row.original.actif ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    id: "since",
    header: "Depuis",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("fr-FR"),
  },
]

export default async function AdminPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description={`${users.length} utilisateur${users.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/admin/users/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </Link>
        }
      />

      <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Seul un administrateur peut créer ou désactiver des comptes. Les mots de passe ne sont jamais affichés.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Rechercher un utilisateur…"
        searchColumn="nom"
      />
    </div>
  )
}
```

- [ ] **Étape 5 : Créer `apps/backoffice/app/(protected)/admin/users/new/page.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createUserAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewUserPage() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvel utilisateur"
        actions={
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet</Label>
          <Input id="nom" name="nom" placeholder="Jean Dupont" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jean@conciergerie.fr" />
          {state?.error?.email && (
            <p className="text-sm text-destructive">{state.error.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="GESTIONNAIRE"
          >
            <option value="ADMIN">Administrateur SI</option>
            <option value="DIRECTION">Direction</option>
            <option value="GESTIONNAIRE">Gestionnaire locatif</option>
            <option value="COMPTABLE">Comptable</option>
            <option value="RESPONSABLE_TRAVAUX">Responsable travaux</option>
            <option value="CHARGE_SERVICES">Chargé de services</option>
          </select>
          {state?.error?.role && (
            <p className="text-sm text-destructive">{state.error.role[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe provisoire</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="minimum 8 caractères"
          />
          {state?.error?.password && (
            <p className="text-sm text-destructive">{state.error.password[0]}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer l'utilisateur"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 6 : Créer `apps/backoffice/app/(protected)/admin/users/[id]/edit/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateUserAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updateUserAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier l'utilisateur"
        actions={
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Statut du compte</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="true" defaultChecked />
              <span>Actif</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="false" />
              <span>Inactif</span>
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Étape 7 : Lancer les tests**

```bash
pnpm --filter @conciergerie/backoffice exec vitest run
```

Résultat attendu : PASS — 41 tests (pas de nouveaux tests pour l'admin — logique serveur sans business rules testables)

- [ ] **Étape 8 : Commit final + tag**

```bash
git add apps/backoffice/lib/dal/admin.ts apps/backoffice/app/\(protected\)/admin/
git commit -m "feat: add Administration module (user management)"
git tag p1c-complete
```

---

## Récapitulatif P1c

À l'issue de ce plan, le back-office est :

| Catégorie | État |
|---|---|
| Thème | 100% shadcn classique — palette provençale supprimée |
| Design tokens | CSS variables standard shadcn/ui (bleu primary, slate neutre) |
| Sidebar | Organisée par sections avec tous les modules |
| Comptabilité mandant | Liste comptes + détail transactions + CRG |
| Facturation honoraires | Liste + création + détail FeeInvoice |
| Prestataires | CRUD complet |
| Travaux | CRUD + transitions statut |
| Administration | Gestion utilisateurs (CRUD + toggle actif) |

**Tests :** 41 tests, tous passants. Validations Zod testées pour chaque nouveau module.

**Modules P2 (hors scope P1c) :** Rapprochement bancaire, États des lieux, Messagerie, Planning calendrier, Portail propriétaire.
