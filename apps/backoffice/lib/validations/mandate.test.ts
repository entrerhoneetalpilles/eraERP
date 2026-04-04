import { describe, it, expect } from "vitest"
import { mandateSchema } from "./mandate"

describe("mandateSchema", () => {
  const validMandate = {
    owner_id: "owner123",
    property_id: "prop456",
    numero_mandat: "M-2024-001",
    date_debut: "2024-01-01",
    taux_honoraires: 15,
    seuil_validation_devis: 500,
    reconduction_tacite: true,
  }

  it("valide un mandat correct", () => {
    expect(mandateSchema.safeParse(validMandate).success).toBe(true)
  })

  it("rejette un taux d'honoraires > 100", () => {
    const result = mandateSchema.safeParse({ ...validMandate, taux_honoraires: 150 })
    expect(result.success).toBe(false)
  })

  it("rejette un taux d'honoraires négatif", () => {
    const result = mandateSchema.safeParse({ ...validMandate, taux_honoraires: -5 })
    expect(result.success).toBe(false)
  })
})
