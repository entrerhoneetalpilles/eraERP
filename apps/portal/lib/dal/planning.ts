import { db } from "@conciergerie/db"

export async function getOwnerPlanningEvents(ownerId: string, from: Date, to: Date) {
  const mandates = await db.mandate.findMany({
    where: { owner_id: ownerId, statut: "ACTIF" },
    select: { property_id: true },
  })
  const propertyIds = mandates.map((m) => m.property_id)
  if (propertyIds.length === 0) return { bookings: [], cleanings: [], blockedDates: [] }

  const [bookings, cleanings, blockedDates] = await Promise.all([
    db.booking.findMany({
      where: {
        property_id: { in: propertyIds },
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: from, lte: to } },
          { check_out: { gte: from, lte: to } },
          { check_in: { lte: from }, check_out: { gte: to } },
        ],
      },
      include: {
        property: { select: { nom: true } },
        guest: { select: { prenom: true, nom: true } },
      },
    }),
    db.cleaningTask.findMany({
      where: {
        property_id: { in: propertyIds },
        date_prevue: { gte: from, lte: to },
      },
      include: { property: { select: { nom: true } } },
    }),
    db.blockedDate.findMany({
      where: {
        property_id: { in: propertyIds },
        OR: [
          { date_debut: { gte: from, lte: to } },
          { date_fin: { gte: from, lte: to } },
          { date_debut: { lte: from }, date_fin: { gte: to } },
        ],
      },
      include: { property: { select: { nom: true } } },
    }),
  ])

  return { bookings, cleanings, blockedDates }
}
