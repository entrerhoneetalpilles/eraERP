import { db } from "@conciergerie/db"

export async function getDashboardStats() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    recentRevenu,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
  ] = await Promise.all([
    db.owner.count(),
    db.property.count({ where: { statut: "ACTIF" } }),
    db.booking.count({ where: { statut: { in: ["CONFIRMED", "CHECKEDIN"] } } }),
    db.booking.findMany({
      where: {
        statut: "CONFIRMED",
        check_in: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: { guest: true, property: true },
      orderBy: { check_in: "asc" },
      take: 5,
    }),
    db.booking.aggregate({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDOUT"] },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    // Today's check-ins
    db.booking.findMany({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDIN"] },
        check_in: { gte: todayStart, lte: todayEnd },
      },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_in: "asc" },
    }),
    // Today's check-outs
    db.booking.findMany({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
        check_out: { gte: todayStart, lte: todayEnd },
      },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_out: "asc" },
    }),
    // Pending cleaning tasks (today + overdue)
    db.cleaningTask.findMany({
      where: {
        statut: { in: ["PLANIFIEE", "EN_COURS", "PROBLEME"] },
        date_prevue: { lte: todayEnd },
      },
      include: {
        property: { select: { id: true, nom: true } },
        contractor: { select: { id: true, nom: true } },
        booking: { select: { id: true } },
      },
      orderBy: { date_prevue: "asc" },
    }),
  ])

  return {
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    revenuMoisCourant: recentRevenu._sum.revenu_net_proprietaire ?? 0,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
  }
}
