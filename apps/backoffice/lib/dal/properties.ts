import { db } from "@conciergerie/db"

export async function getProperties() {
  return db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mandate: { include: { owner: true } },
      _count: { select: { bookings: true } },
    },
  })
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: {
      mandate: { include: { owner: true } },
      bookings: {
        orderBy: { check_in: "desc" },
        take: 10,
        include: { guest: true },
      },
      priceRules: { orderBy: { priorite: "desc" } },
      blockedDates: { orderBy: { date_debut: "asc" } },
      access: true,
      propertyDocuments: { orderBy: { date_validite: "asc" } },
    },
  })
}

export async function createProperty(data: {
  nom: string
  type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
  superficie: number
  nb_chambres: number
  capacite_voyageurs: number
  adresse: Record<string, unknown>
  amenities?: string[]
  statut?: "ACTIF" | "INACTIF" | "TRAVAUX"
}) {
  return db.property.create({ data })
}

export async function updateProperty(
  id: string,
  data: Partial<{
    nom: string
    type: "APPARTEMENT" | "VILLA" | "LOFT" | "CHALET" | "AUTRE"
    superficie: number
    nb_chambres: number
    capacite_voyageurs: number
    adresse: Record<string, unknown>
    amenities: string[]
    statut: "ACTIF" | "INACTIF" | "TRAVAUX"
  }>
) {
  return db.property.update({ where: { id }, data })
}

export async function upsertPropertyAccess(
  property_id: string,
  data: {
    type_acces: "BOITE_CLES" | "CODE" | "AGENT" | "SERRURE_CONNECTEE"
    code_acces?: string
    instructions_arrivee?: string
    wifi_nom?: string
    wifi_mdp?: string
    notes_depart?: string
  }
) {
  return db.propertyAccess.upsert({
    where: { property_id },
    create: { property_id, ...data },
    update: data,
  })
}
