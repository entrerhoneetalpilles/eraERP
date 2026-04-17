import { db } from "@conciergerie/db"

export async function getOwnerFeeInvoices(ownerId: string) {
  return db.feeInvoice.findMany({
    where: {
      owner_id: ownerId,
      statut: { in: ["EMISE", "PAYEE"] },
    },
    select: {
      id: true,
      numero_facture: true,
      montant_ttc: true,
      statut: true,
      createdAt: true,
      date_echeance: true,
      objet: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOwnerFeeInvoiceForPdf(ownerId: string, invoiceId: string) {
  return db.feeInvoice.findFirst({
    where: { id: invoiceId, owner_id: ownerId },
    include: {
      owner: { select: { nom: true, email: true, telephone: true, adresse: true, nif: true } },
      lineItems: { orderBy: { ordre: "asc" } },
    },
  })
}
