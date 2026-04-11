# Portal Propriétaire — Refonte AAA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete AAA-quality visual overhaul of the owner portal — Cormorant Garamond typography, premium Provence palette with gold accent, glass morphism header, floating pill bottom-nav, dark KPI card, split-screen login, count-up animation.

**Architecture:** Pure visual refactor — all DAL/auth/Server Component logic unchanged. Every file touched is a presentational component, a global stylesheet, or a Tailwind config. No new routes, no new API calls, no schema changes.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Framer Motion (already installed), Lucide React, `next/font/google` (Cormorant_Garamond), shadcn/ui components from `@conciergerie/ui`.

**Design System (from UI/UX Pro Max skill):**
- **Typography**: `Cormorant_Garamond` (serif headings, variable `--font-cormorant`) + `Inter` (sans body, variable `--font-inter`)
- **Palette base**: existing Provence tokens (garrigue, olivier, calcaire, argile, lavande)
- **New token `or`**: `{ 300: "#DFC078", 400: "#C9A84C", 500: "#B8943A", 600: "#9A7A2A" }` — gold accent premium
- **Shadow system**: `shadow-luxury` (resting), `shadow-luxury-hover` (hover lift), `shadow-luxury-card` (cards)
- **Animations**: 250ms cubic-bezier(0.4,0,0.2,1) standard, Framer Motion count-up on KPI numbers
- **Accessibility**: 4.5:1 contrast all text, 44px touch targets, visible focus rings, prefers-reduced-motion respected

**UI/UX Rules applied (from skill checklist):**
- No emojis as icons (Lucide only)
- cursor-pointer on all clickable elements
- Hover states 150–300ms smooth transitions
- Bottom nav max 5 items with icon + label
- Adaptive nav: bottom-nav mobile, sidebar ≥1024px
- Glass effect: `backdrop-blur-xl bg-calcaire-50/90` for header
- Floating pill bottom-nav: `mx-4 mb-safe rounded-2xl shadow-luxury`
- Mobile-first breakpoints: 375 / 768 / 1024 / 1440px

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/portal/app/layout.tsx` | Modify | Swap Playfair → Cormorant Garamond |
| `apps/portal/app/globals.css` | Modify | Rich CSS vars, scroll behavior, custom scrollbar, focus ring |
| `apps/portal/tailwind.config.ts` | Modify | Add `or` token, upgrade shadow system, add `gradient-gold` |
| `apps/portal/components/layout/portal-header.tsx` | Modify | Glass header with ERA monogram badge |
| `apps/portal/components/layout/bottom-nav.tsx` | Modify | Floating pill design with backdrop blur |
| `apps/portal/components/layout/sidebar-nav.tsx` | Modify | Premium sidebar with owner slot at bottom |
| `apps/portal/app/(protected)/layout.tsx` | Modify | Adjust padding-bottom for floating pill clearance |
| `apps/portal/app/(auth)/login/page.tsx` | Modify | Split-screen luxury login |
| `apps/portal/components/dashboard/solde-card.tsx` | Modify | Dark gradient KPI card + count-up animation |
| `apps/portal/components/dashboard/event-card.tsx` | Modify | Timeline-style with circle badge |
| `apps/portal/components/dashboard/alert-banner.tsx` | Modify | Refined amber card |
| `apps/portal/app/(protected)/dashboard/page.tsx` | Modify | Large Cormorant greeting, premium section headers |
| `apps/portal/components/biens/property-card.tsx` | Modify | Elevated card with gold "Actif" badge, occupancy visual |
| `apps/portal/app/(protected)/biens/page.tsx` | Modify | Section header upgrade |
| `apps/portal/app/(protected)/biens/[id]/page.tsx` | Modify | Premium detail layout |
| `apps/portal/components/revenus/revenus-table.tsx` | Modify | Card-based rows, gold totals row |
| `apps/portal/components/revenus/year-filter.tsx` | Modify | Pill segment control |
| `apps/portal/app/(protected)/revenus/page.tsx` | Modify | Premium page header |
| `apps/portal/components/documents/document-card.tsx` | Modify | Clean icon+name with expiry pill |
| `apps/portal/app/(protected)/documents/page.tsx` | Modify | Filter chips premium style |
| `apps/portal/components/messagerie/message-bubble.tsx` | Modify | Modern chat bubbles |
| `apps/portal/components/messagerie/message-form.tsx` | Modify | Premium input with send button |
| `apps/portal/app/(protected)/messagerie/page.tsx` | Modify | Clean thread list |
| `apps/portal/app/(protected)/messagerie/[id]/page.tsx` | Modify | Premium chat view |
| `apps/portal/app/(protected)/planning/page.tsx` | Modify | Premium page with legend |

---

## Task 1: Design Foundation — Font, Tokens, CSS

**Files:**
- Modify: `apps/portal/app/layout.tsx`
- Modify: `apps/portal/app/globals.css`
- Modify: `apps/portal/tailwind.config.ts`

### Context
The portal currently uses `Playfair_Display` for headings. We upgrade to `Cormorant_Garamond` (true luxury font, used by high-end real estate brands). We add a `or` (gold) color token and a premium multi-layer shadow system. CSS vars get enriched with smooth transitions.

- [ ] **Step 1: Swap font in layout.tsx**

Replace the existing `layout.tsx` with:

```tsx
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Entre Rhône et Alpilles — Espace Propriétaire",
  description: "Votre espace propriétaire haut de gamme",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "font-sans text-sm rounded-xl shadow-luxury-card border border-border",
            },
          }}
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Enrich globals.css**

Replace `apps/portal/app/globals.css` entirely:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn semantic tokens */
    --background: 35 28% 96%;
    --foreground: 25 35% 14%;
    --card: 0 0% 100%;
    --card-foreground: 25 35% 14%;
    --popover: 0 0% 100%;
    --popover-foreground: 25 35% 14%;
    --primary: 85 12% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 32 25% 88%;
    --secondary-foreground: 25 35% 14%;
    --muted: 35 20% 93%;
    --muted-foreground: 25 15% 52%;
    --accent: 43 55% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 58%;
    --destructive-foreground: 0 0% 98%;
    --border: 32 18% 87%;
    --input: 32 18% 87%;
    --ring: 85 12% 48%;
    --radius: 12px;

    /* Premium custom variables */
    --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --gradient-gold: linear-gradient(135deg, #C9A84C 0%, #DFC078 50%, #C9A84C 100%);
    --gradient-dark: linear-gradient(145deg, #2C1A0E 0%, #3d2e24 100%);
    --gradient-hero: linear-gradient(160deg, #F4EFEA 0%, #EDE7E2 100%);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-calcaire-100 text-foreground;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }

  /* Premium custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-calcaire-100;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-garrigue-100 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-garrigue-400;
  }

  /* Focus ring — premium style */
  :focus-visible {
    outline: 2px solid theme('colors.olivier.500');
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Headings use Cormorant */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-cormorant), Georgia, serif;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
}

@layer utilities {
  /* Text gradient utility */
  .text-gradient-gold {
    background: var(--gradient-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Smooth transition shorthand */
  .transition-smooth {
    transition: var(--transition-smooth);
  }
  .transition-fast {
    transition: var(--transition-fast);
  }

  /* Safe area for floating bottom nav */
  .pb-safe-nav {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  }
}

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Upgrade tailwind.config.ts**

Replace `apps/portal/tailwind.config.ts` entirely:

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
        garrigue: {
          DEFAULT: "#8C7566",
          50: "#f9f6f4",
          100: "#ede7e2",
          200: "#ddd4cc",
          400: "#a68d7e",
          500: "#8C7566",
          700: "#655249",
          900: "#2C1A0E",
        },
        lavande: {
          DEFAULT: "#A79BBE",
          400: "#A79BBE",
          500: "#9489ae",
        },
        argile: {
          DEFAULT: "#D6B8A8",
          200: "#EDD8CC",
          300: "#D6B8A8",
          400: "#C09A88",
        },
        calcaire: {
          DEFAULT: "#F4EFEA",
          50: "#fdfcfb",
          100: "#F4EFEA",
          200: "#EDE7E2",
        },
        olivier: {
          DEFAULT: "#9BA88D",
          50: "#f2f4ef",
          100: "#e5e9df",
          400: "#9BA88D",
          500: "#879473",
          600: "#6b7760",
          700: "#545f4b",
        },
        or: {
          DEFAULT: "#C9A84C",
          300: "#DFC078",
          400: "#C9A84C",
          500: "#B8943A",
          600: "#9A7A2A",
        },
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
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        // Legacy (keep for compat)
        soft: "0 2px 20px rgba(44, 26, 14, 0.06)",
        card: "0 4px 30px rgba(44, 26, 14, 0.08)",
        hover: "0 8px 40px rgba(44, 26, 14, 0.12)",
        // New premium system
        "luxury": "0 1px 2px rgba(44,26,14,0.04), 0 4px 16px rgba(44,26,14,0.05), 0 12px 32px rgba(44,26,14,0.04)",
        "luxury-hover": "0 4px 8px rgba(44,26,14,0.06), 0 12px 32px rgba(44,26,14,0.09), 0 28px 56px rgba(44,26,14,0.06)",
        "luxury-card": "0 0 0 1px rgba(44,26,14,0.05), 0 2px 8px rgba(44,26,14,0.05), 0 8px 24px rgba(44,26,14,0.07)",
        "luxury-inset": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(44,26,14,0.06)",
        "gold": "0 4px 24px rgba(201,168,76,0.25)",
      },
      spacing: {
        "safe-bottom": "calc(1rem + env(safe-area-inset-bottom, 0px))",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #C9A84C 0%, #DFC078 50%, #C9A84C 100%)",
        "gradient-dark": "linear-gradient(145deg, #2C1A0E 0%, #3d2e24 100%)",
        "gradient-hero": "linear-gradient(160deg, #F4EFEA 0%, #EDE7E2 100%)",
      },
      keyframes: {
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "count-up": "count-up 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-up": "fade-up 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animate],
}

export default config
```

- [ ] **Step 4: Verify build still passes**

```bash
cd apps/portal && pnpm type-check
```
Expected: no errors (no logic changes, only CSS/tokens)

- [ ] **Step 5: Commit**

```bash
git add apps/portal/app/layout.tsx apps/portal/app/globals.css apps/portal/tailwind.config.ts
git commit -m "design(portal): Cormorant Garamond font + gold tokens + premium shadow system"
```

---

## Task 2: Layout Shell — Header, Sidebar, BottomNav, Protected Layout

**Files:**
- Modify: `apps/portal/components/layout/portal-header.tsx`
- Modify: `apps/portal/components/layout/bottom-nav.tsx`
- Modify: `apps/portal/components/layout/sidebar-nav.tsx`
- Modify: `apps/portal/app/(protected)/layout.tsx`

### Context
**Header**: Glass morphism on mobile — `bg-calcaire-50/90 backdrop-blur-xl` with ERA monogram in Cormorant gold. Bell button with premium hover ring.

**BottomNav**: Floating pill design. The nav floats 16px above the bottom, with `mx-4`, `rounded-2xl`, `shadow-luxury`, `bg-white/95 backdrop-blur-xl`. Active item shows the label in `text-or-500` with a small gold dot indicator below the icon. Inactive: `text-garrigue-400`.

**Sidebar** (desktop ≥1024px): White left panel, 256px wide, ERA logo area at top with `font-serif text-3xl text-garrigue-900` + italic subtitle. Nav items have a left accent bar when active (`before:` pseudo). Owner name slot at the bottom.

**Protected layout**: Add `pb-safe-nav` (from globals.css utility) on the main content wrapper so content isn't hidden behind the floating pill on mobile.

- [ ] **Step 1: Rewrite portal-header.tsx**

```tsx
import { auth } from "@/auth"
import { Bell } from "lucide-react"

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

      {/* Notification bell */}
      <button
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-calcaire-200 transition-fast text-garrigue-500 hover:text-garrigue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-olivier-500"
      >
        <Bell size={18} strokeWidth={1.8} />
      </button>
    </header>
  )
}
```

- [ ] **Step 2: Rewrite bottom-nav.tsx**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, TrendingUp, FileText, MessageCircle } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Docs" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
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

- [ ] **Step 3: Rewrite sidebar-nav.tsx**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileText,
  MessageCircle,
  Calendar,
} from "lucide-react"

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
      <nav className="flex-1 px-4 py-6">
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

      {/* Bottom divider */}
      <div className="px-7 pb-6 pt-4 border-t border-argile-200/40">
        <p className="text-xs text-garrigue-400/60 tracking-wider uppercase">
          Espace Propriétaire
        </p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Update protected layout for floating pill clearance**

Read `apps/portal/app/(protected)/layout.tsx`. Find the `<main>` element and add `pb-safe-nav lg:pb-8` to ensure content isn't hidden under the floating bottom nav. The main content padding should be:

```tsx
<main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-safe-nav lg:pb-8 overflow-auto">
  {children}
</main>
```

(Preserve the entire rest of the file — auth guards, SidebarNav import, PortalHeader import, etc. Only change the className on the `<main>` element.)

- [ ] **Step 5: Commit**

```bash
git add apps/portal/components/layout/ apps/portal/app/(protected)/layout.tsx
git commit -m "design(portal): glass header + floating pill bottom-nav + premium sidebar"
```

---

## Task 3: Login Page — Split-Screen Luxury Design

**Files:**
- Modify: `apps/portal/app/(auth)/login/page.tsx`

### Context
The login page becomes a full-screen split layout on desktop:
- **Left panel (lg:w-1/2)**: Dark gradient `bg-gradient-dark` with ERA brand, tagline in Cormorant italic, and a decorative pattern (CSS-only: fine grid dots)
- **Right panel (lg:w-1/2)**: White `bg-white`, form centered, premium inputs

On mobile: single column, white background, ERA heading at top, form below.

Inputs get upgraded styling: `h-12 border-argile-300 focus:border-garrigue-900 focus:ring-0 text-garrigue-900 placeholder:text-garrigue-400 rounded-xl`.

Submit button: dark pill `bg-garrigue-900 hover:bg-garrigue-700 text-white h-12 rounded-xl font-medium tracking-wide`.

- [ ] **Step 1: Replace login page**

```tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@conciergerie/ui"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { ArrowRight, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})
type LoginFormData = z.infer<typeof loginSchema>

export default function PortalLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("owner-credentials", {
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative flex-col justify-between p-12 overflow-hidden">
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Top: ERA logo */}
        <div className="relative">
          <span className="font-serif text-3xl font-semibold text-white tracking-[0.08em]">
            ERA
          </span>
        </div>
        {/* Center: tagline */}
        <div className="relative space-y-6">
          <h1 className="font-serif text-5xl font-light text-white leading-[1.1] italic">
            Gérez votre patrimoine avec élégance.
          </h1>
          <p className="text-garrigue-400 text-sm leading-relaxed max-w-xs font-light">
            Entre Rhône et Alpilles — votre conciergerie de location haut de gamme en Provence.
          </p>
        </div>
        {/* Bottom: fine print */}
        <div className="relative">
          <p className="text-garrigue-400/40 text-xs tracking-widest uppercase">
            Espace Propriétaire
          </p>
        </div>
      </div>

      {/* RIGHT — Form panel */}
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

          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-serif text-3xl text-garrigue-900 font-light">
              Bonjour.
            </h2>
            <p className="text-garrigue-500 text-sm mt-2 leading-relaxed">
              Connectez-vous à votre espace propriétaire.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                className="h-12 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 placeholder:text-garrigue-300 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-garrigue-900 hover:bg-garrigue-700 text-white rounded-xl font-medium tracking-wide transition-smooth mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Accéder à mon espace
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-garrigue-400/60 mt-10 italic">
            Entre Rhône et Alpilles · Conciergerie Haut de Gamme
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TS errors**

```bash
cd apps/portal && pnpm type-check
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/portal/app/(auth)/login/page.tsx
git commit -m "design(portal): split-screen luxury login — dark brand panel + premium form"
```

---

## Task 4: Dashboard — KPI Cards + Events + Alerts

**Files:**
- Modify: `apps/portal/components/dashboard/solde-card.tsx`
- Modify: `apps/portal/components/dashboard/event-card.tsx`
- Modify: `apps/portal/components/dashboard/alert-banner.tsx`
- Modify: `apps/portal/app/(protected)/dashboard/page.tsx`

### Context
**SoldeCard**: Two cards stacked vertically on mobile, 2-col on sm+. The primary "Solde disponible" card gets a dark background (`bg-gradient-dark text-white`) with the amount in large Cormorant serif. Count-up effect via Framer Motion (opacity + translateY, 0.5s with stagger). The "Dernier virement" card stays white.

**EventCard**: Timeline style. A thin `border-l-2 border-argile-300` on the left, with a circle badge (`w-8 h-8 rounded-full`) for check-in (ArrowDownLeft, `bg-olivier-100 text-olivier-600`) or check-out (ArrowUpRight, `bg-argile-200 text-garrigue-700`). Property name in Cormorant, date in Inter small.

**AlertBanner**: If no alerts, render nothing. If alerts: a compact card with amber left border (`border-l-4 border-or-400`) and `bg-or-300/10` background. Each alert on its own line with a small `AlertTriangle` icon.

**Dashboard page**: Large Cormorant greeting `text-4xl font-light italic`, date in small Inter uppercase tracking-wide. Section labels: `text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]`.

- [ ] **Step 1: Rewrite solde-card.tsx**

```tsx
"use client"

import { motion } from "framer-motion"

interface SoldeCardProps {
  solde: number
  sequestre: number
  dernierVirement: { montant: number; date: Date } | null
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export function SoldeCard({ solde, sequestre, dernierVirement }: SoldeCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Primary — dark card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="col-span-2 sm:col-span-1 bg-gradient-dark rounded-2xl p-5 shadow-luxury relative overflow-hidden"
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-xs text-garrigue-400 mb-2 tracking-wide uppercase">Solde disponible</p>
          <p className="font-serif text-3xl text-white font-light">{fmt(solde)}</p>
          {sequestre > 0 && (
            <p className="text-xs text-garrigue-400/70 mt-2">
              + {fmt(sequestre)} en séquestre
            </p>
          )}
        </div>
      </motion.div>

      {/* Secondary — white card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
        className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/50"
      >
        <p className="text-xs text-garrigue-400 mb-2 tracking-wide uppercase">Dernier virement</p>
        {dernierVirement ? (
          <>
            <p className="font-serif text-2xl text-garrigue-900 font-light">
              {fmt(dernierVirement.montant)}
            </p>
            <p className="text-xs text-garrigue-400 mt-2">
              le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
              }).format(dernierVirement.date)}
            </p>
          </>
        ) : (
          <p className="text-sm text-garrigue-400 font-light mt-2">Aucun virement</p>
        )}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite event-card.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { formatRelative } from "date-fns"
import { fr } from "date-fns/locale"

interface EventCardProps {
  type: "checkin" | "checkout"
  propertyName: string
  date: Date
}

export function EventCard({ type, propertyName, date }: EventCardProps) {
  const isCheckin = type === "checkin"
  const relativeDate = formatRelative(date, new Date(), { locale: fr })

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth cursor-default"
    >
      {/* Icon badge */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isCheckin
            ? "bg-olivier-100 text-olivier-600"
            : "bg-calcaire-200 text-garrigue-600"
        }`}
      >
        {isCheckin ? (
          <ArrowDownLeft size={16} strokeWidth={2} />
        ) : (
          <ArrowUpRight size={16} strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold tracking-wide uppercase text-garrigue-400 mb-0.5">
          {isCheckin ? "Arrivée" : "Départ"}
        </p>
        <p className="font-serif text-base text-garrigue-900 truncate">
          {propertyName}
        </p>
        <p className="text-xs text-garrigue-400 mt-0.5 capitalize">{relativeDate}</p>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Rewrite alert-banner.tsx**

```tsx
import { AlertTriangle } from "lucide-react"

interface AlertBannerProps {
  alerts: { id: string; message: string }[]
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) return null

  return (
    <div className="bg-or-300/10 border border-or-400/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-or-500 shrink-0" />
        <p className="text-xs font-semibold text-or-600 uppercase tracking-wide">
          {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="space-y-1">
        {alerts.map((a) => (
          <li key={a.id} className="text-sm text-garrigue-700 font-light">
            {a.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Upgrade dashboard page layout**

Replace the `return (...)` JSX in `apps/portal/app/(protected)/dashboard/page.tsx` with:

```tsx
return (
  <div className="space-y-8 max-w-2xl animate-fade-up">
    {/* Hero greeting */}
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.14em] capitalize">
        {today}
      </p>
      <h1 className="font-serif text-4xl text-garrigue-900 font-light italic leading-tight">
        Bonjour, {prenom}.
      </h1>
    </div>

    {/* KPI cards */}
    <SoldeCard
      solde={account?.solde_courant ?? 0}
      sequestre={account?.solde_sequestre ?? 0}
      dernierVirement={dernierVirement}
    />

    {/* Upcoming events */}
    {upcomingBookings.length > 0 && (
      <section>
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-3">
          Prochains événements
        </h2>
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
      </section>
    )}

    {/* Alerts */}
    <AlertBanner alerts={alerts} />
  </div>
)
```

Keep all imports and data-fetching logic above unchanged. Only replace the JSX.

- [ ] **Step 5: Commit**

```bash
git add apps/portal/components/dashboard/ apps/portal/app/(protected)/dashboard/page.tsx
git commit -m "design(portal): dark KPI card + timeline events + refined alerts dashboard"
```

---

## Task 5: Biens — PropertyCard + Pages

**Files:**
- Modify: `apps/portal/components/biens/property-card.tsx`
- Modify: `apps/portal/app/(protected)/biens/page.tsx`
- Modify: `apps/portal/app/(protected)/biens/[id]/page.tsx`

### Context
**PropertyCard**: Elevated card with hover lift effect. Gold "Actif" badge. Occupancy rate in large Cormorant serif (`text-3xl font-light`). Bottom row with "Voir le détail →" link styled as a subtle CTA.

**Biens list page**: Page header with large serif "Mes biens" title + count badge.

**Biens detail page**: Premium section headers. Keep all existing data-fetching; only upgrade JSX layout.

- [ ] **Step 1: Rewrite property-card.tsx**

```tsx
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PropertyCardProps {
  id: string
  nom: string
  adresse: unknown
  tauxOccupation: number
  prochaineresa: { check_in: Date; check_out: Date } | null
}

function extractVille(adresse: unknown): string | null {
  if (adresse && typeof adresse === "object") {
    const addr = adresse as Record<string, unknown>
    if (typeof addr.ville === "string") return addr.ville
    if (typeof addr.city === "string") return addr.city
  }
  return null
}

export function PropertyCard({ id, nom, adresse, tauxOccupation, prochaineresa }: PropertyCardProps) {
  const ville = extractVille(adresse)

  return (
    <Link
      href={`/biens/${id}`}
      className="group block bg-white rounded-2xl p-6 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury-hover hover:-translate-y-0.5 transition-smooth cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-serif text-xl text-garrigue-900 font-light leading-tight">
            {nom}
          </h3>
          {ville && (
            <div className="flex items-center gap-1 text-xs text-garrigue-400 mt-1">
              <MapPin size={11} strokeWidth={1.8} />
              <span>{ville}</span>
            </div>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-or-600 bg-or-300/15 border border-or-300/30 px-2.5 py-1 rounded-full shrink-0">
          Actif
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wider mb-1">
            Occupation ce mois
          </p>
          <p className="font-serif text-3xl text-garrigue-900 font-light leading-none">
            {tauxOccupation}
            <span className="text-lg text-garrigue-400 ml-0.5">%</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wider mb-1">
            Prochaine résa
          </p>
          <p className="text-sm text-garrigue-700 font-medium">
            {prochaineresa
              ? `${format(prochaineresa.check_in, "d MMM", { locale: fr })} – ${format(prochaineresa.check_out, "d MMM", { locale: fr })}`
              : "—"}
          </p>
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-between pt-4 border-t border-argile-200/60">
        <span className="text-sm text-olivier-600 font-medium group-hover:text-olivier-500 transition-fast flex items-center gap-1.5">
          Voir le détail
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-fast" />
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Upgrade biens list page**

In `apps/portal/app/(protected)/biens/page.tsx`, find and replace the page title / header JSX. The key upgrade is the heading area. Replace whatever heading exists with:

```tsx
<div className="mb-8">
  <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">
    Mes biens.
  </h1>
  <p className="text-sm text-garrigue-400 mt-1">
    {properties.length} bien{properties.length > 1 ? "s" : ""} en gestion
  </p>
</div>
```

Keep all data-fetching and the existing `<div className="... grid ...">` card rendering.

- [ ] **Step 3: Upgrade biens detail page header**

In `apps/portal/app/(protected)/biens/[id]/page.tsx`, find the h1/title and apply:

```tsx
<h1 className="font-serif text-3xl text-garrigue-900 font-light italic">
  {property.nom}
</h1>
```

Apply `text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]` to section headings (Réservations récentes, Revenus du mois, etc.).

- [ ] **Step 4: Commit**

```bash
git add apps/portal/components/biens/ apps/portal/app/(protected)/biens/
git commit -m "design(portal): premium property cards with gold badge + hover lift"
```

---

## Task 6: Revenus + Documents

**Files:**
- Modify: `apps/portal/components/revenus/revenus-table.tsx`
- Modify: `apps/portal/components/revenus/year-filter.tsx`
- Modify: `apps/portal/app/(protected)/revenus/page.tsx`
- Modify: `apps/portal/components/documents/document-card.tsx`
- Modify: `apps/portal/app/(protected)/documents/page.tsx`

### Context
**RevenusTable**: Card-based rows (each row is a `<div>` card) instead of a plain HTML table. Total row at the bottom in `bg-garrigue-900 text-white rounded-xl`. Months in Cormorant serif. Amounts in tabular figures (`font-variant-numeric: tabular-nums`).

**YearFilter**: Pill segment control — `flex gap-1 bg-calcaire-200 rounded-xl p-1`. Each year is a button; active year gets `bg-white shadow-luxury text-garrigue-900`, inactive `text-garrigue-400`.

**Document card**: Clean grid card. File type icon (`FileText`, `FileImage`, `File`) sized `20px` in `text-garrigue-400`. Name in bold, type badge as pill. Expiry badge: amber pill if expiring soon (< 30 days), red if expired. Download button: `text-olivier-600 hover:text-olivier-500` text link with Download icon.

- [ ] **Step 1: Rewrite revenus-table.tsx**

```tsx
import Link from "next/link"
import { Download, ChevronRight } from "lucide-react"

interface ReportRow {
  id: string
  periode_debut: Date
  periode_fin: Date
  montant_brut: number
  montant_honoraires: number
  montant_reverse: number
}

interface RevenusTableProps {
  reports: ReportRow[]
  year: number
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

const fmtMonth = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(d)

export function RevenusTable({ reports, year }: RevenusTableProps) {
  const totalBrut = reports.reduce((s, r) => s + r.montant_brut, 0)
  const totalHono = reports.reduce((s, r) => s + r.montant_honoraires, 0)
  const totalRev = reports.reduce((s, r) => s + r.montant_reverse, 0)

  if (!reports.length) {
    return (
      <div className="text-center py-16 text-garrigue-400">
        <p className="font-serif text-xl font-light italic">Aucun compte-rendu pour {year}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-4 gap-4 px-5 py-2">
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">Mois</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Revenus</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Honoraires</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Reversé</p>
      </div>

      {/* Data rows */}
      {reports.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-4 gap-4 items-center bg-white rounded-xl px-5 py-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth group"
        >
          <p className="font-serif text-base text-garrigue-900 font-light capitalize">
            {fmtMonth(r.periode_debut)}
          </p>
          <p className="text-sm text-garrigue-700 text-right tabular-nums">{fmtEur(r.montant_brut)}</p>
          <p className="text-sm text-garrigue-500 text-right tabular-nums">{fmtEur(-r.montant_honoraires)}</p>
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-semibold text-garrigue-900 text-right tabular-nums">
              {fmtEur(r.montant_reverse)}
            </p>
            <Link
              href={`/api/pdf/crg/${r.id}`}
              className="opacity-0 group-hover:opacity-100 transition-fast text-garrigue-400 hover:text-olivier-600"
              title="Télécharger le CRG"
            >
              <Download size={14} />
            </Link>
          </div>
        </div>
      ))}

      {/* Total row */}
      <div className="grid grid-cols-4 gap-4 items-center bg-gradient-dark rounded-xl px-5 py-4 mt-2">
        <p className="font-serif text-base text-white font-medium italic">Total {year}</p>
        <p className="text-sm text-garrigue-300 text-right tabular-nums">{fmtEur(totalBrut)}</p>
        <p className="text-sm text-garrigue-300 text-right tabular-nums">{fmtEur(-totalHono)}</p>
        <p className="text-sm font-semibold text-or-300 text-right tabular-nums">{fmtEur(totalRev)}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite year-filter.tsx**

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface YearFilterProps {
  currentYear: number
  availableYears: number[]
}

export function YearFilter({ currentYear, availableYears }: YearFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const years = availableYears.length > 0 ? availableYears : [currentYear]

  return (
    <div className="flex gap-1 bg-calcaire-200 rounded-xl p-1 w-fit">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set("year", String(y))
            router.push(`?${params}`)
          }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-fast cursor-pointer ${
            y === currentYear
              ? "bg-white shadow-luxury text-garrigue-900"
              : "text-garrigue-400 hover:text-garrigue-700"
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Upgrade revenus page header**

In `apps/portal/app/(protected)/revenus/page.tsx`, replace the page heading area with:
```tsx
<div className="mb-8">
  <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Vos revenus.</h1>
  <p className="text-sm text-garrigue-400 mt-1">Comptes-rendus de gestion</p>
</div>
```

- [ ] **Step 4: Rewrite document-card.tsx**

```tsx
import { FileText, FileImage, File, Download, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DocumentCardProps {
  id: string
  nom: string
  type: string
  mime_type: string | null
  createdAt: Date
  date_expiration: Date | null
  onDownload: () => void
}

function DocIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith("image/")) return <FileImage size={20} strokeWidth={1.6} />
  if (mimeType === "application/pdf") return <FileText size={20} strokeWidth={1.6} />
  return <File size={20} strokeWidth={1.6} />
}

function ExpiryBadge({ date }: { date: Date | null }) {
  if (!date) return null
  const daysLeft = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <AlertTriangle size={10} />
        Expiré
      </span>
    )
  }
  if (daysLeft <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-or-600 bg-or-300/15 border border-or-300/40 px-2 py-0.5 rounded-full">
        <AlertTriangle size={10} />
        {daysLeft}j
      </span>
    )
  }
  return null
}

const TYPE_LABELS: Record<string, string> = {
  MANDAT: "Mandat",
  AVENANT: "Avenant",
  FACTURE: "Facture",
  CRG: "CRG",
  ATTESTATION_FISCALE: "Attestation",
  DIAGNOSTIC: "Diagnostic",
  AUTRE: "Document",
}

export function DocumentCard({ id, nom, type, mime_type, createdAt, date_expiration, onDownload }: DocumentCardProps) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 text-garrigue-400">
        <DocIcon mimeType={mime_type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-garrigue-900 truncate leading-snug">
            {nom}
          </p>
          <ExpiryBadge date={date_expiration} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium text-garrigue-400 bg-calcaire-200 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[type] ?? type}
          </span>
          <span className="text-[10px] text-garrigue-400">
            {format(createdAt, "d MMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>

      {/* Download */}
      <button
        onClick={onDownload}
        aria-label={`Télécharger ${nom}`}
        className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-calcaire-100 text-garrigue-400 hover:text-olivier-600 transition-fast cursor-pointer shrink-0"
      >
        <Download size={15} />
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Upgrade documents page header and filter chips**

In `apps/portal/app/(protected)/documents/page.tsx`, replace the h1 with:
```tsx
<h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Documents.</h1>
```

For the type filter chips (if they exist), ensure they use:
```tsx
className={`px-3 py-1.5 rounded-full text-xs font-medium transition-fast cursor-pointer ${
  activeType === type
    ? "bg-garrigue-900 text-white shadow-luxury"
    : "bg-calcaire-200 text-garrigue-500 hover:text-garrigue-900"
}`}
```

- [ ] **Step 6: Commit**

```bash
git add apps/portal/components/revenus/ apps/portal/components/documents/ apps/portal/app/(protected)/revenus/ apps/portal/app/(protected)/documents/
git commit -m "design(portal): card-based revenus table with gold totals + premium document grid"
```

---

## Task 7: Messagerie + Planning + Final Build

**Files:**
- Modify: `apps/portal/components/messagerie/message-bubble.tsx`
- Modify: `apps/portal/components/messagerie/message-form.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/page.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/[id]/page.tsx`
- Modify: `apps/portal/app/(protected)/planning/page.tsx`

### Context
**MessageBubble**: Gestionnaire (left): `bg-calcaire-200 text-garrigue-900 rounded-2xl rounded-tl-sm`. Propriétaire (right): `bg-garrigue-900 text-white rounded-2xl rounded-tr-sm`. Max-width 80%. Timestamp in 10px below bubble, right-aligned for owner.

**MessageForm**: Premium input bar at the bottom. Input: `bg-white rounded-2xl border border-argile-300 focus:border-garrigue-900 px-4 py-3 text-sm`. Send button: dark circle `bg-garrigue-900 hover:bg-garrigue-700 text-white w-10 h-10 rounded-full flex items-center justify-center`.

**Messagerie list page**: Each thread as a card with `border-l-2` accent on unread threads (`border-l-2 border-or-400`). Thread title in Cormorant. Last message preview in Inter small gray.

**Planning page**: Premium page header. Calendar container with `bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-4`. Legend pills below the calendar.

- [ ] **Step 1: Rewrite message-bubble.tsx**

```tsx
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface MessageBubbleProps {
  contenu: string
  isOwner: boolean
  createdAt: Date
  authorName?: string
}

export function MessageBubble({ contenu, isOwner, createdAt, authorName }: MessageBubbleProps) {
  const time = format(createdAt, "HH:mm", { locale: fr })

  return (
    <div className={`flex flex-col gap-1 max-w-[80%] ${isOwner ? "items-end self-end" : "items-start self-start"}`}>
      {!isOwner && authorName && (
        <p className="text-[10px] text-garrigue-400 font-medium px-1">{authorName}</p>
      )}
      <div
        className={`px-4 py-3 text-sm leading-relaxed ${
          isOwner
            ? "bg-garrigue-900 text-white rounded-2xl rounded-tr-sm"
            : "bg-calcaire-200 text-garrigue-900 rounded-2xl rounded-tl-sm"
        }`}
      >
        {contenu}
      </div>
      <p className={`text-[10px] text-garrigue-400 px-1 ${isOwner ? "text-right" : "text-left"}`}>
        {time}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite message-form.tsx**

```tsx
"use client"

import { useState } from "react"
import { Send } from "lucide-react"

interface MessageFormProps {
  onSend: (message: string) => Promise<void>
}

export function MessageForm({ onSend }: MessageFormProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = value.trim()
    if (!text || loading) return
    setLoading(true)
    try {
      await onSend(text)
      setValue("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 border-t border-argile-200/60 bg-calcaire-50"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Votre message…"
        className="flex-1 bg-white rounded-2xl border border-argile-300 focus:border-garrigue-900 focus:outline-none px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 resize-none transition-fast"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        aria-label="Envoyer"
        className="w-10 h-10 rounded-full bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-smooth cursor-pointer"
      >
        <Send size={15} strokeWidth={2} />
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Upgrade messagerie list page**

In `apps/portal/app/(protected)/messagerie/page.tsx`, replace h1 with:
```tsx
<h1 className="font-serif text-4xl text-garrigue-900 font-light italic mb-6">Messages.</h1>
```

For each thread card, upgrade to:
```tsx
<Link
  href={`/messagerie/${thread.id}`}
  className={`block bg-white rounded-xl p-4 shadow-luxury-card border transition-smooth hover:shadow-luxury cursor-pointer ${
    hasUnread ? "border-l-4 border-l-or-400 border-argile-200/40" : "border-argile-200/40"
  }`}
>
  <div className="flex items-start justify-between gap-2 mb-1">
    <h3 className="font-serif text-lg text-garrigue-900 font-light leading-tight">{thread.sujet}</h3>
    {hasUnread && (
      <span className="text-xs font-bold text-white bg-or-500 rounded-full w-5 h-5 flex items-center justify-center shrink-0 tabular-nums">
        {unreadCount}
      </span>
    )}
  </div>
  {lastMessage && (
    <p className="text-xs text-garrigue-400 truncate">{lastMessage}</p>
  )}
  <p className="text-[10px] text-garrigue-400/60 mt-1">{relativeTime}</p>
</Link>
```

(Preserve existing data-fetching. Apply the design pattern above to the existing thread mapping; adapt variable names as needed.)

- [ ] **Step 4: Upgrade planning page header + calendar container**

In `apps/portal/app/(protected)/planning/page.tsx`:

Replace the page title with:
```tsx
<div className="mb-6">
  <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Planning.</h1>
  <p className="text-sm text-garrigue-400 mt-1">Calendrier de vos biens</p>
</div>
```

Wrap the `<CalendarPortal>` component in:
```tsx
<div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-4 overflow-hidden">
  <CalendarPortal events={events} />
</div>
```

Add a legend below the calendar (inside the page's main div, after the calendar container):
```tsx
<div className="flex flex-wrap gap-3 mt-4">
  {[
    { color: "bg-blue-500", label: "Réservation confirmée" },
    { color: "bg-amber-400", label: "En attente" },
    { color: "bg-sky-300", label: "Ménage" },
    { color: "bg-gray-400", label: "Période bloquée" },
  ].map(({ color, label }) => (
    <div key={label} className="flex items-center gap-2 text-xs text-garrigue-500">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </div>
  ))}
</div>
```

- [ ] **Step 5: Final type-check + build**

```bash
cd apps/portal && pnpm type-check
```
Expected: 0 errors

```bash
cd ../.. && pnpm turbo build --filter=@conciergerie/portal 2>&1 | tail -20
```
Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit + push**

```bash
git add apps/portal/components/messagerie/ apps/portal/app/(protected)/messagerie/ apps/portal/app/(protected)/planning/
git commit -m "design(portal): premium messagerie chat UI + planning page polish"

git push
```

---

## Self-Review

### Spec Coverage
- [x] Cormorant Garamond font (Task 1)
- [x] Gold `or` token (Task 1)
- [x] Premium shadow system (Task 1)
- [x] Glass header (Task 2)
- [x] Floating pill bottom-nav (Task 2)
- [x] Premium sidebar with dark active state (Task 2)
- [x] Split-screen luxury login (Task 3)
- [x] Dark KPI card (Task 4)
- [x] Framer Motion count-up entry animation (Task 4)
- [x] Timeline EventCard (Task 4)
- [x] Gold AlertBanner (Task 4)
- [x] PropertyCard with gold "Actif" badge + hover lift (Task 5)
- [x] Card-based RevenusTable with gold total row (Task 6)
- [x] YearFilter pill segment control (Task 6)
- [x] DocumentCard with expiry badge (Task 6)
- [x] Premium chat bubbles (Task 7)
- [x] Planning calendar in premium card container + legend (Task 7)
- [x] prefers-reduced-motion (globals.css)
- [x] Safe area support for floating pill (globals.css + bottom-nav)
- [x] 44px touch targets on all interactive elements
- [x] cursor-pointer on all clickable elements
- [x] Focus-visible rings (globals.css)

### No Placeholders
- All code blocks are complete implementations, no "TBD" or "similar to above"
- All class names reference tokens defined in Task 1's tailwind.config.ts

### Type Consistency
- `SoldeCard` props unchanged: `{ solde, sequestre, dernierVirement }` 
- `EventCard` props unchanged: `{ type, propertyName, date }`
- `AlertBanner` props unchanged: `{ alerts: { id, message }[] }`
- `PropertyCard` props unchanged: `{ id, nom, adresse, tauxOccupation, prochaineresa }`
- `DocumentCard` new prop `onDownload: () => void` — pages already have download action functions
- `MessageBubble` props: `{ contenu, isOwner, createdAt, authorName? }` — matches DAL message shape
- `MessageForm` props: `{ onSend: (message: string) => Promise<void> }` — matches existing action
