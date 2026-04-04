import { describe, it, expect } from "vitest"
import { buildStorageKey, getPublicUrl } from "./client"

describe("buildStorageKey", () => {
  it("construit une clé de stockage structurée", () => {
    const key = buildStorageKey({
      entityType: "owner",
      entityId: "clh123",
      fileName: "rib.pdf",
    })
    expect(key).toBe("owner/clh123/rib.pdf")
  })

  it("inclut le sous-dossier si fourni", () => {
    const key = buildStorageKey({
      entityType: "property",
      entityId: "prop456",
      folder: "photos",
      fileName: "facade.jpg",
    })
    expect(key).toBe("property/prop456/photos/facade.jpg")
  })
})

describe("getPublicUrl", () => {
  it("construit une URL publique correcte", () => {
    const url = getPublicUrl("owner/clh123/rib.pdf")
    expect(url).toContain("owner/clh123/rib.pdf")
    expect(url).toMatch(/^https?:\/\//)
  })
})
