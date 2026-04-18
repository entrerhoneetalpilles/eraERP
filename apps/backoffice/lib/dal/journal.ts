import { db } from "@conciergerie/db"

export async function getCompanyTransactions(filters?: {
  journal?: "VENTES" | "ACHATS" | "BANQUE" | "OD"
  lettree?: boolean
  dateFrom?: Date
  dateTo?: Date
}) {
  return db.companyTransaction.findMany({
    where: {
      ...(filters?.journal ? { journal: filters.journal } : {}),
      ...(filters?.lettree !== undefined ? { lettree: filters.lettree } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? { date: { ...(filters.dateFrom ? { gte: filters.dateFrom } : {}), ...(filters.dateTo ? { lte: filters.dateTo } : {}) } }
        : {}),
    },
    orderBy: { date: "desc" },
  })
}

export async function getJournalTotaux() {
  const [ventes, banque, nonLettrees] = await Promise.all([
    db.companyTransaction.aggregate({
      where: { journal: "VENTES" },
      _sum: { montant_ht: true, montant_ttc: true },
      _count: true,
    }),
    db.companyTransaction.aggregate({
      where: { journal: "BANQUE" },
      _sum: { montant_ttc: true },
      _count: true,
    }),
    db.companyTransaction.count({ where: { lettree: false } }),
  ])
  return {
    totalVentesHT: ventes._sum.montant_ht ?? 0,
    totalVentesTTC: ventes._sum.montant_ttc ?? 0,
    nbVentes: ventes._count,
    totalBanque: banque._sum.montant_ttc ?? 0,
    nbBanque: banque._count,
    nbNonLettrees: nonLettrees,
  }
}
