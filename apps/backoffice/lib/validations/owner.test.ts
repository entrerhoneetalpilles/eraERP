import { describe, it, expect } from "vitest"
import { ownerSchema } from "./owner"

describe("ownerSchema", () => {
  it("valide un propriétaire individuel valide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "Jean Dupont",
      email: "jean@exemple.fr",
      telephone: "0612345678",
      adresse: {
        rue: "12 rue de la Paix",
        code_postal: "13001",
        ville: "Marseille",
        pays: "France",
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejette un email invalide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "Jean Dupont",
      email: "pas-un-email",
      adresse: { rue: "12 rue de la Paix", code_postal: "13001", ville: "Marseille", pays: "France" },
    })
    expect(result.success).toBe(false)
  })

  it("rejette un nom vide", () => {
    const result = ownerSchema.safeParse({
      type: "INDIVIDUAL",
      nom: "",
      email: "jean@exemple.fr",
      adresse: { rue: "12 rue de la Paix", code_postal: "13001", ville: "Marseille", pays: "France" },
    })
    expect(result.success).toBe(false)
  })
})
