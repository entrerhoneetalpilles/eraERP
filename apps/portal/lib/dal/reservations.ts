import { db } from "@conciergerie/db"

export async function getOwnerBookings(ownerId: string) {
  return db.booking.findMany({
    where: { property: { mandate: { owner_id: ownerId } } },
    include: {
      property: { select: { id: true, nom: true } },
      guest: { select: { id: true, prenom: true, nom: true, email: true, telephone: true } },
    },
    orderBy: { check_in: "desc" },
  })
}
