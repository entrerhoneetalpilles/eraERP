import { describe, it, expect } from "vitest"
import { getRateLimitKey } from "./rate-limit"

describe("getRateLimitKey", () => {
  it("construit une clé unique par IP et route", () => {
    const key = getRateLimitKey("192.168.1.1", "/api/auth/signin")
    expect(key).toBe("rate:192.168.1.1:/api/auth/signin")
  })

  it("remplace les IP nulles par 'unknown'", () => {
    const key = getRateLimitKey(null, "/api/auth/signin")
    expect(key).toBe("rate:unknown:/api/auth/signin")
  })
})
