import { NextRequest, NextResponse } from "next/server"
import { parseAirbnbWebhookEvent } from "@/lib/airbnb/sync"
import { getPropertyByListingId, markListingSyncError } from "@/lib/dal/airbnb"
import { findOrCreateGuest } from "@/lib/dal/guests"
import { createBooking, updateBookingStatut } from "@/lib/dal/bookings"
import { db } from "@conciergerie/db"

function verifyWebhookSignature(request: NextRequest): boolean {
  const secret = process.env.AIRBNB_WEBHOOK_SECRET
  if (!secret) return true // En dev, on skip la vérification

  const signature = request.headers.get("x-airbnb-signature")
  if (!signature) return false

  // En prod, utiliser crypto.subtle pour vérifier HMAC-SHA256
  return true
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  if (!verifyWebhookSignature(request)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const event = parseAirbnbWebhookEvent(payload)
  if (!event) {
    // Événement non géré — on répond 200 pour éviter les retries Airbnb
    return NextResponse.json({ received: true })
  }

  const property = await getPropertyByListingId(event.listing_id)
  if (!property) {
    return NextResponse.json({ error: "Listing non trouvé" }, { status: 404 })
  }

  try {
    if (event.type === "RESERVATION_CONFIRMED") {
      const guest = await findOrCreateGuest({
        prenom: event.reservation.guest.prenom,
        nom: event.reservation.guest.nom,
        email: event.reservation.guest.email,
        platform_guest_id: `airbnb_${event.reservation.platform_booking_id}`,
      })

      const taux = property.mandate?.taux_honoraires ?? 0
      const revenu_net =
        Math.round((event.reservation.payout * (1 - taux / 100)) * 100) / 100

      const existing = await db.booking.findUnique({
        where: { platform_booking_id: event.reservation.platform_booking_id },
      })

      if (!existing) {
        await createBooking({
          property_id: property.id,
          guest_id: guest.id,
          platform: "AIRBNB",
          platform_booking_id: event.reservation.platform_booking_id,
          check_in: new Date(event.reservation.check_in),
          check_out: new Date(event.reservation.check_out),
          nb_nuits: event.reservation.nb_nuits,
          nb_voyageurs: event.reservation.nb_voyageurs,
          montant_total: event.reservation.montant_total,
          frais_menage: event.reservation.frais_menage,
          commission_plateforme:
            event.reservation.montant_total - event.reservation.payout,
          revenu_net_proprietaire: revenu_net,
        })
      }
    } else if (event.type === "RESERVATION_CANCELLED") {
      const booking = await db.booking.findUnique({
        where: { platform_booking_id: event.reservation.platform_booking_id },
      })
      if (booking) {
        await updateBookingStatut(booking.id, "CANCELLED")
      }
    }
  } catch (error) {
    await markListingSyncError(event.listing_id, String(error))
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
