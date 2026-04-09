import { db, UserRole } from "@conciergerie/db"
import bcrypt from "bcryptjs"

export async function getUsers() {
  return db.user.findMany({
    orderBy: { nom: "asc" },
    select: {
      id: true, email: true, nom: true, role: true, actif: true,
      mfa_active: true, derniere_connexion: true, createdAt: true,
    },
  })
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, nom: true, role: true, actif: true,
      mfa_active: true, derniere_connexion: true, createdAt: true,
    },
  })
}

export async function createUser(data: { email: string; nom: string; role: UserRole; password: string }) {
  const password_hash = await bcrypt.hash(data.password, 12)
  return db.user.create({ data: { email: data.email, nom: data.nom, role: data.role, password_hash, actif: true } })
}

export async function updateUser(id: string, data: Partial<{ nom: string; role: UserRole; actif: boolean }>) {
  return db.user.update({ where: { id }, data })
}

export async function getAuditLogs(limit = 50) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { nom: true, email: true } } },
  })
}

export async function getSystemStats() {
  const [users, ownerUsers, auditLogs, notifications] = await Promise.all([
    db.user.count(),
    db.ownerUser.count(),
    db.auditLog.count(),
    db.notification.count({ where: { lu: false } }),
  ])
  return { users, ownerUsers, auditLogs, notifications }
}
