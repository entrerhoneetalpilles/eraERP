import { describe, it, expect } from "vitest"
import { validateUserRole, hasPermission, ROLE_ROUTES } from "./auth-utils"
import { UserRole } from "@conciergerie/types"

describe("validateUserRole", () => {
  it("retourne true pour ADMIN sur toutes les routes", () => {
    expect(validateUserRole(UserRole.ADMIN, "/comptabilite/mandants")).toBe(true)
    expect(validateUserRole(UserRole.ADMIN, "/admin/users")).toBe(true)
  })

  it("retourne false pour TRAVAUX sur la comptabilité", () => {
    expect(validateUserRole(UserRole.TRAVAUX, "/comptabilite/mandants")).toBe(false)
  })

  it("retourne true pour GESTIONNAIRE sur les réservations", () => {
    expect(validateUserRole(UserRole.GESTIONNAIRE, "/reservations")).toBe(true)
  })

  it("retourne false pour SERVICES sur les travaux", () => {
    expect(validateUserRole(UserRole.SERVICES, "/travaux")).toBe(false)
  })
})

describe("hasPermission", () => {
  it("COMPTABLE a accès à la comptabilité", () => {
    expect(hasPermission(UserRole.COMPTABLE, "comptabilite:read")).toBe(true)
  })

  it("GESTIONNAIRE n'a pas accès à la comptabilité en écriture admin", () => {
    expect(hasPermission(UserRole.GESTIONNAIRE, "comptabilite:admin")).toBe(false)
  })
})
