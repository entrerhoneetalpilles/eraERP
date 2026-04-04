import { db } from "@conciergerie/db"

export async function getOwners() {
  return db.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { mandates: true } },
    },
  })
}

export async function getOwnerById(id: string) {
  return db.owner.findUnique({
    where: { id },
    include: {
      mandates: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
      },
      mandantAccount: true,
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
}

export async function createOwner(data: {
  type: "INDIVIDUAL" | "SCI" | "INDIVISION"
  nom: string
  email: string
  telephone?: string
  adresse: Record<string, unknown>
  rib_iban?: string
  nif?: string
  notes?: string
}) {
  const owner = await db.owner.create({ data })
  // Créer automatiquement le compte mandant
  await db.mandantAccount.create({
    data: { owner_id: owner.id },
  })
  return owner
}

export async function updateOwner(
  id: string,
  data: Partial<{
    type: "INDIVIDUAL" | "SCI" | "INDIVISION"
    nom: string
    email: string
    telephone: string
    adresse: Record<string, unknown>
    rib_iban: string
    nif: string
    notes: string
  }>
) {
  return db.owner.update({ where: { id }, data })
}

export async function deleteOwner(id: string) {
  return db.owner.delete({ where: { id } })
}
