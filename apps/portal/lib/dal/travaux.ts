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
      property: { select: { nom: true } },
      contractor: { select: { nom: true, metier: true, telephone: true } },
    },
  })
}

export async function getDevisForOwnerPdf(ownerId: string, devisId: string) {
  return db.workOrder.findFirst({
    where: {
      id: devisId,
      property: { mandate: { owner_id: ownerId } },
    },
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
