import { describe, it, expect } from "vitest"
import { buildStorageKey, getPublicUrl, _extractKey } from "./client"

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

describe("_extractKey (extractStorageKey pure logic)", () => {
  const BUCKET = "my-bucket"

  it("extrait depuis une URL MinIO path-style (endpoint/bucket/key)", () => {
    expect(_extractKey("http://localhost:9000/my-bucket/mandate/abc/mandat/file.pdf", BUCKET, null))
      .toBe("mandate/abc/mandat/file.pdf")
  })

  it("extrait depuis une URL R2 path-style (account.r2.../bucket/key)", () => {
    expect(_extractKey("https://account.r2.cloudflarestorage.com/my-bucket/mandate/abc/mandat/file.pdf", BUCKET, null))
      .toBe("mandate/abc/mandat/file.pdf")
  })

  it("extrait depuis une URL R2 public domain (S3_PUBLIC_URL défini)", () => {
    expect(_extractKey("https://pub-xxx.r2.dev/mandate/abc/mandat/file.pdf", BUCKET, "https://pub-xxx.r2.dev"))
      .toBe("mandate/abc/mandat/file.pdf")
  })

  it("gère le double-bucket bug (endpoint qui contient le bucket dans son path)", () => {
    expect(_extractKey("https://account.r2.cloudflarestorage.com/my-bucket/my-bucket/mandate/abc/mandat/file.pdf", BUCKET, null))
      .toBe("mandate/abc/mandat/file.pdf")
  })
})
