import { db } from "@conciergerie/db"

/** Pure calculation — easy to test without DB */
export function computeCrgAmounts(
  bookings: Array<{ revenu_net_proprietaire: number }>,
  charges: Array<{ montant: number }>,
  taux_honoraires: number
) {
  const round2 = (n: number) => Math.round(n * 100) / 100
  const revenus_sejours = round2(bookings.reduce((sum, b) => sum + b.revenu_net_proprietaire, 0))
  const honoraires_deduits = round2(revenus_sejours * taux_honoraires)
  const charges_deduites = round2(Math.abs(charges.reduce((sum, c) => sum + c.montant, 0)))
  const montant_reverse = Math.max(0, round2(revenus_sejours - honoraires_deduits - charges_deduites))
  return { revenus_sejours, honoraires_deduits, charges_deduites, montant_reverse }
}

export async function getManagementReports() {
  return db.managementReport.findMany({
    include: {
      account: {
        include: { owner: { select: { id: true, nom: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function generateCrg(data: {
  owner_id: string
  periode_debut: Date
  periode_fin: Date
}) {
  // 1. Get mandantAccount
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: data.owner_id },
  })
  if (!account) throw new Error("Compte mandant introuvable")

  // Guard against double generation for the same period
  const existing = await db.managementReport.findFirst({
    where: {
      mandant_account_id: account.id,
      periode_debut: data.periode_debut,
      periode_fin: data.periode_fin,
    },
  })
  if (existing) throw new Error("Un CRG existe déjà pour cette période")

  // 2. Get mandate to find taux_honoraires
  const mandate = await db.mandate.findFirst({
    where: { owner_id: data.owner_id, statut: "ACTIF" },
    select: { taux_honoraires: true },
  })
  const taux_honoraires = mandate?.taux_honoraires ?? 0.20

  // 3. Get CHECKEDOUT bookings in period
  const bookings = await db.booking.findMany({
    where: {
      property: { mandate: { owner_id: data.owner_id } },
      statut: "CHECKEDOUT",
      check_out: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { revenu_net_proprietaire: true },
  })

  // 4. Get TRAVAUX/CHARGE transactions in period
  const charges = await db.transaction.findMany({
    where: {
      mandant_account_id: account.id,
      type: { in: ["TRAVAUX", "CHARGE"] },
      date: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { montant: true },
  })

  // 5. Compute amounts
  const amounts = computeCrgAmounts(bookings, charges, taux_honoraires)

  // 6. Persist report + reversement transaction atomically
  return db.$transaction(async (tx) => {
    const report = await tx.managementReport.create({
      data: {
        mandant_account_id: account.id,
        periode_debut: data.periode_debut,
        periode_fin: data.periode_fin,
        ...amounts,
      },
    })

    await tx.transaction.create({
      data: {
        mandant_account_id: account.id,
        type: "REVERSEMENT",
        montant: -amounts.montant_reverse,
        date: new Date(),
        libelle: `Reversement CRG ${data.periode_debut.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })}`,
      },
    })

    await tx.mandantAccount.update({
      where: { id: account.id },
      data: { solde_courant: { decrement: amounts.montant_reverse } },
    })

    return report
  })
}

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
