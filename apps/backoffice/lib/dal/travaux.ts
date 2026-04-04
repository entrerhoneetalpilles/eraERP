import { db } from "@conciergerie/db"

export async function getWorkOrders() {
  return db.workOrder.findMany({
    include: {
      property: { select: { id: true, nom: true } },
      contractor: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getWorkOrderById(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, nom: true } },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
  })
}

export async function createWorkOrder(
  created_by: string,
  data: {
    property_id: string
    contractor_id?: string
    titre: string
    description: string
    type: string
    urgence: "NORMALE" | "URGENTE" | "CRITIQUE"
    imputable_a: "PROPRIETAIRE" | "SOCIETE"
    notes?: string
  }
) {
  return db.workOrder.create({
    data: {
      ...data,
      created_by,
      statut: "OUVERT",
    },
  })
}

export async function updateWorkOrderStatut(
  id: string,
  statut:
    | "OUVERT"
    | "EN_COURS"
    | "EN_ATTENTE_DEVIS"
    | "EN_ATTENTE_VALIDATION"
    | "VALIDE"
    | "TERMINE"
    | "ANNULE"
) {
  return db.workOrder.update({ where: { id }, data: { statut } })
}

export async function getWorkOrderWithMandate(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          mandate: { select: { seuil_validation_devis: true } },
        },
      },
      contractor: { select: { id: true, nom: true, metier: true } },
    },
  })
}

export async function saveDevis(
  id: string,
  data: {
    montant_devis: number
    notes_devis?: string
    next_statut: "VALIDE" | "EN_ATTENTE_VALIDATION"
  }
) {
  return db.workOrder.update({
    where: { id },
    data: {
      montant_devis: data.montant_devis,
      notes_devis: data.notes_devis,
      statut: data.next_statut,
    },
  })
}
