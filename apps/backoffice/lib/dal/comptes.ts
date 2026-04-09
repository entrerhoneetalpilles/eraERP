import { db } from "@conciergerie/db"

export async function getMandantAccounts() {
  const accounts = await db.mandantAccount.findMany({
    include: {
      owner: { select: { id: true, nom: true, email: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const totalSolde = accounts.reduce((s, a) => s + a.solde_courant, 0)
  const totalSequestre = accounts.reduce((s, a) => s + a.solde_sequestre, 0)
  return { accounts, totalSolde, totalSequestre }
}

export async function getMandantAccountById(id: string) {
  return db.mandantAccount.findUnique({
    where: { id },
    include: {
      owner: {
        include: {
          mandates: { where: { statut: "ACTIF" }, include: { property: { select: { nom: true } } } },
        },
      },
      transactions: {
        orderBy: { date: "desc" },
        take: 100,
        include: {
          booking: { select: { id: true, check_in: true, check_out: true, guest: { select: { prenom: true, nom: true } } } },
        },
      },
      reports: { orderBy: { createdAt: "desc" }, take: 24 },
    },
  })
}

export async function getMandantAccountKpis(id: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const [thisMonth, lastMonth, pending] = await Promise.all([
    db.transaction.aggregate({ where: { mandant_account_id: id, type: "REVENU_SEJOUR", date: { gte: monthStart } }, _sum: { montant: true } }),
    db.transaction.aggregate({ where: { mandant_account_id: id, type: "REVENU_SEJOUR", date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { montant: true } }),
    db.transaction.count({ where: { mandant_account_id: id, statut: "PENDING" } }),
  ])
  return {
    revenuCeMois: thisMonth._sum.montant ?? 0,
    revenuMoisPrecedent: lastMonth._sum.montant ?? 0,
    nbPending: pending,
  }
}

export async function getMandantAccountByOwnerId(owner_id: string) {
  return db.mandantAccount.findUnique({ where: { owner_id }, include: { owner: true } })
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
  await db.mandantAccount.update({ where: { id: data.mandant_account_id }, data: { solde_courant: { increment: data.montant } } })
  return tx
}

export async function exportTransactionsCsv(id: string) {
  const account = await db.mandantAccount.findUnique({
    where: { id },
    include: { owner: { select: { nom: true } }, transactions: { orderBy: { date: "desc" } } },
  })
  if (!account) return ""
  const rows = account.transactions.map(tx => [
    new Date(tx.date).toLocaleDateString("fr-FR"),
    tx.libelle, tx.type,
    tx.montant >= 0 ? tx.montant.toFixed(2).replace(".", ",") : "",
    tx.montant < 0 ? Math.abs(tx.montant).toFixed(2).replace(".", ",") : "",
    tx.statut,
  ])
  const headers = ["Date", "Libellé", "Type", "Débit", "Crédit", "Statut"]
  return [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n")
}
