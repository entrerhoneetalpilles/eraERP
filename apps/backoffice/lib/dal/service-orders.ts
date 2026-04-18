import { db } from "@conciergerie/db"

export async function getServiceOrders(statut?: string) {
  return db.serviceOrder.findMany({
    where: statut ? { statut: statut as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" } : undefined,
    include: {
      property: { select: { id: true, nom: true } },
      booking: { select: { id: true, check_in: true, check_out: true } },
      guest: { select: { id: true, prenom: true, nom: true } },
      service: { select: { id: true, nom: true, categorie: true, unite: true, tarif: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateServiceOrderStatut(
  id: string,
  statut: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  date_realisation?: Date
) {
  return db.serviceOrder.update({
    where: { id },
    data: { statut, ...(date_realisation ? { date_realisation } : {}) },
  })
}

export async function getServiceOrderStats() {
  const [pending, confirmed, completed, totalRevenue] = await Promise.all([
    db.serviceOrder.count({ where: { statut: "PENDING" } }),
    db.serviceOrder.count({ where: { statut: "CONFIRMED" } }),
    db.serviceOrder.count({ where: { statut: "COMPLETED" } }),
    db.serviceOrder.aggregate({
      where: { statut: "COMPLETED" },
      _sum: { montant_total: true },
    }),
  ])
  return { pending, confirmed, completed, totalRevenue: totalRevenue._sum.montant_total ?? 0 }
}
