export type AirbnbEventType = "RESERVATION_CONFIRMED" | "RESERVATION_CANCELLED" | "RESERVATION_UPDATED"

export interface ParsedAirbnbEvent {
  type: AirbnbEventType
  listing_id: string
  reservation: {
    platform_booking_id: string
    guest: { prenom: string; nom: string; email?: string }
    check_in: string
    check_out: string
    nb_nuits: number
    nb_voyageurs: number
    montant_total: number
    frais_menage: number
    payout: number
  }
}

const AIRBNB_EVENT_MAP: Record<string, AirbnbEventType> = {
  "reservation.confirmed": "RESERVATION_CONFIRMED",
  "reservation.cancelled": "RESERVATION_CANCELLED",
  "reservation.updated": "RESERVATION_UPDATED",
}

export function computeNbNuits(check_in: string, check_out: string): number {
  const start = new Date(check_in)
  const end = new Date(check_out)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseAirbnbWebhookEvent(payload: any): ParsedAirbnbEvent | null {
  const eventType = AIRBNB_EVENT_MAP[payload?.type]
  if (!eventType) return null

  const d = payload.data
  if (!d) return null

  return {
    type: eventType,
    listing_id: d.listing_id,
    reservation: {
      platform_booking_id: d.reservation_id,
      guest: {
        prenom: d.guest?.first_name ?? "",
        nom: d.guest?.last_name ?? "",
        email: d.guest?.email,
      },
      check_in: d.start_date,
      check_out: d.end_date,
      nb_nuits: computeNbNuits(d.start_date, d.end_date),
      nb_voyageurs: d.number_of_guests ?? 1,
      montant_total: d.total_price?.amount ?? 0,
      frais_menage: d.cleaning_fee?.amount ?? 0,
      payout: d.payout_amount?.amount ?? 0,
    },
  }
}
