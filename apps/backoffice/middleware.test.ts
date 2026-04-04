import { describe, it, expect } from "vitest"
import { validateUserRole } from "./lib/auth-utils"
import { UserRole } from "@conciergerie/types"

describe("Middleware RBAC — protection des routes", () => {
  it("bloque TRAVAUX sur /comptabilite", () => {
    expect(validateUserRole(UserRole.TRAVAUX, "/comptabilite")).toBe(false)
  })

  it("autorise COMPTABLE sur /facturation", () => {
    expect(validateUserRole(UserRole.COMPTABLE, "/facturation")).toBe(true)
  })

  it("autorise DIRECTION en lecture partout sauf admin", () => {
    expect(validateUserRole(UserRole.DIRECTION, "/reservations")).toBe(true)
    expect(validateUserRole(UserRole.DIRECTION, "/admin/users")).toBe(false)
  })

  it("SERVICES est bloqué sur /travaux", () => {
    expect(validateUserRole(UserRole.SERVICES, "/travaux")).toBe(false)
  })
})
