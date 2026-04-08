import { db } from "@conciergerie/db"

export type DocumentType =
  | "MANDAT" | "AVENANT" | "DEVIS" | "FACTURE" | "CRG"
  | "ETAT_LIEUX" | "ATTESTATION_FISCALE" | "PHOTO" | "DIAGNOSTIC" | "AUTRE"

export interface CreateDocumentInput {
  nom: string
  type: DocumentType
  url_storage: string
  mime_type: string
  taille: number
  entity_type: string
  entity_id: string
  uploaded_by: string
  owner_id?: string
  mandate_id?: string
  contractor_id?: string
  booking_id?: string
}

export async function getDocuments(filters?: {
  type?: DocumentType
  owner_id?: string
  mandate_id?: string
  entity_type?: string
  search?: string
}) {
  return db.document.findMany({
    where: {
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.owner_id ? { owner_id: filters.owner_id } : {}),
      ...(filters?.mandate_id ? { mandate_id: filters.mandate_id } : {}),
      ...(filters?.entity_type ? { entity_type: filters.entity_type } : {}),
      ...(filters?.search
        ? { nom: { contains: filters.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, nom: true } },
      mandate: { select: { id: true, numero_mandat: true } },
    },
  })
}

export async function getDocumentById(id: string) {
  return db.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, nom: true } },
      mandate: { select: { id: true, numero_mandat: true } },
    },
  })
}

export async function createDocument(data: CreateDocumentInput) {
  return db.document.create({ data })
}

export async function deleteDocument(id: string) {
  return db.document.delete({ where: { id } })
}

export async function getDocumentCounts() {
  const all = await db.document.groupBy({
    by: ["type"],
    _count: { id: true },
  })
  const total = all.reduce((acc, g) => acc + g._count.id, 0)
  const byType: Record<string, number> = {}
  for (const g of all) byType[g.type] = g._count.id
  return { total, byType }
}
