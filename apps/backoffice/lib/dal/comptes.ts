import { db } from "@conciergerie/db"

export async function getComptabiliteList() {
  const now = new Date()
  const owners = await db.owner.findMany({
    include: {
      feeInvoices: {
        where: { statut: { not: "BROUILLON" } },
        select: {
          statut: true, montant_ht: true, montant_ttc: true,
          date_echeance: true, createdAt: true,
        },
      },
    },
    orderBy: { nom: "asc" },
  })

  const rows = owners.map(owner => {
    const inv = owner.feeInvoices
    const totalHT = inv.reduce((s, i) => s + i.montant_ht, 0)
    const encaisseTTC = inv.filter(i => i.statut === "PAYEE").reduce((s, i) => s + i.montant_ttc, 0)
    const emises = inv.filter(i => i.statut === "EMISE")
    const enAttenteTTC = emises.reduce((s, i) => s + i.montant_ttc, 0)
    const enRetardTTC = emises
      .filter(i => i.date_echeance && new Date(i.date_echeance) < now)
      .reduce((s, i) => s + i.montant_ttc, 0)
    return {
      id: owner.id,
      owner: { id: owner.id, nom: owner.nom, email: owner.email },
      totalHT,
      encaisseTTC,
      enAttenteTTC,
      enRetardTTC,
      nbFactures: inv.length,
      nbEnAttente: emises.length,
    }
  })

  const totaux = {
    totalHT: rows.reduce((s, r) => s + r.totalHT, 0),
    encaisseTTC: rows.reduce((s, r) => s + r.encaisseTTC, 0),
    enAttenteTTC: rows.reduce((s, r) => s + r.enAttenteTTC, 0),
    enRetardTTC: rows.reduce((s, r) => s + r.enRetardTTC, 0),
    nbOwners: rows.length,
    nbAvecRetard: rows.filter(r => r.enRetardTTC > 0).length,
  }

  return { rows, totaux }
}

export async function getComptabiliteDetail(ownerId: string) {
  const now = new Date()
  const owner = await db.owner.findUnique({
    where: { id: ownerId },
    include: {
      mandates: {
        where: { statut: "ACTIF" },
        include: { property: { select: { id: true, nom: true } } },
      },
      feeInvoices: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, numero_facture: true, objet: true, statut: true,
          montant_ht: true, montant_ttc: true, tva_rate: true,
          createdAt: true, date_echeance: true, date_paiement: true,
          mode_paiement: true, periode_debut: true, periode_fin: true,
        },
      },
      mandantAccount: {
        include: {
          transactions: {
            where: { type: { in: ["HONORAIRES", "TRAVAUX", "CHARGE"] } },
            orderBy: { date: "desc" },
            take: 100,
          },
        },
      },
    },
  })
  if (!owner) return null

  const inv = owner.feeInvoices
  const totalHT = inv.filter(i => i.statut !== "BROUILLON").reduce((s, i) => s + i.montant_ht, 0)
  const encaisseTTC = inv.filter(i => i.statut === "PAYEE").reduce((s, i) => s + i.montant_ttc, 0)
  const emises = inv.filter(i => i.statut === "EMISE")
  const enAttenteTTC = emises.reduce((s, i) => s + i.montant_ttc, 0)
  const enRetardTTC = emises
    .filter(i => i.date_echeance && new Date(i.date_echeance) < now)
    .reduce((s, i) => s + i.montant_ttc, 0)
  const tauxRecouvrement = totalHT > 0 ? Math.round((encaisseTTC / (totalHT * (1 + (inv[0]?.tva_rate ?? 0.2)))) * 100) : 0

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const honorairesCeMois = inv
    .filter(i => i.statut !== "BROUILLON" && new Date(i.createdAt) >= monthStart)
    .reduce((s, i) => s + i.montant_ht, 0)
  const honorairesMoisPrec = inv
    .filter(i => i.statut !== "BROUILLON" && new Date(i.createdAt) >= lastMonthStart && new Date(i.createdAt) <= lastMonthEnd)
    .reduce((s, i) => s + i.montant_ht, 0)

  return {
    owner,
    kpis: { totalHT, encaisseTTC, enAttenteTTC, enRetardTTC, tauxRecouvrement, honorairesCeMois, honorairesMoisPrec },
  }
}

// Legacy exports kept for export CSV
export async function getMandantAccounts() {
  const { rows, totaux } = await getComptabiliteList()
  return {
    accounts: rows.map(r => ({ ...r, solde_courant: -r.enAttenteTTC, solde_sequestre: 0, updatedAt: new Date(), _count: { transactions: r.nbFactures } })),
    totalSolde: -totaux.enAttenteTTC,
    totalSequestre: 0,
  }
}

export async function getMandantAccountById(id: string) {
  return db.mandantAccount.findUnique({
    where: { id },
    include: {
      owner: { include: { mandates: { where: { statut: "ACTIF" }, include: { property: { select: { nom: true } } } } } },
      transactions: { orderBy: { date: "desc" }, take: 100, include: { booking: { select: { id: true, check_in: true, check_out: true, guest: { select: { prenom: true, nom: true } } } } } },
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
  return { revenuCeMois: thisMonth._sum.montant ?? 0, revenuMoisPrecedent: lastMonth._sum.montant ?? 0, nbPending: pending }
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

export async function exportTransactionsCsv(ownerId: string) {
  const detail = await getComptabiliteDetail(ownerId)
  if (!detail) return ""
  const rows = detail.owner.feeInvoices.map(inv => [
    new Date(inv.createdAt).toLocaleDateString("fr-FR"),
    inv.numero_facture,
    inv.objet ?? "",
    inv.statut,
    inv.montant_ht.toFixed(2).replace(".", ","),
    inv.montant_ttc.toFixed(2).replace(".", ","),
    inv.date_paiement ? new Date(inv.date_paiement).toLocaleDateString("fr-FR") : "",
    inv.mode_paiement ?? "",
  ])
  const headers = ["Date", "N° Facture", "Objet", "Statut", "HT", "TTC", "Date paiement", "Mode règlement"]
  return [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n")
}
