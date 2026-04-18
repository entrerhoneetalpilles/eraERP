import { db } from "@conciergerie/db"

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
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: data.owner_id },
  })
  if (!account) throw new Error("Compte mandant introuvable")

  const existing = await db.managementReport.findFirst({
    where: {
      mandant_account_id: account.id,
      periode_debut: data.periode_debut,
      periode_fin: data.periode_fin,
    },
  })
  if (existing) throw new Error("Un CRG existe déjà pour cette période")

  // Séjours terminés (informatif — fonds reçus directement par le propriétaire via Airbnb)
  const bookings = await db.booking.findMany({
    where: {
      property: { mandate: { owner_id: data.owner_id } },
      statut: "CHECKEDOUT",
      check_out: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { revenu_net_proprietaire: true },
  })

  // Honoraires réellement facturés sur la période (factures EMISE + PAYEE)
  const feeInvoices = await db.feeInvoice.findMany({
    where: {
      owner_id: data.owner_id,
      statut: { in: ["EMISE", "PAYEE"] },
      createdAt: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { montant_ht: true },
  })

  // Charges travaux imputées au propriétaire sur la période
  const charges = await db.transaction.findMany({
    where: {
      mandant_account_id: account.id,
      type: { in: ["TRAVAUX", "CHARGE"] },
      date: { gte: data.periode_debut, lte: data.periode_fin },
    },
    select: { montant: true },
  })

  const round2 = (n: number) => Math.round(n * 100) / 100
  const revenus_sejours = round2(bookings.reduce((s, b) => s + b.revenu_net_proprietaire, 0))
  const honoraires_deduits = round2(feeInvoices.reduce((s, i) => s + i.montant_ht, 0))
  const charges_deduites = round2(Math.abs(charges.reduce((s, c) => s + c.montant, 0)))
  // Net estimé propriétaire = revenus perçus - honoraires ERA - charges travaux
  const montant_reverse = Math.max(0, round2(revenus_sejours - honoraires_deduits - charges_deduites))

  // Création du rapport uniquement — pas de transaction de reversement
  // (le propriétaire reçoit les loyers directement via Airbnb/plateformes)
  return db.managementReport.create({
    data: {
      mandant_account_id: account.id,
      periode_debut: data.periode_debut,
      periode_fin: data.periode_fin,
      revenus_sejours,
      honoraires_deduits,
      charges_deduites,
      montant_reverse,
    },
  })
}

export async function getManagementReportById(id: string) {
  return db.managementReport.findUnique({
    where: { id },
    include: {
      account: {
        include: {
          owner: { select: { id: true, nom: true, email: true, type: true } },
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
