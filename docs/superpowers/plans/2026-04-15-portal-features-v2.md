# Portal — Features Vague 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix document visibility + download, add CRG PDF export, add unread message badge in nav, and add new thread creation from messagerie.

**Architecture:** Four sequential tasks. Task 1 fixes the broken document DAL + download action (owner_id vs mandate relationship). Task 2 adds a `/api/pdf/crg/[id]` route to the portal by installing @react-pdf/renderer and reusing the CRG template logic. Task 3 threads an `unreadCount` from the layout through to both nav components. Task 4 adds a dialog-driven new thread form.

**Tech Stack:** Next.js 14 App Router, Prisma, @react-pdf/renderer (to install), Sonner (already installed for toasts), Framer Motion (already installed).

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/portal/lib/dal/documents.ts` | Modify | Broaden query to include mandate-linked docs |
| `apps/portal/app/(protected)/documents/actions.ts` | Modify | Fix auth check for null owner_id |
| `apps/portal/lib/dal/crg.ts` | Create | Portal-side `getOwnerReportById` with owner verification |
| `apps/portal/lib/pdf/crg-template.tsx` | Create | Copy of CRG PDF template (portal-local) |
| `apps/portal/app/api/pdf/crg/[id]/route.ts` | Create | Generates + streams CRG PDF |
| `apps/portal/lib/dal/messagerie.ts` | Modify | Add `getOwnerUnreadCount` |
| `apps/portal/app/(protected)/layout.tsx` | Modify | Fetch unreadCount, pass to nav components |
| `apps/portal/components/layout/sidebar-nav.tsx` | Modify | Accept + render `unreadCount` badge on Messages |
| `apps/portal/components/layout/bottom-nav.tsx` | Modify | Accept + render `unreadCount` badge on Messages |
| `apps/portal/lib/dal/messagerie.ts` | Modify | Add `createOwnerThread` |
| `apps/portal/app/(protected)/messagerie/actions.ts` | Modify | Add `createThreadAction` |
| `apps/portal/components/messagerie/new-thread-dialog.tsx` | Create | Dialog with sujet + message fields |
| `apps/portal/app/(protected)/messagerie/page.tsx` | Modify | Add "Nouveau message" button + NewThreadDialog |

---

## Task 1: Fix Document Visibility + Download

**Files:**
- Modify: `apps/portal/lib/dal/documents.ts`
- Modify: `apps/portal/app/(protected)/documents/actions.ts`

### Context

The `getOwnerDocuments` DAL uses `where: { owner_id: ownerId }`. But documents created by the back-office for mandates (mandat PDFs, avenants, CRGs stored as documents) only have `mandate_id` set — `owner_id` is null. These documents never appear in the portal.

The download action `getDocumentViewUrlAction` checks `doc.owner_id !== session.user.ownerId`. When `owner_id` is null: `null !== "someId"` = `true` → "Accès refusé". Downloads always fail for mandate-linked docs.

Document model relations (from schema):
- `Document.owner_id` — optional, direct owner link
- `Document.mandate_id` — optional, mandate link (`Mandate.owner_id` links back to owner)
- `Document.booking_id` — optional, booking link (`Booking.property.mandate.owner_id` links back)

- [ ] **Step 1: Replace `apps/portal/lib/dal/documents.ts`**

```typescript
import { db } from "@conciergerie/db"
import type { DocumentType } from "@conciergerie/db"

export async function getOwnerDocuments(ownerId: string, type?: DocumentType) {
  return db.document.findMany({
    where: {
      entity_type: { not: "message" },
      ...(type ? { type } : {}),
      OR: [
        { owner_id: ownerId },
        { mandate: { owner_id: ownerId } },
        { booking: { property: { mandate: { owner_id: ownerId } } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOwnerDocument(ownerId: string, documentId: string) {
  return db.document.findFirst({
    where: {
      id: documentId,
      OR: [
        { owner_id: ownerId },
        { mandate: { owner_id: ownerId } },
        { booking: { property: { mandate: { owner_id: ownerId } } } },
      ],
    },
  })
}
```

- [ ] **Step 2: Replace `apps/portal/app/(protected)/documents/actions.ts`**

```typescript
"use server"

import { auth } from "@/auth"
import { getOwnerDocument } from "@/lib/dal/documents"
import { getPresignedDownloadUrl } from "@conciergerie/storage"

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const doc = await getOwnerDocument(session.user.ownerId, id)
  if (!doc) return { error: "Document introuvable ou accès refusé" }

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

- [ ] **Step 3: Type-check**

```bash
cd C:/Developpement/conciergerie/apps/portal && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/documents.ts "apps/portal/app/(protected)/documents/actions.ts"
git commit -m "fix(portal): include mandate/booking docs + fix download auth check"
```

---

## Task 2: CRG PDF Route in Portal

**Files:**
- Create: `apps/portal/lib/dal/crg.ts`
- Create: `apps/portal/lib/pdf/crg-template.tsx`
- Create: `apps/portal/app/api/pdf/crg/[id]/route.ts`

### Context

`RevenusTable` already has a download link: `<Link href={`/api/pdf/crg/${r.id}`} ...>` (only shown when `r.document_id` is set). But this route doesn't exist in the portal — it only exists in the backoffice. We need to add it with proper owner verification.

The CRG PDF template lives in `apps/backoffice/lib/pdf/crg-template.tsx` and uses `@react-pdf/renderer` (version `^4.4.0` in backoffice). We need to install the same package in the portal and create a portal-local copy of the template.

`ManagementReport` schema fields: `id`, `mandant_account_id`, `periode_debut`, `periode_fin`, `revenus_sejours`, `honoraires_deduits`, `charges_deduites`, `montant_reverse`, `date_virement`, `document_id`, `createdAt`.

- [ ] **Step 1: Install `@react-pdf/renderer`**

```bash
cd C:/Developpement/conciergerie && pnpm add @react-pdf/renderer --filter=@conciergerie/portal
```

Expected: `@react-pdf/renderer` added to `apps/portal/package.json` dependencies.

- [ ] **Step 2: Create `apps/portal/lib/dal/crg.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function getOwnerReportForPdf(ownerId: string, reportId: string) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
    select: {
      id: true,
      solde_courant: true,
      owner: {
        select: { id: true, nom: true, email: true, type: true },
      },
    },
  })
  if (!account) return null

  const report = await db.managementReport.findFirst({
    where: { id: reportId, mandant_account_id: account.id },
  })
  if (!report) return null

  return { ...report, account }
}
```

- [ ] **Step 3: Create `apps/portal/lib/pdf/crg-template.tsx`**

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

interface CrgReportData {
  periode_debut: Date
  periode_fin: Date
  revenus_sejours: number
  honoraires_deduits: number
  charges_deduites: number
  montant_reverse: number
  date_virement: Date | null
  createdAt: Date
  account: {
    solde_courant: number
    owner: {
      nom: string
      email: string
    }
  }
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
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  companyTagline: { fontSize: 8, color: colors.muted, marginTop: 2 },
  docTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
  },
  docSubtitle: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
    marginTop: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBlock: { width: "48%" },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  infoSub: { fontSize: 8, color: colors.muted },
  tableBlock: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableLabel: { fontSize: 8.5, color: colors.text },
  tableValue: { fontSize: 8.5, color: colors.text, fontFamily: "Helvetica-Bold" },
  deductionValue: { fontSize: 8.5, color: colors.danger, fontFamily: "Helvetica-Bold" },
  summaryBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
  },
  summaryNote: {
    fontSize: 7.5,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },
  virementsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  virementsLabel: {
    fontSize: 8,
    color: colors.success,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  legalText: {
    marginTop: 20,
    fontSize: 7.5,
    color: colors.muted,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
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
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

const fmtMonth = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

export function CrgPDF({ report }: { report: CrgReportData }) {
  const owner = report.account.owner
  const periode = `${fmtDate(report.periode_debut)} — ${fmtDate(report.periode_fin)}`
  const soldeApres = report.account.solde_courant
  const soldeAvant = soldeApres + report.montant_reverse

  return (
    <Document title={`CRG ${fmtMonth(report.periode_debut)} — ${owner.nom}`}>
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
          </View>
          <View>
            <Text style={S.docTitle}>COMPTE-RENDU DE GESTION</Text>
            <Text style={S.docSubtitle}>{fmtMonth(report.periode_debut)}</Text>
          </View>
        </View>

        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Propriétaire</Text>
            <Text style={S.infoValue}>{owner.nom}</Text>
            <Text style={S.infoSub}>{owner.email}</Text>
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Période</Text>
            <Text style={S.infoValue}>{periode}</Text>
            <Text style={S.infoSub}>
              Généré le {fmtDate(report.createdAt)}
            </Text>
          </View>
        </View>

        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Recettes</Text>
          <View style={S.tableHeader}>
            <Text style={S.tableHeaderText}>Poste</Text>
            <Text style={S.tableHeaderText}>Montant</Text>
          </View>
          <View style={S.tableRow}>
            <Text style={S.tableLabel}>Revenus des séjours (net plateforme)</Text>
            <Text style={S.tableValue}>{fmt(report.revenus_sejours)}</Text>
          </View>
        </View>

        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Déductions</Text>
          <View style={S.tableHeader}>
            <Text style={S.tableHeaderText}>Poste</Text>
            <Text style={S.tableHeaderText}>Montant</Text>
          </View>
          <View style={S.tableRow}>
            <Text style={S.tableLabel}>Honoraires de gestion</Text>
            <Text style={S.deductionValue}>-{fmt(report.honoraires_deduits)}</Text>
          </View>
          {report.charges_deduites > 0 && (
            <View style={S.tableRow}>
              <Text style={S.tableLabel}>Charges et travaux</Text>
              <Text style={S.deductionValue}>-{fmt(report.charges_deduites)}</Text>
            </View>
          )}
        </View>

        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Montant à reverser</Text>
          <Text style={S.summaryAmount}>{fmt(report.montant_reverse)}</Text>
          <Text style={S.summaryNote}>
            Solde compte mandant : {fmt(soldeAvant)} → {fmt(soldeApres)} après reversement
          </Text>
        </View>

        {report.date_virement && (
          <View style={S.virementsBox}>
            <Text style={S.virementsLabel}>Virement effectué</Text>
            <Text style={{ fontSize: 8.5 }}>
              {fmt(report.montant_reverse)} le {fmtDate(report.date_virement)}
            </Text>
          </View>
        )}

        <Text style={S.legalText}>
          Ce compte-rendu de gestion est établi conformément à la loi Hoguet n°70-9 du 2 janvier 1970
          et au décret n°72-678 du 20 juillet 1972. Les sommes ci-dessus correspondent aux encaissements
          et décaissements effectués pour votre compte mandant sur la période indiquée.
        </Text>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — Gestion locative</Text>
          <Text style={S.footerText}>CRG {fmtMonth(report.periode_debut)} — {owner.nom}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: Create `apps/portal/app/api/pdf/crg/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { auth } from "@/auth"
import { getOwnerReportForPdf } from "@/lib/dal/crg"
import { CrgPDF } from "@/lib/pdf/crg-template"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.ownerId) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const report = await getOwnerReportForPdf(session.user.ownerId, params.id)
  if (!report) {
    return new NextResponse("CRG introuvable", { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CrgPDF, { report }) as any
  const buffer = await renderToBuffer(element)

  const mois = new Date(report.periode_debut).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })
  const filename = `CRG-${mois}-${report.account.owner.nom.replace(/\s+/g, "-")}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
```

- [ ] **Step 5: Fix `RevenusTable` — show download for all reports, not just those with document_id**

Read `apps/portal/components/revenus/revenus-table.tsx`. The download link is gated on `r.document_id`. But our new route generates the PDF dynamically — no stored document needed. Remove the `r.document_id &&` guard so the download icon always shows.

Find:
```tsx
{r.document_id && (
  <Link
    href={`/api/pdf/crg/${r.id}`}
    className="opacity-0 group-hover:opacity-100 transition-fast text-garrigue-400 hover:text-olivier-600"
    title="Télécharger le CRG"
  >
    <Download size={14} />
  </Link>
)}
```

Replace with:
```tsx
<Link
  href={`/api/pdf/crg/${r.id}`}
  className="opacity-0 group-hover:opacity-100 transition-fast text-garrigue-400 hover:text-olivier-600"
  title="Télécharger le CRG"
  target="_blank"
  rel="noopener noreferrer"
>
  <Download size={14} />
</Link>
```

Also update the `Report` interface to remove the now-unused `document_id` field:
```typescript
interface Report {
  id: string
  periode_debut: Date
  periode_fin: Date
  revenus_sejours: number
  honoraires_deduits: number
  montant_reverse: number
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
git add apps/portal/lib/dal/crg.ts apps/portal/lib/pdf/crg-template.tsx "apps/portal/app/api/pdf/crg/[id]/route.ts" apps/portal/components/revenus/revenus-table.tsx apps/portal/package.json pnpm-lock.yaml
git commit -m "feat(portal): CRG PDF download route with owner verification"
```

---

## Task 3: Unread Messages Badge in Navigation

**Files:**
- Modify: `apps/portal/lib/dal/messagerie.ts`
- Modify: `apps/portal/app/(protected)/layout.tsx`
- Modify: `apps/portal/components/layout/sidebar-nav.tsx`
- Modify: `apps/portal/components/layout/bottom-nav.tsx`

### Context

The messagerie DAL already computes unread count per thread (`_count.messages` where `author_type: "USER"` and `lu_at: null`). We need a lightweight function that returns the total unread count across all threads, fetch it in the layout server component, and pass it down to both nav components so they can show a badge on the Messages item.

`SidebarNav` and `BottomNav` are both `"use client"` components. They can accept `unreadCount: number` as a prop. The layout is a server component so it can fetch data directly.

- [ ] **Step 1: Add `getOwnerUnreadCount` to `apps/portal/lib/dal/messagerie.ts`**

Add this function at the end of the existing file:

```typescript
export async function getOwnerUnreadCount(ownerId: string): Promise<number> {
  const result = await db.message.count({
    where: {
      thread: { owner_id: ownerId },
      author_type: "USER",
      lu_at: null,
    },
  })
  return result
}
```

- [ ] **Step 2: Update `apps/portal/app/(protected)/layout.tsx`**

Read the file. Import `getOwnerUnreadCount` and fetch the count, then pass it to both nav components.

Replace entirely with:

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

- [ ] **Step 3: Update `apps/portal/components/layout/sidebar-nav.tsx`**

Read the file. Add `unreadCount: number` to `SidebarNavProps` and render a badge on the Messages nav item.

Replace entirely with:

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
  unreadCount: number
}

export function SidebarNav({ userName, userEmail, unreadCount }: SidebarNavProps) {
  const pathname = usePathname()
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

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
            const isMessages = href === "/messagerie"
            const showBadge = isMessages && unreadCount > 0
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
                  <Icon
                    size={16}
                    strokeWidth={active ? 2 : 1.6}
                    className="shrink-0 transition-fast"
                  />
                  <span className="tracking-wide flex-1">{label}</span>
                  {showBadge && (
                    <span className="ml-auto text-[10px] font-bold text-white bg-or-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 tabular-nums">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {active && !showBadge && (
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

- [ ] **Step 4: Update `apps/portal/components/layout/bottom-nav.tsx`**

Read the file. Add `unreadCount: number` prop and render a badge dot on the Messages slot.

Replace entirely with:

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
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.6}
                    className="transition-fast"
                  />
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

## Task 4: New Message Thread Dialog

**Files:**
- Modify: `apps/portal/lib/dal/messagerie.ts`
- Modify: `apps/portal/app/(protected)/messagerie/actions.ts`
- Create: `apps/portal/components/messagerie/new-thread-dialog.tsx`
- Modify: `apps/portal/app/(protected)/messagerie/page.tsx`

### Context

The messagerie page lists threads but has no way to create a new one. We add a "Nouveau message" button that opens a Framer Motion dialog (same pattern as `EventDetailModal`). The dialog has two fields: sujet (subject) and premier message (content). On submit, it calls a server action that creates the thread + first message in a single DB transaction, then redirects to the new thread.

`MessageThread` schema: `id`, `owner_id`, `subject`, `contact_type` (default "autre"), `to_name`, `to_email`, `folder` (default "inbox"), `createdAt`, `updatedAt`.
`Message` schema: `thread_id`, `author_type` ("OWNER"), `author_id` (ownerId), `contenu`.

- [ ] **Step 1: Add `createOwnerThread` to `apps/portal/lib/dal/messagerie.ts`**

Add this function at the end of the existing file:

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

- [ ] **Step 2: Add `createThreadAction` to `apps/portal/app/(protected)/messagerie/actions.ts`**

Read the file. Add the import for `redirect` and `createOwnerThread`, then append the new action.

Replace entirely with:

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
  } else {
    console.warn("[sendOwnerMessage] no gestionnaire email configured")
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
      if (result?.error) {
        setError(result.error)
      }
      // On success, createThreadAction calls redirect() — the page navigates automatically
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
              <h2 id="new-thread-title" className="font-serif text-2xl text-garrigue-900 font-light italic">
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
                  placeholder="Ex: Question sur ma réservation de juillet"
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

- [ ] **Step 4: Update `apps/portal/app/(protected)/messagerie/page.tsx`**

Read the file. Add a "Nouveau message" button in the header and wire `NewThreadDialog`.

Replace entirely with:

```tsx
"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

// NOTE: this page cannot be a pure server component because it uses the
// NewThreadDialog (client). We keep data-fetching simple: threads are passed
// via the server component wrapper below and rendered here.
```

Wait — this approach would require converting the page to a client component, which would break the server-side `getOwnerThreads` call. Instead, keep the page as a server component and use a **separate client wrapper** just for the button + dialog.

Replace Step 4 with the correct approach:

- [ ] **Step 4: Create `apps/portal/components/messagerie/new-thread-button.tsx`** (client wrapper for the button + dialog)

```tsx
"use client"

import { useState, useCallback } from "react"
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

- [ ] **Step 5: Update `apps/portal/app/(protected)/messagerie/page.tsx`**

Read the file. Add the import for `NewThreadButton` and insert it in the page header.

Replace entirely with:

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
                {/* Contact name */}
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

- [ ] **Step 7: Final build + push**

```bash
cd C:/Developpement/conciergerie && pnpm turbo build --filter=@conciergerie/portal 2>&1 | tail -20
```

Expected: build success.

```bash
cd C:/Developpement/conciergerie
git add apps/portal/lib/dal/messagerie.ts "apps/portal/app/(protected)/messagerie/actions.ts" apps/portal/components/messagerie/ "apps/portal/app/(protected)/messagerie/page.tsx"
git commit -m "feat(portal): new thread dialog + create thread server action"
git push
```

---

## Self-Review

### Spec coverage
- [x] Documents: mandate/booking docs visible — `OR` clause in DAL (Task 1)
- [x] Documents: download no longer returns "Accès refusé" for null owner_id — `getOwnerDocument` replaces inline check (Task 1)
- [x] CRG PDF: `/api/pdf/crg/[id]` route in portal with owner verification (Task 2)
- [x] CRG PDF: download icon always visible (not gated on document_id) (Task 2)
- [x] Unread badge: sidebar nav shows count on Messages (Task 3)
- [x] Unread badge: bottom nav shows count on Messages (Task 3)
- [x] New thread: "Nouveau message" button on messagerie page (Task 4)
- [x] New thread: Framer Motion dialog with sujet + message (Task 4)
- [x] New thread: server action creates thread + first message atomically (Task 4)
- [x] New thread: redirects to thread after creation (Task 4)
- [x] New thread: sends notification email to gestionnaire (Task 4)

### Placeholder scan
No TBD, TODO, or similar patterns. All code blocks are complete.

### Type consistency
- `getOwnerDocument` defined in Task 1 documents.ts, imported in Task 1 actions.ts ✓
- `getOwnerReportForPdf` defined in Task 2 crg.ts, imported in Task 2 route.ts ✓
- `CrgReportData` defined in crg-template.tsx, used in route.ts via `getOwnerReportForPdf` return type ✓
- `getOwnerUnreadCount` defined in Task 3 messagerie.ts, imported in layout.tsx ✓
- `unreadCount: number` prop added to both `SidebarNavProps` and `BottomNavProps` ✓
- `createOwnerThread` defined in Task 4 messagerie.ts, imported in actions.ts ✓
- `createThreadAction` defined in actions.ts, imported in new-thread-dialog.tsx via `@/app/(protected)/messagerie/actions` ✓

### Key architectural notes
- Task 2: `RevenusTable` has `document_id` in its `Report` interface — this is removed since the download is now always available. `getOwnerReports` in the DAL returns the full `ManagementReport` which includes `document_id` but the component no longer needs it.
- Task 3: `unreadCount` is fetched once in the layout server component on every page load. This is a single lightweight `db.message.count()` — acceptable overhead.
- Task 4: `NewThreadDialog` imports `createThreadAction` directly. The `redirect()` call inside a server action navigates the user to the new thread — this is Next.js behavior, no additional client-side handling needed.
