import { db } from "@conciergerie/db"
import type { DocumentType } from "@conciergerie/db"

export async function getOwnerDocuments(ownerId: string, type?: DocumentType) {
  return db.document.findMany({
    where: {
      entity_type: { not: "message" },
      ...(type ? { type } : {}),
      OR: [
        { owner_id: ownerId },
        { mandate: { owner_id: ownerId } },
        { booking: { property: { mandate: { owner_id: ownerId } } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOwnerDocument(ownerId: string, documentId: string) {
  return db.document.findFirst({
    where: {
      id: documentId,
      OR: [
        { owner_id: ownerId },
        { mandate: { owner_id: ownerId } },
        { booking: { property: { mandate: { owner_id: ownerId } } } },
      ],
    },
  })
}
