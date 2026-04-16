import { db } from "@conciergerie/db"

export async function getPendingDevisForOwner(ownerId: string) {
  return db.workOrder.findMany({
    where: {
      statut: "EN_ATTENTE_VALIDATION",
      property: { mandate: { owner_id: ownerId } },
    },
    include: {
      property: { select: { nom: true } },
      contractor: { select: { nom: true, metier: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getWorkOrderForOwner(ownerId: string, workOrderId: string) {
  return db.workOrder.findFirst({
    where: {
      id: workOrderId,
      property: { mandate: { owner_id: ownerId } },
    },
    include: {
      property: { select: { nom: true, adresse: true } },
      contractor: { select: { nom: true, metier: true, telephone: true } },
    },
  })
}
