# Infrastructure Transversale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter génération PDF (factures + CRG), upload photos S3, cron jobs automatiques (auto-CRG, relances factures, instructions check-in), et pagination aux listes volumineuses.

**Architecture:** Réutilise `@react-pdf/renderer` (déjà présent), `packages/storage` (S3/MinIO), `packages/email` (Resend + React Email) — tout est déjà bootstrappé. Les 3 crons Vercel tournent via des routes API sécurisées par `CRON_SECRET`. La pagination est ajoutée aux fonctions DAL les plus critiques avec un paramètre `limit` optionnel.

**Tech Stack:** Next.js 14 App Router, @react-pdf/renderer, @aws-sdk/client-s3, Resend, Prisma/PostgreSQL, Vercel Cron

---

## File Map

**Nouveaux fichiers :**
- `packages/db/prisma/migrations/20260409_infrastructure_transversale/migration.sql`
- `apps/backoffice/lib/pdf/invoice-template.tsx`
- `apps/backoffice/lib/pdf/crg-template.tsx`
- `apps/backoffice/app/api/pdf/facture/[id]/route.ts`
- `apps/backoffice/app/api/pdf/crg/[id]/route.ts`
- `apps/backoffice/app/api/upload/menage/[id]/route.ts`
- `apps/backoffice/app/api/upload/travaux/[id]/route.ts`
- `apps/backoffice/app/api/cron/auto-crg/route.ts`
- `apps/backoffice/app/api/cron/invoice-reminders/route.ts`
- `apps/backoffice/app/api/cron/checkin-instructions/route.ts`
- `vercel.json`

**Fichiers modifiés :**
- `packages/db/prisma/schema.prisma` — 2 ajouts (Booking + FeeInvoice)
- `apps/backoffice/lib/dal/crg.ts` — +`getManagementReportById`
- `apps/backoffice/lib/dal/facturation.ts` — +`updateDerniereRelance`, +`getOverdueInvoices`
- `apps/backoffice/lib/dal/bookings.ts` — +`getBookingsForCheckin`, +`markInstructionsEnvoyees`
- `apps/backoffice/lib/dal/menage.ts` — +`limit` param sur `getCleaningTasks`
- `apps/backoffice/lib/dal/travaux.ts` — +`limit` param sur `getWorkOrders`
- `apps/backoffice/lib/dal/guests.ts` — +`limit` param sur `getGuests`

---

### Task 1: DB Schema — 2 nouveaux champs

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260409_infrastructure_transversale/migration.sql`

- [ ] **Step 1: Modifier schema.prisma — ajouter `instructions_envoyees` sur Booking**

Dans `packages/db/prisma/schema.prisma`, trouver `model Booking {` et ajouter le champ avant `@@map` :

```prisma
  instructions_envoyees   Boolean   @default(false)
```

Le bloc Booking doit ressembler à ceci dans sa fin :
```prisma
  notes_internes          String?
  instructions_envoyees   Boolean   @default(false)
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
```

- [ ] **Step 2: Modifier schema.prisma — ajouter `derniere_relance` et `nb_relances` sur FeeInvoice**

Dans `model FeeInvoice {`, ajouter avant `createdAt` :
```prisma
  derniere_relance   DateTime?
  nb_relances        Int       @default(0)
```

- [ ] **Step 3: Créer le fichier de migration SQL**

Créer `packages/db/prisma/migrations/20260409_infrastructure_transversale/migration.sql` :

```sql
-- AlterTable: Booking — tracking envoi instructions check-in
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "instructions_envoyees" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: FeeInvoice — tracking relances
ALTER TABLE "fee_invoices" ADD COLUMN IF NOT EXISTS "derniere_relance" TIMESTAMP(3);
ALTER TABLE "fee_invoices" ADD COLUMN IF NOT EXISTS "nb_relances" INTEGER NOT NULL DEFAULT 0;
```

- [ ] **Step 4: Régénérer le client Prisma**

```bash
pnpm --filter @conciergerie/db db:generate
```

Expected output: `✔ Generated Prisma Client` (sans erreur TypeScript)

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/
git commit -m "feat(db): add instructions_envoyees on Booking, derniere_relance+nb_relances on FeeInvoice"
```

---

### Task 2: DAL — nouvelles fonctions

**Files:**
- Modify: `apps/backoffice/lib/dal/crg.ts`
- Modify: `apps/backoffice/lib/dal/facturation.ts`
- Modify: `apps/backoffice/lib/dal/bookings.ts`

- [ ] **Step 1: Ajouter `getManagementReportById` dans crg.ts**

Ajouter à la fin de `apps/backoffice/lib/dal/crg.ts` :

```typescript
export async function getManagementReportById(id: string) {
  return db.managementReport.findUnique({
    where: { id },
    include: {
      account: {
        include: {
          owner: {
            select: {
              id: true,
              nom: true,
              email: true,
              type: true,
            },
          },
        },
      },
    },
  })
}

export async function getMandatesWithActiveBookings(periodeDebut: Date, periodeFin: Date) {
  return db.mandate.findMany({
    where: {
      statut: "ACTIF",
      property: {
        bookings: {
          some: {
            statut: "CHECKEDOUT",
            check_out: { gte: periodeDebut, lte: periodeFin },
          },
        },
      },
    },
    select: { owner_id: true },
  })
}
```

- [ ] **Step 2: Ajouter `updateDerniereRelance` et `getOverdueInvoices` dans facturation.ts**

Ajouter à la fin de `apps/backoffice/lib/dal/facturation.ts` :

```typescript
export async function getOverdueInvoices() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return db.feeInvoice.findMany({
    where: {
      statut: "EMISE",
      date_echeance: { lt: now },
      nb_relances: { lt: 3 },
      OR: [
        { derniere_relance: null },
        { derniere_relance: { lt: sevenDaysAgo } },
      ],
    },
    include: {
      owner: { select: { id: true, nom: true, email: true } },
    },
    orderBy: { date_echeance: "asc" },
  })
}

export async function updateDerniereRelance(id: string) {
  return db.feeInvoice.update({
    where: { id },
    data: {
      derniere_relance: new Date(),
      nb_relances: { increment: 1 },
    },
  })
}
```

- [ ] **Step 3: Ajouter `getBookingsForCheckin` et `markInstructionsEnvoyees` dans bookings.ts**

Ajouter à la fin de `apps/backoffice/lib/dal/bookings.ts` :

```typescript
export async function getBookingsForCheckin() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  return db.booking.findMany({
    where: {
      statut: "CONFIRMED",
      instructions_envoyees: false,
      check_in: { gte: tomorrow, lt: dayAfter },
    },
    include: {
      guest: { select: { id: true, prenom: true, nom: true, email: true } },
      property: {
        include: {
          access: true,
        },
        select: {
          id: true,
          nom: true,
          access: true,
        },
      },
    },
  })
}

export async function markInstructionsEnvoyees(id: string) {
  return db.booking.update({
    where: { id },
    data: { instructions_envoyees: true },
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/backoffice/lib/dal/crg.ts apps/backoffice/lib/dal/facturation.ts apps/backoffice/lib/dal/bookings.ts
git commit -m "feat(dal): getManagementReportById, getOverdueInvoices, getBookingsForCheckin"
```

---

### Task 3: InvoicePDF template

**Files:**
- Create: `apps/backoffice/lib/pdf/invoice-template.tsx`

- [ ] **Step 1: Créer le template**

Créer `apps/backoffice/lib/pdf/invoice-template.tsx` :

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { getFeeInvoiceById } from "@/lib/dal/facturation"

type InvoiceData = NonNullable<Awaited<ReturnType<typeof getFeeInvoiceById>>>

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  success: "#059669",
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
  companyTagline: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
  },
  invoiceRef: {
    fontSize: 10,
    color: colors.accent,
    textAlign: "right",
    marginTop: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoBlock: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: colors.text,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: colors.light,
  },
  colDescription: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colUnit: { width: 50, textAlign: "right" },
  colPU: { width: 60, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  tableCell: {
    fontSize: 8.5,
    color: colors.text,
  },
  totalsBlock: {
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: colors.muted,
  },
  totalsValue: {
    fontSize: 8.5,
    color: colors.text,
    fontFamily: "Helvetica-Bold",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  totalsFinalLabel: {
    fontSize: 10,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  totalsFinalValue: {
    fontSize: 10,
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
  },
  paymentBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  paymentLabel: {
    fontSize: 8,
    color: colors.success,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  notesBlock: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.light,
    borderRadius: 3,
  },
  notesText: {
    fontSize: 8,
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
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
  paid: {
    position: "absolute",
    top: 80,
    right: 40,
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: colors.success,
    opacity: 0.12,
    transform: "rotate(-25deg)",
  },
})

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  const isPaid = invoice.statut === "PAYEE"
  const tva = invoice.montant_ht * invoice.tva_rate
  const periode = `${fmtDate(invoice.periode_debut)} — ${fmtDate(invoice.periode_fin)}`

  return (
    <Document title={`Facture ${invoice.numero_facture}`}>
      <Page size="A4" style={S.page}>
        {isPaid && <Text style={S.paid}>PAYÉE</Text>}

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
          </View>
          <View>
            <Text style={S.invoiceTitle}>FACTURE</Text>
            <Text style={S.invoiceRef}>N° {invoice.numero_facture}</Text>
          </View>
        </View>

        {/* Info bloc */}
        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Facturé à</Text>
            <Text style={S.infoValue}>{invoice.owner.nom}</Text>
            <Text style={S.tableCell}>{invoice.owner.email}</Text>
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Détails</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={S.infoLabel}>Date d'émission</Text>
              <Text style={S.tableCell}>{fmtDate(invoice.createdAt)}</Text>
            </View>
            {invoice.date_echeance && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={S.infoLabel}>Échéance</Text>
                <Text style={S.tableCell}>{fmtDate(invoice.date_echeance)}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={S.infoLabel}>Période</Text>
              <Text style={S.tableCell}>{periode}</Text>
            </View>
          </View>
        </View>

        {/* Objet */}
        {invoice.objet && (
          <View style={[S.section, { marginBottom: 8 }]}>
            <Text style={S.sectionTitle}>Objet</Text>
            <Text style={S.tableCell}>{invoice.objet}</Text>
          </View>
        )}

        {/* Table lignes */}
        <View style={S.table}>
          <Text style={S.sectionTitle}>Détail des prestations</Text>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderText, S.colDescription]}>Description</Text>
            <Text style={[S.tableHeaderText, S.colQty]}>Qté</Text>
            <Text style={[S.tableHeaderText, S.colUnit]}>Unité</Text>
            <Text style={[S.tableHeaderText, S.colPU]}>PU HT</Text>
            <Text style={[S.tableHeaderText, S.colTotal]}>Total HT</Text>
          </View>
          {invoice.lineItems.map((line, i) => (
            <View key={line.id} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCell, S.colDescription]}>{line.description}</Text>
              <Text style={[S.tableCell, S.colQty]}>{line.quantite}</Text>
              <Text style={[S.tableCell, S.colUnit]}>{line.unite}</Text>
              <Text style={[S.tableCell, S.colPU]}>{fmt(line.prix_unitaire)}</Text>
              <Text style={[S.tableCell, S.colTotal]}>{fmt(line.montant_ht)}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={S.totalsBlock}>
          {invoice.remise_pourcent && (
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Remise ({invoice.remise_pourcent}%)</Text>
              <Text style={S.totalsValue}>
                -{fmt(invoice.montant_ht * (invoice.remise_pourcent / 100))}
              </Text>
            </View>
          )}
          <View style={S.totalsRow}>
            <Text style={S.totalsLabel}>Sous-total HT</Text>
            <Text style={S.totalsValue}>{fmt(invoice.montant_ht)}</Text>
          </View>
          <View style={S.totalsRow}>
            <Text style={S.totalsLabel}>TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</Text>
            <Text style={S.totalsValue}>{fmt(tva)}</Text>
          </View>
          <View style={S.totalsFinalRow}>
            <Text style={S.totalsFinalLabel}>TOTAL TTC</Text>
            <Text style={S.totalsFinalValue}>{fmt(invoice.montant_ttc)}</Text>
          </View>
        </View>

        {/* Paiement */}
        {isPaid && invoice.date_paiement && (
          <View style={S.paymentBlock}>
            <Text style={S.paymentLabel}>Paiement reçu</Text>
            <Text style={S.tableCell}>
              {fmtDate(invoice.date_paiement)}
              {invoice.mode_paiement ? ` — ${invoice.mode_paiement}` : ""}
              {invoice.reference_paiement ? ` (réf. ${invoice.reference_paiement})` : ""}
            </Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes_client && (
          <View style={S.notesBlock}>
            <Text style={[S.notesText, { fontFamily: "Helvetica-Bold", marginBottom: 3 }]}>Note</Text>
            <Text style={S.notesText}>{invoice.notes_client}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — Gestion locative</Text>
          <Text style={S.footerText}>{invoice.numero_facture}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backoffice/lib/pdf/invoice-template.tsx
git commit -m "feat(pdf): InvoicePDF template avec lignes, totaux, badge PAYÉE"
```

---

### Task 4: CrgPDF template

**Files:**
- Create: `apps/backoffice/lib/pdf/crg-template.tsx`

- [ ] **Step 1: Créer le template**

Créer `apps/backoffice/lib/pdf/crg-template.tsx` :

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { getManagementReportById } from "@/lib/dal/crg"

type CrgData = NonNullable<Awaited<ReturnType<typeof getManagementReportById>>>

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

export function CrgPDF({ report }: { report: CrgData }) {
  const owner = report.account.owner
  const periode = `${fmtDate(report.periode_debut)} — ${fmtDate(report.periode_fin)}`
  const soldeAvant = report.account.solde_courant + report.montant_reverse
  const soldeApres = report.account.solde_courant

  return (
    <Document title={`CRG ${fmtMonth(report.periode_debut)} — ${owner.nom}`}>
      <Page size="A4" style={S.page}>
        {/* Header */}
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

        {/* Infos propriétaire + période */}
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

        {/* Recettes */}
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

        {/* Déductions */}
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

        {/* Virement net */}
        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Montant à reverser</Text>
          <Text style={S.summaryAmount}>{fmt(report.montant_reverse)}</Text>
          <Text style={S.summaryNote}>
            Solde compte mandant : {fmt(soldeAvant)} → {fmt(soldeApres)} après reversement
          </Text>
        </View>

        {/* Virement effectué */}
        {report.date_virement && (
          <View style={S.virementsBox}>
            <Text style={S.virementsLabel}>Virement effectué</Text>
            <Text style={{ fontSize: 8.5 }}>
              {fmt(report.montant_reverse)} le {fmtDate(report.date_virement)}
            </Text>
          </View>
        )}

        {/* Mention légale */}
        <Text style={S.legalText}>
          Ce compte-rendu de gestion est établi conformément à la loi Hoguet n°70-9 du 2 janvier 1970
          et au décret n°72-678 du 20 juillet 1972. Les sommes ci-dessus correspondent aux encaissements
          et décaissements effectués pour votre compte mandant sur la période indiquée.
        </Text>

        {/* Footer */}
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

- [ ] **Step 2: Commit**

```bash
git add apps/backoffice/lib/pdf/crg-template.tsx
git commit -m "feat(pdf): CrgPDF template avec recettes, déductions, virement net, mention Hoguet"
```

---

### Task 5: PDF API routes

**Files:**
- Create: `apps/backoffice/app/api/pdf/facture/[id]/route.ts`
- Create: `apps/backoffice/app/api/pdf/crg/[id]/route.ts`

- [ ] **Step 1: Créer la route `/api/pdf/facture/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { InvoicePDF } from "@/lib/pdf/invoice-template"
import { auth } from "@/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) return new NextResponse("Facture introuvable", { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(InvoicePDF, { invoice }) as any
  const buffer = await renderToBuffer(element)

  const filename = `Facture-${invoice.numero_facture}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
```

- [ ] **Step 2: Créer la route `/api/pdf/crg/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { getManagementReportById } from "@/lib/dal/crg"
import { CrgPDF } from "@/lib/pdf/crg-template"
import { auth } from "@/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const report = await getManagementReportById(params.id)
  if (!report) return new NextResponse("CRG introuvable", { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CrgPDF, { report }) as any
  const buffer = await renderToBuffer(element)

  const owner = report.account.owner
  const mois = new Date(report.periode_debut).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })
  const filename = `CRG-${mois}-${owner.nom.replace(/\s+/g, "-")}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
```

- [ ] **Step 3: Tester manuellement**

Naviguer vers `/api/pdf/facture/<id-valide>` dans le navigateur — le PDF doit s'afficher inline.
Naviguer vers `/api/pdf/crg/<id-valide>` — même vérification.

- [ ] **Step 4: Ajouter bouton "Télécharger PDF" sur la page facturation/[id]**

Dans `apps/backoffice/app/(protected)/facturation/[id]/page.tsx`, ajouter dans les actions du header :

```tsx
<a
  href={`/api/pdf/facture/${invoice.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
>
  <FileDown className="w-4 h-4" />
  PDF
</a>
```

Ajouter `FileDown` aux imports Lucide.

- [ ] **Step 5: Ajouter bouton PDF sur la page crg/[id] ou crg/page.tsx**

Dans `apps/backoffice/app/(protected)/crg/page.tsx` (ou `[id]` si elle existe), ajouter un lien PDF pour chaque rapport dans la table :

```tsx
<a
  href={`/api/pdf/crg/${report.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs text-primary hover:underline"
>
  PDF
</a>
```

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/app/api/pdf/ apps/backoffice/app/\(protected\)/facturation/ apps/backoffice/app/\(protected\)/crg/
git commit -m "feat(api): routes PDF facture et CRG + boutons téléchargement dans les pages"
```

---

### Task 6: Upload API routes (photos ménage + travaux)

**Files:**
- Create: `apps/backoffice/app/api/upload/menage/[id]/route.ts`
- Create: `apps/backoffice/app/api/upload/travaux/[id]/route.ts`

- [ ] **Step 1: Créer la route upload ménage**

Créer `apps/backoffice/app/api/upload/menage/[id]/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { uploadFile, buildStorageKey, getPublicUrl } from "@conciergerie/storage"
import { db } from "@conciergerie/db"
import { auth } from "@/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })

  const task = await db.cleaningTask.findUnique({ where: { id: params.id }, select: { id: true, photos: true } })
  if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${Date.now()}.${ext}`
  const key = buildStorageKey({ entityType: "photos", entityId: `menage/${params.id}`, fileName })

  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadFile({ key, body: buffer, contentType: file.type })
  const url = getPublicUrl(key)

  await db.cleaningTask.update({
    where: { id: params.id },
    data: { photos: { push: url } },
  })

  return NextResponse.json({ url })
}
```

- [ ] **Step 2: Créer la route upload travaux**

Créer `apps/backoffice/app/api/upload/travaux/[id]/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { uploadFile, buildStorageKey, getPublicUrl } from "@conciergerie/storage"
import { db } from "@conciergerie/db"
import { auth } from "@/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })

  const order = await db.workOrder.findUnique({ where: { id: params.id }, select: { id: true, photos: true } })
  if (!order) return NextResponse.json({ error: "Ordre introuvable" }, { status: 404 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${Date.now()}.${ext}`
  const key = buildStorageKey({ entityType: "photos", entityId: `travaux/${params.id}`, fileName })

  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadFile({ key, body: buffer, contentType: file.type })
  const url = getPublicUrl(key)

  await db.workOrder.update({
    where: { id: params.id },
    data: { photos: { push: url } },
  })

  return NextResponse.json({ url })
}
```

- [ ] **Step 3: Ajouter le composant upload dans la page ménage/[id]**

Dans `apps/backoffice/app/(protected)/menage/[id]/page.tsx`, dans la section photos, ajouter avant ou après la grille de photos existante :

```tsx
{/* Upload photos */}
<form
  action={`/api/upload/menage/${task.id}`}
  method="POST"
  encType="multipart/form-data"
  className="mt-3"
>
  <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
    <Upload className="w-4 h-4 text-muted-foreground" />
    <span className="text-muted-foreground">Ajouter une photo</span>
    <input
      type="file"
      name="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={(e) => e.target.form?.submit()}
    />
  </label>
</form>
```

Ajouter `Upload` aux imports Lucide. Ce composant soumet le form à la route API et recharge la page via la navigation normale.

- [ ] **Step 4: Ajouter le composant upload dans la page travaux/[id]**

Même pattern dans `apps/backoffice/app/(protected)/travaux/[id]/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/app/api/upload/ apps/backoffice/app/\(protected\)/menage/ apps/backoffice/app/\(protected\)/travaux/
git commit -m "feat(api): upload photos S3 pour ménage et travaux"
```

---

### Task 7: vercel.json + cron auto-CRG

**Files:**
- Create: `vercel.json`
- Create: `apps/backoffice/app/api/cron/auto-crg/route.ts`

- [ ] **Step 1: Créer `vercel.json` à la racine du monorepo**

Créer `C:/Developpement/conciergerie/vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-crg",
      "schedule": "0 8 1 * *"
    },
    {
      "path": "/api/cron/invoice-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/checkin-instructions",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Note: Vercel Cron envoie automatiquement `Authorization: Bearer <CRON_SECRET>` depuis la variable d'env `CRON_SECRET` configurée dans le dashboard Vercel.

- [ ] **Step 2: Ajouter `CRON_SECRET` dans `turbo.json` globalEnv**

Dans `turbo.json`, ajouter `"CRON_SECRET"` dans le tableau `globalEnv`.

- [ ] **Step 3: Créer la route auto-CRG**

Créer `apps/backoffice/app/api/cron/auto-crg/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { generateCrg, getMandatesWithActiveBookings } from "@/lib/dal/crg"
import { sendCrgMensuelEmail } from "@conciergerie/email"
import { db } from "@conciergerie/db"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const now = new Date()
  const periodeDebut = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const periodeFin = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const mandates = await getMandatesWithActiveBookings(periodeDebut, periodeFin)

  let success = 0
  let skipped = 0
  let errors = 0
  const errorDetails: string[] = []

  for (const { owner_id } of mandates) {
    try {
      const report = await generateCrg({ owner_id, periode_debut: periodeDebut, periode_fin: periodeFin })

      // Récupérer infos pour email
      const owner = await db.owner.findUnique({
        where: { id: owner_id },
        select: { nom: true, email: true },
      })
      if (owner?.email) {
        const mois = periodeDebut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        await sendCrgMensuelEmail({
          to: owner.email,
          ownerName: owner.nom,
          periode: mois,
          revenusBruts: report.revenus_sejours.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          fraisGestion: report.honoraires_deduits.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          autresCharges: report.charges_deduites.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          revenuNet: report.montant_reverse.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
        })
      }

      await db.auditLog.create({
        data: {
          action: "CRG_AUTO_GENERATED",
          entity_type: "ManagementReport",
          entity_id: report.id,
        },
      })

      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("existe déjà")) {
        skipped++
      } else {
        errors++
        errorDetails.push(`owner_id=${owner_id}: ${msg}`)
      }
    }
  }

  return NextResponse.json({ success, skipped, errors, errorDetails })
}
```

- [ ] **Step 4: Ajouter `PORTAL_URL` dans `turbo.json` globalEnv**

Ajouter `"PORTAL_URL"` dans le tableau `globalEnv` de `turbo.json`.

- [ ] **Step 5: Commit**

```bash
git add vercel.json turbo.json apps/backoffice/app/api/cron/auto-crg/
git commit -m "feat(cron): vercel.json + auto-CRG mensuel avec email propriétaire"
```

---

### Task 8: Cron invoice-reminders

**Files:**
- Create: `apps/backoffice/app/api/cron/invoice-reminders/route.ts`

- [ ] **Step 1: Créer la route**

Créer `apps/backoffice/app/api/cron/invoice-reminders/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getOverdueInvoices, updateDerniereRelance } from "@/lib/dal/facturation"
import { sendFactureEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const invoices = await getOverdueInvoices()

  let sent = 0
  let errors = 0

  for (const invoice of invoices) {
    try {
      const now = new Date()
      const echeance = new Date(invoice.date_echeance!)
      const overdueDays = Math.floor((now.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24))

      const relanceLabel =
        overdueDays >= 30 ? "3e relance (J+30)" :
        overdueDays >= 14 ? "2e relance (J+14)" :
        "1ère relance (J+7)"

      await sendFactureEmail({
        to: invoice.owner.email,
        ownerName: invoice.owner.nom,
        numeroFacture: invoice.numero_facture,
        periode: `${new Date(invoice.periode_debut).toLocaleDateString("fr-FR")} — ${new Date(invoice.periode_fin).toLocaleDateString("fr-FR")}`,
        montantHT: invoice.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
        montantTTC: invoice.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
        portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })

      await updateDerniereRelance(invoice.id)

      sent++
      console.log(`[invoice-reminders] ${relanceLabel} envoyée pour ${invoice.numero_facture} → ${invoice.owner.email}`)
    } catch (err) {
      errors++
      console.error(`[invoice-reminders] Erreur facture ${invoice.id}:`, err)
    }
  }

  return NextResponse.json({ sent, errors, total: invoices.length })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backoffice/app/api/cron/invoice-reminders/
git commit -m "feat(cron): relances automatiques factures impayées (J+7, J+14, J+30)"
```

---

### Task 9: Cron checkin-instructions

**Files:**
- Create: `apps/backoffice/app/api/cron/checkin-instructions/route.ts`

- [ ] **Step 1: Créer la route**

Créer `apps/backoffice/app/api/cron/checkin-instructions/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getBookingsForCheckin, markInstructionsEnvoyees } from "@/lib/dal/bookings"
import { sendAccessCodesEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const bookings = await getBookingsForCheckin()

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const booking of bookings) {
    const guestEmail = booking.guest.email
    if (!guestEmail) {
      skipped++
      continue
    }

    try {
      const access = booking.property.access
      const checkInFormatted = new Date(booking.check_in).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      const checkOutFormatted = new Date(booking.check_out).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      await sendAccessCodesEmail({
        to: guestEmail,
        guestName: `${booking.guest.prenom} ${booking.guest.nom}`,
        propertyName: booking.property.nom,
        checkIn: checkInFormatted,
        checkOut: checkOutFormatted,
        typeAcces: access?.type_acces ?? "Manuel",
        codeAcces: access?.code_acces ?? null,
        instructionsArrivee: access?.instructions_arrivee ?? null,
        wifiNom: access?.wifi_nom ?? null,
        wifiMdp: access?.wifi_mdp ?? null,
      })

      await markInstructionsEnvoyees(booking.id)

      sent++
      console.log(`[checkin-instructions] Envoyé à ${guestEmail} pour réservation ${booking.id}`)
    } catch (err) {
      errors++
      console.error(`[checkin-instructions] Erreur réservation ${booking.id}:`, err)
    }
  }

  return NextResponse.json({ sent, skipped, errors, total: bookings.length })
}
```

- [ ] **Step 2: Vérifier que `sendAccessCodesEmail` accepte `wifi_nom` et `wifi_mdp`**

Dans `packages/email/src/render.ts`, vérifier que la signature de `sendAccessCodesEmail` inclut `wifiNom` et `wifiMdp`. Si les champs sont nommés différemment, adapter en conséquence.

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/app/api/cron/checkin-instructions/
git commit -m "feat(cron): envoi automatique instructions check-in J-1 aux voyageurs"
```

---

### Task 10: Pagination DAL — listes volumineuses

**Files:**
- Modify: `apps/backoffice/lib/dal/bookings.ts`
- Modify: `apps/backoffice/lib/dal/guests.ts`
- Modify: `apps/backoffice/lib/dal/travaux.ts`
- Modify: `apps/backoffice/lib/dal/menage.ts`

- [ ] **Step 1: Ajouter `limit` dans `getBookings`**

Dans `apps/backoffice/lib/dal/bookings.ts`, modifier `getBookings` :

```typescript
export async function getBookings(filters?: { property_id?: string; limit?: number }) {
  return db.booking.findMany({
    where: filters?.property_id ? { property_id: filters.property_id } : undefined,
    orderBy: { check_in: "desc" },
    take: filters?.limit ?? 100,
    include: {
      property: true,
      guest: true,
    },
  })
}
```

- [ ] **Step 2: Ajouter `limit` dans `getGuests`**

Dans `apps/backoffice/lib/dal/guests.ts`, modifier `getGuests` :

```typescript
export async function getGuests(limit = 100) {
  return db.guest.findMany({
    orderBy: { nb_sejours: "desc" },
    take: limit,
    include: {
      _count: { select: { bookings: true } },
    },
  })
}
```

- [ ] **Step 3: Ajouter `limit` dans `getWorkOrders`**

Dans `apps/backoffice/lib/dal/travaux.ts`, modifier `getWorkOrders` :

```typescript
export async function getWorkOrders(limit = 100) {
  return db.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      property: { select: { id: true, nom: true } },
      contractor: { select: { id: true, nom: true } },
    },
  })
}
```

- [ ] **Step 4: Ajouter `limit` dans `getCleaningTasks`**

Dans `apps/backoffice/lib/dal/menage.ts`, modifier `getCleaningTasks` :

```typescript
export async function getCleaningTasks(limit = 100) {
  return db.cleaningTask.findMany({
    orderBy: { date_prevue: "desc" },
    take: limit,
    include: {
      property: { select: { id: true, nom: true } },
      booking: { select: { id: true, check_in: true, check_out: true, guest: { select: { prenom: true, nom: true } } } },
      contractor: { select: { id: true, nom: true } },
    },
  })
}
```

- [ ] **Step 5: Vérifier que les pages appelantes compilent**

```bash
pnpm --filter @conciergerie/backoffice type-check
```

Expected: aucune erreur TypeScript.

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/lib/dal/bookings.ts apps/backoffice/lib/dal/guests.ts apps/backoffice/lib/dal/travaux.ts apps/backoffice/lib/dal/menage.ts
git commit -m "feat(dal): limite 100 par défaut sur getBookings, getGuests, getWorkOrders, getCleaningTasks"
```

---

### Task 11: Build final + push

- [ ] **Step 1: Build complet**

```bash
pnpm build
```

Expected: `✓ Compiled successfully` — aucune erreur TypeScript ni de module manquant.

Si erreur `Module not found: @conciergerie/email` dans les cron routes, vérifier que `@conciergerie/email` est dans les `dependencies` de `apps/backoffice/package.json`.

- [ ] **Step 2: Vérifier les variables d'env requises**

Dans le dashboard Vercel, s'assurer que ces variables sont configurées :
- `CRON_SECRET` — générer avec `openssl rand -base64 32`
- `PORTAL_URL` — URL publique du portail propriétaire
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` — déjà en place

- [ ] **Step 3: Push final**

```bash
git push
```

---

## Self-review

**Spec coverage :**
- [x] PDF factures — Task 3 + Task 5
- [x] PDF CRG — Task 4 + Task 5
- [x] Upload photos ménage/travaux — Task 6
- [x] Cron auto-CRG — Task 7
- [x] Cron relances factures — Task 8
- [x] Cron check-in instructions — Task 9
- [x] Pagination listes — Task 10
- [x] DB migrations — Task 1
- [x] DAL additions — Task 2
- [x] vercel.json — Task 7

**Types cohérents :**
- `InvoicePDF` reçoit `InvoiceData = NonNullable<Awaited<ReturnType<typeof getFeeInvoiceById>>>` — correspondance avec ce que retourne `getFeeInvoiceById`
- `CrgPDF` reçoit `CrgData = NonNullable<Awaited<ReturnType<typeof getManagementReportById>>>` — `getManagementReportById` défini dans Task 2
- `getBookingsForCheckin` retourne des bookings avec `property.access` et `guest` — utilisé tel quel dans Task 9
- `getOverdueInvoices` retourne `date_echeance!` (non-null) grâce au filtre `statut: "EMISE"` (toutes les factures émises doivent avoir une échéance — vérifier qu'elle est requise dans le formulaire de création)

**Placeholder scan :** aucun TODO/TBD trouvé — tous les blocs de code sont complets.
