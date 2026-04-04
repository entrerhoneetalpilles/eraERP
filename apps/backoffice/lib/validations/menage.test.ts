import { describe, it, expect } from "vitest"
import { cleaningTaskSchema } from "./menage"

describe("cleaningTaskSchema", () => {
  it("accepts valid data", () => {
    const result = cleaningTaskSchema.safeParse({
      prestataire_id: "abc",
      date_prevue: "2026-04-10",
      notes: "Be careful with the balcony",
    })
    expect(result.success).toBe(true)
  })

  it("requires date_prevue", () => {
    const result = cleaningTaskSchema.safeParse({ prestataire_id: "abc" })
    expect(result.success).toBe(false)
  })

  it("accepts absent prestataire_id", () => {
    const result = cleaningTaskSchema.safeParse({ date_prevue: "2026-04-10" })
    expect(result.success).toBe(true)
  })
})
