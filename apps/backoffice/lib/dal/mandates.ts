import { db } from "@conciergerie/db"

export async function getMandates() {
  return db.mandate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      property: {
        include: { _count: { select: { bookings: true } } },
      },
    },
  })
}

export async function getMandateById(id: string) {
  return db.mandate.findUnique({
    where: { id },
    include: {
      owner: true,
      property: {
        include: {
          bookings: {
            orderBy: { check_in: "desc" },
            take: 20,
            include: { guest: true },
          },
          priceRules: { orderBy: { priorite: "desc" } },
          access: true,
        },
      },
      avenants: { orderBy: { numero: "desc" } },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
}

export async function getMandateStats(id: string) {
  const mandate = await db.mandate.findUnique({
    where: { id },
    select: { property_id: true, taux_honoraires: true },
  })
  if (!mandate) return { revenusBruts: 0, totalReservations: 0, activeBookings: 0, honorairesGeneres: 0 }

  const [revenusBruts, totalReservations, activeBookings] = await Promise.all([
    db.booking.aggregate({
      where: {
        property_id: mandate.property_id,
        statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
      },
      _sum: { montant_total: true },
    }),
    db.booking.count({ where: { property_id: mandate.property_id } }),
    db.booking.count({
      where: { property_id: mandate.property_id, statut: { in: ["PENDING", "CONFIRMED", "CHECKEDIN"] } },
    }),
  ])

  const totalBrut = revenusBruts._sum.montant_total ?? 0
  return {
    revenusBruts: totalBrut,
    totalReservations,
    activeBookings,
    honorairesGeneres: (totalBrut * mandate.taux_honoraires) / 100,
  }
}

export async function deleteMandate(id: string) {
  const mandate = await db.mandate.findUnique({
    where: { id },
    select: { property_id: true },
  })
  if (!mandate) throw new Error("Mandat introuvable")

  const activeBookings = await db.booking.count({
    where: { property_id: mandate.property_id, statut: { in: ["PENDING", "CONFIRMED", "CHECKEDIN"] } },
  })
  if (activeBookings > 0) {
    throw new Error(`Impossible de supprimer : ${activeBookings} réservation(s) active(s)`)
  }
  return db.mandate.delete({ where: { id } })
}

export async function getNextMandateNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.mandate.count({
    where: { numero_mandat: { startsWith: `M-${year}-` } },
  })
  return `M-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createMandate(data: {
  owner_id: string
  property_id: string
  numero_mandat: string
  date_debut: Date
  date_fin?: Date
  taux_honoraires: number
  honoraires_location?: number
  taux_horaire_ht?: number
  seuil_validation_devis: number
  reconduction_tacite: boolean
  prestations_incluses: string[]
}) {
  return db.mandate.create({ data })
}

export async function updateMandateStatut(
  id: string,
  statut: "ACTIF" | "SUSPENDU" | "RESILIE"
) {
  return db.mandate.update({ where: { id }, data: { statut } })
}
