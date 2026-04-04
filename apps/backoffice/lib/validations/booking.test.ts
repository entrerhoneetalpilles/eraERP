import { describe, it, expect } from "vitest"
import { bookingSchema, computeRevenuNet } from "./booking"

describe("bookingSchema", () => {
  const validBooking = {
    property_id: "prop1",
    guest_id: "guest1",
    platform: "DIRECT",
    check_in: "2024-06-01",
    check_out: "2024-06-08",
    nb_nuits: 7,
    nb_voyageurs: 4,
    montant_total: 1400,
    frais_menage: 100,
    commission_plateforme: 0,
    revenu_net_proprietaire: 1300,
  }

  it("valide une réservation correcte", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true)
  })

  it("rejette nb_nuits négatif", () => {
    const result = bookingSchema.safeParse({ ...validBooking, nb_nuits: -1 })
    expect(result.success).toBe(false)
  })
})

describe("computeRevenuNet", () => {
  it("calcule le revenu net correctement", () => {
    const revenu = computeRevenuNet({
      montant_total: 1000,
      frais_menage: 100,
      commission_plateforme: 150,
      taux_honoraires: 15,
    })
    // (1000 - 150) * (1 - 0.15) = 850 * 0.85 = 722.5
    expect(revenu).toBeCloseTo(722.5)
  })
})
