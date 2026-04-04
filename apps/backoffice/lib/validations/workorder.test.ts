import { describe, it, expect } from "vitest"
import { workorderSchema } from "./workorder"

describe("workorderSchema", () => {
  it("valide un ordre de travaux minimal", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "Fuite robinet cuisine",
      description: "Le robinet de la cuisine fuit",
      type: "Plomberie",
      urgence: "NORMALE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(true)
  })

  it("rejette un titre vide", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "",
      description: "desc",
      type: "Plomberie",
      urgence: "NORMALE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(false)
  })

  it("rejette une urgence inconnue", () => {
    const result = workorderSchema.safeParse({
      property_id: "prop_123",
      titre: "Test",
      description: "desc",
      type: "Plomberie",
      urgence: "TRES_URGENTE",
      imputable_a: "PROPRIETAIRE",
    })
    expect(result.success).toBe(false)
  })
})
