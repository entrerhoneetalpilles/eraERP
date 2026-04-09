import { db } from "@conciergerie/db"

export async function getGuests(limit = 100) {
  return db.guest.findMany({
    orderBy: [{ nb_sejours: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { statut: { notIn: ["CANCELLED"] } },
        select: { revenu_net_proprietaire: true, statut: true },
      },
    },
  })
}

export async function getGuestById(id: string) {
  return db.guest.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { check_in: "desc" },
        include: {
          property: { select: { id: true, nom: true } },
          review: { select: { note_globale: true, commentaire_voyageur: true } },
        },
      },
      serviceOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { service: { select: { nom: true, categorie: true } } },
      },
    },
  })
}

export async function updateGuest(id: string, data: {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string
  langue?: string
  nationalite?: string
  tags?: string[]
  notes_internes?: string
  note_interne?: number | null
}) {
  return db.guest.update({ where: { id }, data })
}

export async function findOrCreateGuest(data: {
  prenom: string
  nom: string
  email?: string
  telephone?: string
  platform_guest_id?: string
  langue?: string
}) {
  if (data.platform_guest_id) {
    const existing = await db.guest.findFirst({ where: { platform_guest_id: data.platform_guest_id } })
    if (existing) return existing
  }
  return db.guest.create({ data })
}

export async function getGuestStats(id: string) {
  const [bookings, avgReview, cancelledCount] = await Promise.all([
    db.booking.findMany({
      where: { guest_id: id },
      select: { revenu_net_proprietaire: true, statut: true, nb_nuits: true, platform: true },
    }),
    db.review.aggregate({
      where: { booking: { guest_id: id } },
      _avg: { note_globale: true, note_proprete: true },
      _count: { id: true },
    }),
    db.booking.count({ where: { guest_id: id, statut: "CANCELLED" } }),
  ])

  const completed = bookings.filter(b => b.statut === "CHECKEDOUT")
  const totalRevenu = completed.reduce((s, b) => s + b.revenu_net_proprietaire, 0)
  const totalNuits = completed.reduce((s, b) => s + b.nb_nuits, 0)
  const avgNuits = completed.length > 0 ? Math.round(totalNuits / completed.length) : 0

  return {
    totalSejours: completed.length,
    totalRevenu,
    totalNuits,
    avgNuits,
    avgNote: avgReview._avg.note_globale,
    avgProprete: avgReview._avg.note_proprete,
    nbAvis: avgReview._count.id,
    cancelledCount,
    platforms: bookings.reduce((acc, b) => { acc[b.platform] = (acc[b.platform] ?? 0) + 1; return acc }, {} as Record<string, number>),
  }
}
