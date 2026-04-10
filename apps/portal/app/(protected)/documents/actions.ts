"use server"

import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { getPresignedDownloadUrl } from "@conciergerie/storage"

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const doc = await db.document.findUnique({ where: { id } })
  if (!doc) return { error: "Document introuvable" }

  if (doc.owner_id !== session.user.ownerId) return { error: "Accès refusé" }

  const publicBase = process.env.S3_PUBLIC_URL
  if (publicBase && doc.url_storage.startsWith(publicBase)) {
    return { url: doc.url_storage }
  }

  try {
    const urlParts = new URL(doc.url_storage)
    const key = urlParts.pathname.replace(/^\/[^/]+\//, "")
    const url = await getPresignedDownloadUrl(key, 900)
    return { url }
  } catch {
    return { url: doc.url_storage }
  }
}
