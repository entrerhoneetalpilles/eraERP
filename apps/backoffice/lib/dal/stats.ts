import { db } from "@conciergerie/db"

export async function getDashboardStats() {
  const [
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    recentRevenu,
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
  ])

  return {
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    revenuMoisCourant: recentRevenu._sum.revenu_net_proprietaire ?? 0,
  }
}
