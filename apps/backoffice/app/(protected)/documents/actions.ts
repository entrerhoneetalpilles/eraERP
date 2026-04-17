"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { createDocument, deleteDocument, getDocumentById, getDocuments, type DocumentType } from "@/lib/dal/documents"
import {
  buildStorageKey,
  uploadFile,
  deleteFile,
  getPresignedDownloadUrl,
  extractStorageKey,
} from "@conciergerie/storage"
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { MandatePDF } from "@/lib/pdf/mandate-template"
import { getMandateById } from "@/lib/dal/mandates"

// ─── Upload ────────────────────────────────────────────────────────────────────

export async function uploadDocumentAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "Aucun fichier fourni" }

  const type = (formData.get("type") as DocumentType) || "AUTRE"
  const entity_type = (formData.get("entity_type") as string) || "document"
  const entity_id = (formData.get("entity_id") as string) || "misc"
  const owner_id = (formData.get("owner_id") as string) || undefined
  const mandate_id = (formData.get("mandate_id") as string) || undefined
  const date_expiration_raw = formData.get("date_expiration") as string | null
  const date_expiration = date_expiration_raw ? new Date(date_expiration_raw) : undefined

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const key = buildStorageKey({
    entityType: entity_type,
    entityId: entity_id,
    folder: type.toLowerCase(),
    fileName: `${Date.now()}-${safeName}`,
  })

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadFile({ key, body: buffer, contentType: file.type })

  const doc = await createDocument({
    nom: file.name,
    type,
    url_storage: url,
    mime_type: file.type,
    taille: file.size,
    entity_type,
    entity_id,
    uploaded_by: session.user.email ?? "system",
    owner_id: owner_id || undefined,
    mandate_id: mandate_id || undefined,
    date_expiration,
  })

  revalidatePath("/documents")
  return { success: true, document: doc }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteDocumentAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const doc = await getDocumentById(id)
  if (!doc) return { error: "Document introuvable" }

  // Extract S3 key from url
  try {
    const key = extractStorageKey(doc.url_storage)
    await deleteFile(key)
  } catch {
    // Storage deletion failed silently — keep DB record deletion
  }

  await deleteDocument(id)
  revalidatePath("/documents")
  return { success: true }
}

// ─── Presigned view URL ────────────────────────────────────────────────────────

export async function getDocumentViewUrlAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const doc = await getDocumentById(id)
  if (!doc) return { error: "Document introuvable" }

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

// ─── Fetch live (pour refresh client-side) ────────────────────────────────────

export async function fetchDocumentsAction(filters?: {
  type?: DocumentType
  search?: string
}) {
  return getDocuments(filters)
}

// ─── List owners for upload dialog ────────────────────────────────────────────

export async function listOwnersForSelectAction() {
  const session = await auth()
  if (!session?.user) return []
  return db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })
}

// ─── Generate mandate PDF ──────────────────────────────────────────────────────

export async function saveMandatePdfAction(mandateId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const mandate = await getMandateById(mandateId)
  if (!mandate) return { error: "Mandat introuvable" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(MandatePDF, { mandate }) as any
  const buffer = await renderToBuffer(element)

  const filename = `Mandat-${mandate.numero_mandat}-${Date.now()}.pdf`
  const key = buildStorageKey({
    entityType: "mandate",
    entityId: mandate.id,
    folder: "mandat",
    fileName: filename,
  })

  console.log('[saveMandatePdf] uploading key:', key, '| buffer size:', buffer.byteLength)
  const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })
  console.log('[saveMandatePdf] uploaded, url_storage:', url)

  const doc = await createDocument({
    nom: `Mandat ${mandate.numero_mandat}.pdf`,
    type: "MANDAT",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "mandate",
    entity_id: mandate.id,
    uploaded_by: session.user.email ?? "system",
    owner_id: mandate.owner_id,
    mandate_id: mandate.id,
  })

  revalidatePath(`/mandats/${mandateId}`)
  revalidatePath("/documents")

  return { success: true, document: doc, url }
}
