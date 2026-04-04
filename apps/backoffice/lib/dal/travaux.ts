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
