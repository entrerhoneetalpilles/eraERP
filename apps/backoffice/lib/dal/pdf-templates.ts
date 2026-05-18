import { db } from "@conciergerie/db"
import type { PdfTemplateType } from "@/lib/pdf/template-types"

export async function getDefaultTemplate(type: PdfTemplateType) {
  return db.pdfTemplate.findFirst({
    where: { type, is_default: true },
  })
}

export async function getTemplatesByType(type: PdfTemplateType) {
  return db.pdfTemplate.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllTemplates() {
  return db.pdfTemplate.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  })
}

export async function createTemplate(data: {
  name: string
  type: string
  config: object
  is_default?: boolean
}) {
  if (data.is_default) {
    await db.pdfTemplate.updateMany({
      where: { type: data.type },
      data: { is_default: false },
    })
  }
  return db.pdfTemplate.create({ data })
}

export async function updateTemplate(
  id: string,
  data: { name?: string; config?: object; is_default?: boolean }
) {
  if (data.is_default) {
    const tpl = await db.pdfTemplate.findUnique({ where: { id } })
    if (tpl) {
      await db.pdfTemplate.updateMany({
        where: { type: tpl.type },
        data: { is_default: false },
      })
    }
  }
  return db.pdfTemplate.update({ where: { id }, data })
}

export async function deleteTemplate(id: string) {
  return db.pdfTemplate.delete({ where: { id } })
}
