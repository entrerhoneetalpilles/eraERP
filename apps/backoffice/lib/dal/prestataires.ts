import { db } from "@conciergerie/db"

export async function getPrestataires() {
  return db.contractor.findMany({
    orderBy: { nom: "asc" },
    include: {
      _count: { select: { workOrders: true, cleaningTasks: true } },
    },
  })
}

export async function getPrestataireById(id: string) {
  return db.contractor.findUnique({
    where: { id },
    include: {
      workOrders: {
        include: { property: { select: { id: true, nom: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })
}

export async function createPrestataire(data: {
  nom: string
  metier: string
  email?: string
  telephone?: string
  siret?: string
  notes?: string
}) {
  return db.contractor.create({
    data: {
      ...data,
      email: data.email || null,
      siret: data.siret || null,
    },
  })
}

export async function updatePrestataire(
  id: string,
  data: Partial<{
    nom: string
    metier: string
    email: string
    telephone: string
    siret: string
    notes: string
    actif: boolean
  }>
) {
  return db.contractor.update({ where: { id }, data })
}
