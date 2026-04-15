"use server"

import { auth } from "@/auth"
import { getOwnerDocument } from "@/lib/dal/documents"
import { getPresignedDownloadUrl } from "@conciergerie/storage"

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const doc = await getOwnerDocument(session.user.ownerId, id)
  if (!doc) return { error: "Document introuvable ou accès refusé" }

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
