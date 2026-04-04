import { describe, it, expect } from "vitest"
import { parseAirbnbWebhookEvent, computeNbNuits } from "./sync"

describe("computeNbNuits", () => {
  it("calcule le bon nombre de nuits", () => {
    expect(computeNbNuits("2024-06-01", "2024-06-08")).toBe(7)
  })

  it("retourne 1 nuit pour une nuit", () => {
    expect(computeNbNuits("2024-06-01", "2024-06-02")).toBe(1)
  })
})

describe("parseAirbnbWebhookEvent", () => {
  it("parse un événement de réservation confirmée", () => {
    const payload = {
      type: "reservation.confirmed",
      data: {
        reservation_id: "airbnb_123",
        listing_id: "listing_456",
        guest: { first_name: "Marie", last_name: "Curie", email: "marie@exemple.fr" },
        start_date: "2024-06-01",
        end_date: "2024-06-08",
        number_of_guests: 3,
        total_price: { amount: 980, currency: "EUR" },
        payout_amount: { amount: 850, currency: "EUR" },
        cleaning_fee: { amount: 100, currency: "EUR" },
      },
    }

    const parsed = parseAirbnbWebhookEvent(payload)
    expect(parsed?.type).toBe("RESERVATION_CONFIRMED")
    expect(parsed?.listing_id).toBe("listing_456")
    expect(parsed?.reservation.guest.nom).toBe("Curie")
    expect(parsed?.reservation.nb_nuits).toBe(7)
  })

  it("retourne null pour un type inconnu", () => {
    expect(parseAirbnbWebhookEvent({ type: "listing.updated" })).toBeNull()
  })
})
