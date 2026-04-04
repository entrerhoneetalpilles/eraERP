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
