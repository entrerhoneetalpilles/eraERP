import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"

export async function getUsers() {
  return db.user.findMany({
    orderBy: { nom: "asc" },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      actif: true,
      createdAt: true,
    },
  })
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      actif: true,
      createdAt: true,
    },
  })
}

export async function createUser(data: {
  email: string
  nom: string
  role: "ADMIN" | "GESTIONNAIRE" | "COMPTABLE" | "TRAVAUX" | "SERVICES" | "DIRECTION"
  password: string
}) {
  const password_hash = await bcrypt.hash(data.password, 12)
  return db.user.create({
    data: {
      email: data.email,
      nom: data.nom,
      role: data.role,
      password_hash,
      actif: true,
    },
  })
}

export async function updateUser(
  id: string,
  data: Partial<{
    nom: string
    role: string
    actif: boolean
  }>
) {
  return db.user.update({ where: { id }, data })
}
