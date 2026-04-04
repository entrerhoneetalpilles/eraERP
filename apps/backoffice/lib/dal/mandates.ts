import { db } from "@conciergerie/db"

export async function getMandates() {
  return db.mandate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      property: true,
    },
  })
}

export async function getMandateById(id: string) {
  return db.mandate.findUnique({
    where: { id },
    include: {
      owner: true,
      property: true,
      avenants: { orderBy: { numero: "desc" } },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
}

export async function getNextMandateNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.mandate.count({
    where: { numero_mandat: { startsWith: `M-${year}-` } },
  })
  return `M-${year}-${String(count + 1).padStart(3, "0")}`
}

export async function createMandate(data: {
  owner_id: string
  property_id: string
  numero_mandat: string
  date_debut: Date
  date_fin?: Date
  taux_honoraires: number
  honoraires_location?: number
  taux_horaire_ht?: number
  seuil_validation_devis: number
  reconduction_tacite: boolean
  prestations_incluses: string[]
}) {
  return db.mandate.create({ data })
}

export async function updateMandateStatut(
  id: string,
  statut: "ACTIF" | "SUSPENDU" | "RESILIE"
) {
  return db.mandate.update({ where: { id }, data: { statut } })
}
