import { describe, it, expect } from "vitest"
import { computeCrgAmounts } from "./crg"

// Only test the pure function — DB interactions are not mocked here
describe("computeCrgAmounts", () => {
  it("calculates all amounts correctly", () => {
    const bookings = [
      { revenu_net_proprietaire: 1000 },
      { revenu_net_proprietaire: 500 },
    ]
    const charges = [{ montant: -200 }]
    const result = computeCrgAmounts(bookings, charges, 0.15)

    expect(result.revenus_sejours).toBe(1500)
    expect(result.honoraires_deduits).toBeCloseTo(225)
    expect(result.charges_deduites).toBe(200)
    expect(result.montant_reverse).toBeCloseTo(1075)
  })

  it("returns zero montant_reverse when honoraires + charges exceed revenus", () => {
    const result = computeCrgAmounts(
      [{ revenu_net_proprietaire: 100 }],
      [{ montant: -500 }],
      0.20
    )
    expect(result.montant_reverse).toBe(0)
  })

  it("handles empty bookings and charges", () => {
    const result = computeCrgAmounts([], [], 0.20)
    expect(result.revenus_sejours).toBe(0)
    expect(result.honoraires_deduits).toBe(0)
    expect(result.charges_deduites).toBe(0)
    expect(result.montant_reverse).toBe(0)
  })
})
