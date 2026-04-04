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
  await db.mandantAccount.update({
    where: { id: data.mandant_account_id },
    data: { solde_courant: { increment: data.montant } },
  })
  return tx
}
