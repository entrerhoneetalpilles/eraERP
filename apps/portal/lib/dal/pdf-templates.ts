import { db } from "@conciergerie/db"
import type { PdfTemplateType } from "@/lib/pdf/template-types"

export async function getDefaultTemplate(type: PdfTemplateType) {
  return (
    (await db.pdfTemplate.findFirst({ where: { type, is_default: true } })) ??
    (await db.pdfTemplate.findFirst({ where: { type }, orderBy: { updatedAt: "desc" } }))
  )
}
