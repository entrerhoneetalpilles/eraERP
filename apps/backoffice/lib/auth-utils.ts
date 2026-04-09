import { UserRole } from "@conciergerie/types"

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ["/"],
  [UserRole.DIRECTION]: [
    "/dashboard", "/proprietaires", "/biens", "/mandats",
    "/reservations", "/voyageurs", "/planning",
    "/comptabilite", "/facturation", "/crg", "/reporting", "/documents",
    "/travaux", "/prestataires", "/services", "/menage",
    "/mails",
  ],
  [UserRole.GESTIONNAIRE]: [
    "/dashboard", "/proprietaires", "/biens", "/mandats",
    "/reservations", "/voyageurs", "/planning",
    "/travaux", "/prestataires", "/services", "/menage",
    "/documents", "/mails",
  ],
  [UserRole.COMPTABLE]: [
    "/dashboard", "/comptabilite", "/facturation", "/crg", "/reporting",
    "/documents", "/proprietaires", "/biens", "/reservations",
  ],
  [UserRole.SERVICES]: [
    "/dashboard", "/services", "/voyageurs", "/planning", "/menage", "/mails",
  ],
  [UserRole.TRAVAUX]: [
    "/dashboard", "/travaux", "/prestataires", "/biens", "/planning", "/documents",
  ],
}

type Permission =
  | "comptabilite:read"
  | "comptabilite:write"
  | "comptabilite:admin"
  | "biens:read"
  | "biens:write"
  | "reservations:read"
  | "reservations:write"
  | "travaux:read"
  | "travaux:write"
  | "services:read"
  | "services:write"
  | "users:admin"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    "comptabilite:read", "comptabilite:write", "comptabilite:admin",
    "biens:read", "biens:write",
    "reservations:read", "reservations:write",
    "travaux:read", "travaux:write",
    "services:read", "services:write",
    "users:admin",
  ],
  [UserRole.DIRECTION]: [
    "comptabilite:read", "biens:read", "reservations:read",
    "travaux:read", "services:read",
  ],
  [UserRole.GESTIONNAIRE]: [
    "biens:read", "biens:write",
    "reservations:read", "reservations:write",
    "travaux:read", "travaux:write",
    "services:read",
  ],
  [UserRole.COMPTABLE]: [
    "comptabilite:read", "comptabilite:write",
    "biens:read", "reservations:read",
  ],
  [UserRole.SERVICES]: [
    "services:read", "services:write",
    "reservations:read",
  ],
  [UserRole.TRAVAUX]: [
    "travaux:read", "travaux:write",
    "biens:read",
  ],
}

export function validateUserRole(role: UserRole, path: string): boolean {
  if (role === UserRole.ADMIN) return true
  const allowedPrefixes = ROLE_ROUTES[role]
  return allowedPrefixes.some((prefix) => path.startsWith(prefix))
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === UserRole.ADMIN) return true
  return ROLE_PERMISSIONS[role].includes(permission)
}
