"use server"

import { auth } from "@/auth"
import { getOwnerDocument } from "@/lib/dal/documents"
import { extractStorageKey, getPresignedDownloadUrl } from "@conciergerie/storage"

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const doc = await getOwnerDocument(session.user.ownerId, id)
  if (!doc) return { error: "Document introuvable ou accès refusé" }

  try {
    // Always presign — R2 buckets are private even when S3_PUBLIC_URL is set.
    // extractStorageKey handles single-bucket and double-bucket URL shapes.
    const key = extractStorageKey(doc.url_storage)
    const url = await getPresignedDownloadUrl(key, 900) // 15 min
    return { url }
  } catch (e) {
    console.error("[getDocumentViewUrl] presign error:", e)
    return { error: "Impossible de générer le lien de téléchargement" }
  }
}
