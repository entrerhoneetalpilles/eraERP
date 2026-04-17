import { db } from "@conciergerie/db"
import type { TemplateConfig, PdfTemplateType } from "@/lib/pdf/template-types"
import { DEFAULT_CONFIG } from "@/lib/pdf/template-types"

export async function getPdfTemplates() {
  return db.pdfTemplate.findMany({ orderBy: [{ type: "asc" }, { nom: "asc" }] })
}

export async function getPdfTemplateById(id: string) {
  return db.pdfTemplate.findUnique({ where: { id } })
}

export async function getDefaultTemplate(type: PdfTemplateType) {
  return (
    (await db.pdfTemplate.findFirst({ where: { type, is_default: true } })) ??
    (await db.pdfTemplate.findFirst({ where: { type }, orderBy: { updatedAt: "desc" } }))
  )
}

export async function createPdfTemplate(data: {
  nom: string
  type: PdfTemplateType
  config?: TemplateConfig
}) {
  return db.pdfTemplate.create({
    data: {
      nom: data.nom,
      type: data.type,
      config: (data.config ?? DEFAULT_CONFIG) as object,
    },
  })
}

export async function updatePdfTemplate(id: string, data: { nom?: string; config?: TemplateConfig }) {
  return db.pdfTemplate.update({
    where: { id },
    data: {
      ...(data.nom !== undefined ? { nom: data.nom } : {}),
      ...(data.config !== undefined ? { config: data.config as object } : {}),
    },
  })
}

export async function setDefaultTemplate(id: string, type: PdfTemplateType) {
  await db.pdfTemplate.updateMany({ where: { type }, data: { is_default: false } })
  return db.pdfTemplate.update({ where: { id }, data: { is_default: true } })
}

export async function deletePdfTemplate(id: string) {
  return db.pdfTemplate.delete({ where: { id } })
}

export async function duplicatePdfTemplate(id: string) {
  const source = await getPdfTemplateById(id)
  if (!source) throw new Error("Template introuvable")
  return db.pdfTemplate.create({
    data: {
      nom: `${source.nom} (copie)`,
      type: source.type,
      config: source.config as object,
      is_default: false,
    },
  })
}
