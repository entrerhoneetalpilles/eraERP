import { describe, it, expect } from "vitest"
import { buildEmailPayload } from "./client"

describe("buildEmailPayload", () => {
  it("construit un payload Resend valide", () => {
    const payload = buildEmailPayload({
      to: "proprietaire@exemple.fr",
      subject: "Votre compte a été créé",
      html: "<p>Bienvenue</p>",
    })

    expect(payload.from).toBe("Entre Rhône et Alpilles <noreply@entrerhonenalpilles.fr>")
    expect(payload.to).toContain("proprietaire@exemple.fr")
    expect(payload.subject).toBe("Votre compte a été créé")
  })

  it("accepte plusieurs destinataires", () => {
    const payload = buildEmailPayload({
      to: ["a@b.fr", "c@d.fr"],
      subject: "Test",
      html: "<p>Test</p>",
    })
    expect(payload.to).toHaveLength(2)
  })
})
