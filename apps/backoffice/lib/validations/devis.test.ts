import { describe, it, expect } from "vitest"
import { devisSchema, validateDevisAgainstSeuil } from "./devis"

describe("devisSchema", () => {
  it("accepts valid devis", () => {
    const result = devisSchema.safeParse({ montant_devis: 350, notes_devis: "Réfection peinture" })
    expect(result.success).toBe(true)
  })

  it("rejects zero or negative montant", () => {
    expect(devisSchema.safeParse({ montant_devis: 0 }).success).toBe(false)
    expect(devisSchema.safeParse({ montant_devis: -100 }).success).toBe(false)
  })

  it("requires montant_devis", () => {
    expect(devisSchema.safeParse({}).success).toBe(false)
  })
})

describe("validateDevisAgainstSeuil", () => {
  it("returns VALIDE when montant <= seuil", () => {
    expect(validateDevisAgainstSeuil(400, 500)).toBe("VALIDE")
  })

  it("returns EN_ATTENTE_VALIDATION when montant > seuil", () => {
    expect(validateDevisAgainstSeuil(600, 500)).toBe("EN_ATTENTE_VALIDATION")
  })

  it("returns VALIDE when montant equals seuil exactly", () => {
    expect(validateDevisAgainstSeuil(500, 500)).toBe("VALIDE")
  })
})
