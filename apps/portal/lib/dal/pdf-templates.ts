import { db } from "@conciergerie/db"
import type { PdfTemplateType } from "@/lib/pdf/template-types"

export async function getDefaultTemplate(type: PdfTemplateType) {
  return db.pdfTemplate.findFirst({ where: { type, is_default: true } })
}
