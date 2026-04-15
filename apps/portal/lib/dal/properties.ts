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
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1) // exclusive

  const mandate = await db.mandate.findFirst({
    where: { owner_id: ownerId, property_id: propertyId, statut: "ACTIF" },
    include: {
      property: {
        include: {
          bookings: {
            where: {
              statut: { notIn: ["CANCELLED"] },
              OR: [
                { check_in: { gte: firstOfMonth, lt: lastOfMonth } },
                { check_out: { gte: firstOfMonth, lt: lastOfMonth } },
                { check_in: { lte: firstOfMonth }, check_out: { gte: lastOfMonth } },
              ],
            },
            include: {
              guest: { select: { prenom: true, nom: true } },
            },
            orderBy: { check_in: "desc" },
            take: 10,
          },
          cleaningTasks: {
            where: { date_prevue: { gte: firstOfMonth, lt: lastOfMonth } },
            orderBy: { date_prevue: "asc" },
          },
          blockedDates: {
            where: {
              OR: [
                { date_debut: { gte: firstOfMonth, lt: lastOfMonth } },
                { date_fin: { gte: firstOfMonth, lt: lastOfMonth } },
              ],
            },
          },
          access: true,
        },
      },
    },
  })

  if (!mandate) return null

  const [revenusThisMonth, reviews] = await Promise.all([
    db.booking.aggregate({
      where: {
        property_id: propertyId,
        statut: "CHECKEDOUT",
        check_out: { gte: firstOfMonth, lt: lastOfMonth },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    db.review.findMany({
      where: { booking: { property_id: propertyId } },
      orderBy: { date_avis: "desc" },
      take: 5,
      include: {
        booking: {
          select: {
            check_in: true,
            check_out: true,
            guest: { select: { prenom: true } },
          },
        },
      },
    }),
  ])

  return {
    ...mandate.property,
    revenusThisMonth: revenusThisMonth._sum.revenu_net_proprietaire ?? 0,
    reviews,
  }
}
