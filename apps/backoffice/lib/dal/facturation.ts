import { db } from "@conciergerie/db"

export type InvoiceStatut = "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"

export async function getFeeInvoices(filters?: {
  owner_id?: string
  statut?: InvoiceStatut
  date_from?: Date
  date_to?: Date
}) {
  return db.feeInvoice.findMany({
    where: {
      ...(filters?.owner_id ? { owner_id: filters.owner_id } : {}),
      ...(filters?.statut ? { statut: filters.statut } : {}),
      ...(filters?.date_from || filters?.date_to
        ? {
            createdAt: {
              ...(filters?.date_from ? { gte: filters.date_from } : {}),
              ...(filters?.date_to ? { lte: filters.date_to } : {}),
            },
          }
        : {}),
    },
    include: {
      owner: { select: { id: true, nom: true, email: true } },
      lineItems: { orderBy: { ordre: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getFeeInvoiceById(id: string) {
  return db.feeInvoice.findUnique({
    where: { id },
    include: {
      owner: true,
      timeEntries: { orderBy: { date: "desc" } },
      lineItems: { orderBy: { ordre: "asc" } },
    },
  })
}

export async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.feeInvoice.count({
    where: { numero_facture: { startsWith: `F-${year}-` } },
  })
  return `F-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function getInvoiceStats() {
  const now = new Date()
  const invoices = await db.feeInvoice.findMany({
    select: {
      statut: true,
      montant_ht: true,
      montant_ttc: true,
      date_echeance: true,
      createdAt: true,
    },
  })

  const emises = invoices.filter((i) => i.statut === "EMISE")
  const overdueInvoices = emises.filter(
    (i) => i.date_echeance && new Date(i.date_echeance) < now
  )

  const aging = {
    normal: emises.filter(
      (i) => !i.date_echeance || new Date(i.date_echeance) >= now
    ).length,
    warning: overdueInvoices.filter((i) => {
      const days = (now.getTime() - new Date(i.date_echeance!).getTime()) / 86400000
      return days < 30
    }).length,
    critical: overdueInvoices.filter((i) => {
      const days = (now.getTime() - new Date(i.date_echeance!).getTime()) / 86400000
      return days >= 30
    }).length,
  }

  return {
    totalTTC: invoices.reduce((s, i) => s + i.montant_ttc, 0),
    totalHT: invoices.reduce((s, i) => s + i.montant_ht, 0),
    totalPaye: invoices.filter((i) => i.statut === "PAYEE").reduce((s, i) => s + i.montant_ttc, 0),
    totalEmis: emises.reduce((s, i) => s + i.montant_ttc, 0),
    overdueAmount: overdueInvoices.reduce((s, i) => s + i.montant_ttc, 0),
    countBrouillon: invoices.filter((i) => i.statut === "BROUILLON").length,
    countEmis: emises.length,
    countPaye: invoices.filter((i) => i.statut === "PAYEE").length,
    countOverdue: overdueInvoices.length,
    aging,
  }
}

export interface LineItemInput {
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  montant_ht: number
  tva_rate: number
  ordre: number
}

export async function createFeeInvoice(data: {
  owner_id: string
  objet?: string
  periode_debut: Date
  periode_fin: Date
  montant_ht: number
  tva_rate: number
  montant_ttc: number
  remise_pourcent?: number
  date_echeance?: Date
  notes?: string
  notes_client?: string
  lineItems?: LineItemInput[]
}) {
  const { lineItems, ...invoiceData } = data
  const numero_facture = await getNextInvoiceNumber()

  return db.feeInvoice.create({
    data: {
      ...invoiceData,
      numero_facture,
      statut: "BROUILLON",
      ...(lineItems && lineItems.length > 0
        ? { lineItems: { create: lineItems } }
        : {}),
    },
    include: { lineItems: true },
  })
}

export async function updateInvoiceStatut(id: string, statut: InvoiceStatut) {
  return db.feeInvoice.update({ where: { id }, data: { statut } })
}

export async function recordPayment(
  id: string,
  payment: {
    date_paiement: Date
    mode_paiement: string
    reference_paiement?: string
  }
) {
  return db.feeInvoice.update({
    where: { id },
    data: { ...payment, statut: "PAYEE" },
  })
}

export async function updateInvoiceNotes(
  id: string,
  notes: { notes?: string; notes_client?: string }
) {
  return db.feeInvoice.update({ where: { id }, data: notes })
}

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

export async function duplicateFeeInvoice(id: string) {
  const source = await getFeeInvoiceById(id)
  if (!source) throw new Error("Invoice not found")

  const numero_facture = await getNextInvoiceNumber()
  return db.feeInvoice.create({
    data: {
      owner_id: source.owner_id,
      objet: source.objet ? `${source.objet} (copie)` : undefined,
      numero_facture,
      periode_debut: source.periode_debut,
      periode_fin: source.periode_fin,
      montant_ht: source.montant_ht,
      tva_rate: source.tva_rate,
      montant_ttc: source.montant_ttc,
      remise_pourcent: source.remise_pourcent ?? undefined,
      notes_client: source.notes_client ?? undefined,
      statut: "BROUILLON",
      ...(source.lineItems.length > 0
        ? {
            lineItems: {
              create: source.lineItems.map((l) => ({
                description: l.description,
                quantite: l.quantite,
                unite: l.unite,
                prix_unitaire: l.prix_unitaire,
                montant_ht: l.montant_ht,
                tva_rate: l.tva_rate,
                ordre: l.ordre,
              })),
            },
          }
        : {}),
    },
  })
}
