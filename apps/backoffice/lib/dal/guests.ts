import { db } from "@conciergerie/db"

export async function getGuests() {
  return db.guest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  })
}

export async function getGuestById(id: string) {
  return db.guest.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { check_in: "desc" },
        take: 20,
        include: { property: true },
      },
    },
  })
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
    const existing = await db.guest.findFirst({
      where: { platform_guest_id: data.platform_guest_id },
    })
    if (existing) return existing
  }

  return db.guest.create({ data })
}
