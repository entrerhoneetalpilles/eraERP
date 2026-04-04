import { describe, it, expect } from "vitest"
import { propertySchema } from "./property"

describe("propertySchema", () => {
  const validProperty = {
    nom: "Villa Les Alpilles",
    type: "VILLA" as const,
    superficie: 120,
    nb_chambres: 4,
    capacite_voyageurs: 8,
    adresse: {
      rue: "Route des Baux",
      code_postal: "13520",
      ville: "Les Baux-de-Provence",
      pays: "France",
    },
  }

  it("valide une propriété correcte", () => {
    expect(propertySchema.safeParse(validProperty).success).toBe(true)
  })

  it("rejette une superficie négative", () => {
    const result = propertySchema.safeParse({ ...validProperty, superficie: -10 })
    expect(result.success).toBe(false)
  })

  it("rejette une capacité de 0", () => {
    const result = propertySchema.safeParse({ ...validProperty, capacite_voyageurs: 0 })
    expect(result.success).toBe(false)
  })
})
