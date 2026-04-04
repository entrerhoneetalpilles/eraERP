import { describe, it, expect } from "vitest"
import { prestataireSchema } from "./prestataire"

describe("prestataireSchema", () => {
  it("valide un prestataire minimal", () => {
    const result = prestataireSchema.safeParse({
      nom: "Dupont Plomberie",
      metier: "Plombier",
    })
    expect(result.success).toBe(true)
  })

  it("rejette un nom vide", () => {
    const result = prestataireSchema.safeParse({
      nom: "",
      metier: "Plombier",
    })
    expect(result.success).toBe(false)
  })

  it("accepte des champs optionnels", () => {
    const result = prestataireSchema.safeParse({
      nom: "Martin Elec",
      metier: "Électricien",
      email: "martin@elec.fr",
      telephone: "0612345678",
      siret: "12345678901234",
    })
    expect(result.success).toBe(true)
  })
})
