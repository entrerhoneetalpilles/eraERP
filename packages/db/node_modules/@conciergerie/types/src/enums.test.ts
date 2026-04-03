import { describe, it, expect } from "vitest"
import {
  UserRole,
  OwnerType,
  PropertyType,
  BookingStatus,
  Platform,
  MandateStatus,
  TransactionType,
  DocumentType,
  SignatureStatus,
  Urgency,
} from "./enums"

describe("UserRole enum", () => {
  it("contient les 6 rôles back-office", () => {
    expect(Object.values(UserRole)).toHaveLength(6)
    expect(UserRole.ADMIN).toBe("ADMIN")
    expect(UserRole.GESTIONNAIRE).toBe("GESTIONNAIRE")
  })
})

describe("BookingStatus enum", () => {
  it("couvre le cycle de vie d'une réservation", () => {
    const statuses = Object.values(BookingStatus)
    expect(statuses).toContain("CONFIRMED")
    expect(statuses).toContain("CHECKEDIN")
    expect(statuses).toContain("CANCELLED")
  })
})

describe("Platform enum", () => {
  it("inclut Airbnb comme plateforme principale", () => {
    expect(Platform.AIRBNB).toBe("AIRBNB")
  })
})
