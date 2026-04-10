import { db } from "@conciergerie/db"
import type { DocumentType } from "@conciergerie/db"

export async function getOwnerDocuments(ownerId: string, type?: DocumentType) {
  return db.document.findMany({
    where: {
      owner_id: ownerId,
      entity_type: { not: "message" },
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
}
