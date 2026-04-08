import { db, Prisma } from "@conciergerie/db"

export async function getProperties() {
  return db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mandate: { include: { owner: true } },
      _count: { select: { bookings: true } },
    },
  })
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: {
      mandate: { include: { owner: true } },
      bookings: {
        orderBy: { check_in: "desc" },
        take: 20,
        include: { guest: true },
      },
      priceRules: { orderBy: { priorite: "desc" } },
      blockedDates: { orderBy: { date_debut: "asc" } },
      access: true,
      propertyDocuments: { orderBy: { date_validite: "asc" } },
      workOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      cleaningTasks: {
        orderBy: { date_prevue: "desc" },
        take: 10,
      },
    },
  })
}

export async function getPropertyStats(id: string) {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [revenuMoisCourant, totalReservations, activeBookings, openWorkOrders] = await Promise.all([
    db.booking.aggregate({
      where: {
        property_id: id,
        statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
        check_in: { gte: firstOfMonth },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    db.booking.count({ where: { property_id: id } }),
    db.booking.count({
      where: { property_id: id, statut: { in: ["PENDING", "CONFIRMED", "CHECKEDIN"] } },
    }),
    db.workOrder.count({
      where: {
        property_id: id,
        statut: { in: ["OUVERT", "EN_COURS", "EN_ATTENTE_DEVIS", "EN_ATTENTE_VALIDATION"] },
      },
    }),
  ])

  return {
    revenuMoisCourant: revenuMoisCourant._sum.revenu_net_proprietaire ?? 0,
    totalReservations,
    activeBookings,
    openWorkOrders,
  }
}

export async function deleteProperty(id: string) {
  const activeBookings = await db.booking.count({
    where: { property_id: id, statut: { in: ["PENDING", "CONFIRMED", "CHECKEDIN"] } },
  })
  if (activeBookings > 0) {
    throw new Error(`Impossible de supprimer : ${activeBookings} réservation(s) active(s)`)
  }
  return db.property.delete({ where: { id } })
}

export async function createProperty(data: {
  nom: string
  type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
  superficie: number
  nb_chambres: number
  capacite_voyageurs: number
  adresse: Prisma.InputJsonValue
  amenities?: string[]
  statut?: "ACTIF" | "INACTIF" | "TRAVAUX"
}) {
  return db.property.create({ data })
}

export async function updateProperty(
  id: string,
  data: Partial<{
    nom: string
    type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
    superficie: number
    nb_chambres: number
    capacite_voyageurs: number
    adresse: Prisma.InputJsonValue
    amenities: string[]
    statut: "ACTIF" | "INACTIF" | "TRAVAUX"
  }>
) {
  return db.property.update({ where: { id }, data })
}

export async function upsertPropertyAccess(
  property_id: string,
  data: {
    type_acces: "BOITE_CLES" | "CODE" | "AGENT" | "SERRURE_CONNECTEE"
    code_acces?: string
    instructions_arrivee?: string
    wifi_nom?: string
    wifi_mdp?: string
    notes_depart?: string
  }
) {
  return db.propertyAccess.upsert({
    where: { property_id },
    create: { property_id, ...data },
    update: data,
  })
}