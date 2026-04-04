import { db } from "@conciergerie/db"

export async function getPropertyByListingId(listing_id: string) {
  const listing = await db.airbnbListing.findUnique({
    where: { listing_id },
    include: {
      property: {
        include: { mandate: true },
      },
    },
  })
  return listing?.property ?? null
}

export async function upsertAirbnbListing(
  property_id: string,
  listing_id: string,
  data?: { titre?: string; description?: string }
) {
  return db.airbnbListing.upsert({
    where: { listing_id },
    create: {
      listing_id,
      property_id,
      statut_sync: "OK",
      derniere_sync: new Date(),
      ...data,
    },
    update: {
      statut_sync: "OK",
      derniere_sync: new Date(),
      ...data,
    },
  })
}

export async function markListingSyncError(listing_id: string, error: string) {
  await db.airbnbListing.update({
    where: { listing_id },
    data: {
      statut_sync: "ERROR",
      erreurs_sync: { error, at: new Date().toISOString() },
    },
  })
}
