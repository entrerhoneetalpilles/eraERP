import { describe, it, expect } from "vitest"
import { factureSchema, computeMontantTTC } from "./facture"

describe("computeMontantTTC", () => {
  it("calcule le TTC avec TVA 20%", () => {
    expect(computeMontantTTC(1000, 0.20)).toBeCloseTo(1200)
  })
  it("calcule le TTC sans TVA", () => {
    expect(computeMontantTTC(500, 0)).toBe(500)
  })
})

describe("factureSchema", () => {
  it("valide une facture correcte", () => {
    const result = factureSchema.safeParse({
      owner_id: "owner_123",
      periode_debut: "2024-06-01",
      periode_fin: "2024-06-30",
      montant_ht: 350,
      tva_rate: 0.20,
    })
    expect(result.success).toBe(true)
  })

  it("rejette un montant négatif", () => {
    const result = factureSchema.safeParse({
      owner_id: "owner_123",
      periode_debut: "2024-06-01",
      periode_fin: "2024-06-30",
      montant_ht: -100,
      tva_rate: 0.20,
    })
    expect(result.success).toBe(false)
  })
})
