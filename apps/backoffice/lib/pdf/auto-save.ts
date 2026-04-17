import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"
import { DevisPDF } from "./devis-template"
import { MandatePDF } from "./mandate-template"
import { CrgPDF } from "./crg-template"
import { getDevisById } from "@/lib/dal/devis"
import { getMandateById } from "@/lib/dal/mandates"
import { getManagementReportById } from "@/lib/dal/crg"

export async function saveDevisPdfToDocuments(devisId: string) {
  const devis = await getDevisById(devisId)
  if (!devis) throw new Error("Devis introuvable")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(DevisPDF, { devis }) as any
  const buffer = await renderToBuffer(element)

  const ref = devis.id.slice(-6).toUpperCase()
  const key = buildStorageKey({
    entityType: "work_order",
    entityId: devis.id,
    folder: "devis",
    fileName: `Devis-${ref}-${Date.now()}.pdf`,
  })

  const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

  await createDocument({
    nom: `Devis D-${ref}.pdf`,
    type: "DEVIS",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "work_order",
    entity_id: devis.id,
    uploaded_by: "system",
    owner_id: devis.property.mandate?.owner?.id,
  })
}

export async function saveMandatePdfSystem(mandateId: string) {
  const mandate = await getMandateById(mandateId)
  if (!mandate) throw new Error("Mandat introuvable")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(MandatePDF, { mandate }) as any
  const buffer = await renderToBuffer(element)

  const key = buildStorageKey({
    entityType: "mandate",
    entityId: mandate.id,
    folder: "mandat",
    fileName: `Mandat-${mandate.numero_mandat}-${Date.now()}.pdf`,
  })

  const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

  await createDocument({
    nom: `Mandat ${mandate.numero_mandat}.pdf`,
    type: "MANDAT",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "mandate",
    entity_id: mandate.id,
    uploaded_by: "system",
    owner_id: mandate.owner_id,
    mandate_id: mandate.id,
  })
}

export async function saveCrgPdfToDocuments(reportId: string) {
  const report = await getManagementReportById(reportId)
  if (!report) throw new Error("CRG introuvable")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CrgPDF, { report }) as any
  const buffer = await renderToBuffer(element)

  const owner = report.account.owner
  const mois = new Date(report.periode_debut).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })
  const key = buildStorageKey({
    entityType: "management_report",
    entityId: report.id,
    folder: "crg",
    fileName: `CRG-${mois}-${owner.nom.replace(/\s+/g, "-")}-${Date.now()}.pdf`,
  })

  const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

  await createDocument({
    nom: `CRG ${mois} — ${owner.nom}.pdf`,
    type: "CRG",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "management_report",
    entity_id: report.id,
    uploaded_by: "system",
    owner_id: owner.id,
  })
}
