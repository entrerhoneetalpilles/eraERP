import { db } from "@conciergerie/db"

export const DEVIS_STATUTS = ["EN_ATTENTE_DEVIS", "EN_ATTENTE_VALIDATION", "VALIDE", "ANNULE"] as const
export type DevisStatut = (typeof DEVIS_STATUTS)[number]

export async function getDevis(filters?: { statut?: DevisStatut | "all" }) {
  return db.workOrder.findMany({
    where: {
      statut:
        !filters?.statut || filters.statut === "all"
          ? { in: ["EN_ATTENTE_DEVIS", "EN_ATTENTE_VALIDATION", "VALIDE", "ANNULE"] }
          : filters.statut,
    },
    include: {
      property: {
        select: {
          id: true,
          nom: true,
          mandate: {
            select: {
              id: true,
              seuil_validation_devis: true,
              owner: { select: { id: true, nom: true, email: true } },
            },
          },
        },
      },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDevisById(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          type: true,
          mandate: {
            select: {
              id: true,
              numero_mandat: true,
              seuil_validation_devis: true,
              owner: { select: { id: true, nom: true, email: true, telephone: true } },
            },
          },
        },
      },
      contractor: { select: { id: true, nom: true, metier: true, email: true, telephone: true } },
    },
  })
}

export async function createDevis(data: {
  property_id: string
  titre: string
  description: string
  type: string
  urgence: "NORMALE" | "URGENTE" | "CRITIQUE"
  imputable_a: "PROPRIETAIRE" | "SOCIETE"
  montant_devis: number
  notes_devis?: string
  contractor_id?: string
  created_by: string
  seuil: number
}) {
  const { seuil, ...rest } = data
  const statut: DevisStatut = rest.montant_devis <= seuil ? "VALIDE" : "EN_ATTENTE_VALIDATION"
  return db.workOrder.create({
    data: {
      property_id: rest.property_id,
      contractor_id: rest.contractor_id ?? null,
      titre: rest.titre,
      description: rest.description,
      type: rest.type,
      urgence: rest.urgence,
      imputable_a: rest.imputable_a,
      montant_devis: rest.montant_devis,
      notes_devis: rest.notes_devis,
      created_by: rest.created_by,
      statut,
    },
  })
}

export async function updateDevisStatut(id: string, statut: DevisStatut) {
  return db.workOrder.update({ where: { id }, data: { statut } })
}

export async function updateDevisMontant(
  id: string,
  data: { montant_devis: number; notes_devis?: string; seuil: number }
) {
  const statut: DevisStatut = data.montant_devis <= data.seuil ? "VALIDE" : "EN_ATTENTE_VALIDATION"
  return db.workOrder.update({
    where: { id },
    data: { montant_devis: data.montant_devis, notes_devis: data.notes_devis, statut },
  })
}

export async function getDevisStats() {
  const all = await db.workOrder.findMany({
    where: { statut: { in: ["EN_ATTENTE_DEVIS", "EN_ATTENTE_VALIDATION", "VALIDE", "ANNULE"] } },
    select: { statut: true, montant_devis: true },
  })
  return {
    total: all.filter((w) => w.statut !== "ANNULE").length,
    enAttente: all.filter((w) => w.statut === "EN_ATTENTE_DEVIS").length,
    aValider: all.filter((w) => w.statut === "EN_ATTENTE_VALIDATION").length,
    valides: all.filter((w) => w.statut === "VALIDE").length,
    montantTotal: all
      .filter((w) => w.statut !== "ANNULE")
      .reduce((s, w) => s + (w.montant_devis ?? 0), 0),
  }
}
