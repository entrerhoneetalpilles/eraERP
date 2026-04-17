import { db } from "@conciergerie/db"

export async function getReviews(filters?: { propertyId?: string; limit?: number }) {
  return db.review.findMany({
    where: {
      booking: filters?.propertyId
        ? { property_id: filters.propertyId }
        : undefined,
    },
    include: {
      booking: {
        include: {
          property: { select: { id: true, nom: true } },
          guest: { select: { id: true, prenom: true, nom: true } },
        },
      },
    },
    orderBy: { date_avis: "desc" },
    take: filters?.limit,
  })
}

export async function upsertReviewResponse(bookingId: string, reponse: string) {
  return db.review.update({
    where: { booking_id: bookingId },
    data: { reponse_gestionnaire: reponse },
  })
}
