import { db } from "@conciergerie/db"

export async function getOwnerProperties(ownerId: string) {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const daysInMonth = lastOfMonth.getDate()

  const mandates = await db.mandate.findMany({
    where: { owner_id: ownerId, statut: "ACTIF" },
    include: {
      property: {
        include: {
          bookings: {
            where: {
              statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
              OR: [
                { check_in: { gte: firstOfMonth, lte: lastOfMonth } },
                { check_out: { gte: firstOfMonth, lte: lastOfMonth } },
                { check_in: { lte: firstOfMonth }, check_out: { gte: lastOfMonth } },
              ],
            },
            orderBy: { check_in: "asc" },
          },
        },
      },
    },
  })

  return mandates.map((m) => {
    const bookings = m.property.bookings
    let occupiedDays = 0
    for (const b of bookings) {
      const start = Math.max(b.check_in.getTime(), firstOfMonth.getTime())
      const end = Math.min(b.check_out.getTime(), lastOfMonth.getTime())
      if (end > start) occupiedDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    }
    const tauxOccupation = Math.min(100, Math.round((occupiedDays / daysInMonth) * 100))
    const prochaineresa = bookings.find((b) => b.check_in >= now) ?? null
    return {
      ...m.property,
      tauxOccupation,
      prochaineresa: prochaineresa
        ? { check_in: prochaineresa.check_in, check_out: prochaineresa.check_out }
        : null,
    }
  })
}

export async function getOwnerPropertyById(ownerId: string, propertyId: string) {
  const mandate = await db.mandate.findFirst({
    where: { owner_id: ownerId, property_id: propertyId, statut: "ACTIF" },
  })
  if (!mandate) return null

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      bookings: {
        where: {
          statut: { notIn: ["CANCELLED"] },
          OR: [
            { check_in: { gte: firstOfMonth } },
            { check_out: { lte: lastOfMonth } },
          ],
        },
        include: {
          guest: { select: { prenom: true, nom: true } },
        },
        orderBy: { check_in: "desc" },
        take: 10,
      },
      cleaningTasks: {
        where: {
          date_prevue: { gte: firstOfMonth, lte: lastOfMonth },
        },
        orderBy: { date_prevue: "asc" },
      },
      blockedDates: {
        where: {
          OR: [
            { date_debut: { gte: firstOfMonth, lte: lastOfMonth } },
            { date_fin: { gte: firstOfMonth, lte: lastOfMonth } },
          ],
        },
      },
    },
  })

  if (!property) return null

  const revenusThisMonth = await db.booking.aggregate({
    where: {
      property_id: propertyId,
      statut: "CHECKEDOUT",
      check_in: { gte: firstOfMonth },
      check_out: { lte: lastOfMonth },
    },
    _sum: { revenu_net_proprietaire: true },
  })

  return {
    ...property,
    revenusThisMonth: revenusThisMonth._sum.revenu_net_proprietaire ?? 0,
  }
}
