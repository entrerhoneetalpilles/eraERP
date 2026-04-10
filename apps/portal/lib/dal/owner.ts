import { db } from "@conciergerie/db"

export async function getOwnerWithAccount(ownerId: string) {
  return db.owner.findUnique({
    where: { id: ownerId },
    include: {
      mandantAccount: {
        include: {
          reports: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      mandates: {
        where: { statut: "ACTIF" },
        select: { id: true, property_id: true },
      },
      feeInvoices: {
        where: { statut: "EMISE" },
        select: { id: true, montant_ttc: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      documents: {
        where: {
          date_expiration: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          entity_type: { not: "message" },
        },
        select: { id: true, nom: true, date_expiration: true },
      },
    },
  })
}
