import { describe, it, expect } from "vitest"
import { getStatusConfig } from "./status-badge"

describe("getStatusConfig", () => {
  it("retourne une config valide pour ACTIF", () => {
    const config = getStatusConfig("ACTIF")
    expect(config.label).toBe("Actif")
    expect(config.className).toContain("green")
  })

  it("retourne une config valide pour RESILIE", () => {
    const config = getStatusConfig("RESILIE")
    expect(config.label).toBe("Résilié")
    expect(config.className).toContain("red")
  })

  it("retourne fallback pour statut inconnu", () => {
    const config = getStatusConfig("UNKNOWN")
    expect(config.label).toBe("UNKNOWN")
    expect(config.className).toBeDefined()
  })
})
