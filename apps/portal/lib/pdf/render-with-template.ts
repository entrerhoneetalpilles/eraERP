import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { getOwnerFeeInvoiceForPdf } from "@/lib/dal/factures"
import { getDefaultTemplate } from "@/lib/dal/pdf-templates"
import { DEFAULT_CONFIG } from "@/lib/pdf/template-types"
import type { TemplateConfig } from "@/lib/pdf/template-types"
import { DynamicPDF } from "@/lib/pdf/dynamic-template"
import type { SampleData } from "@/lib/pdf/dynamic-template"
import { InvoicePDF } from "@/lib/pdf/facture-template"

type Invoice = NonNullable<Awaited<ReturnType<typeof getOwnerFeeInvoiceForPdf>>>

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function invoiceToSampleData(invoice: Invoice): SampleData {
  const adresse = ((invoice.owner as any).adresse ?? {}) as {
    rue?: string
    complement?: string
    code_postal?: string
    ville?: string
  }
  const adresseLines = [
    adresse.rue ? `${adresse.rue}${adresse.complement ? `, ${adresse.complement}` : ""}` : null,
    adresse.code_postal && adresse.ville ? `${adresse.code_postal} ${adresse.ville}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return {
    ref: invoice.numero_facture,
    docTitle: "FACTURE",
    recipientName: invoice.owner.nom,
    recipientAddress: adresseLines,
    recipientEmail: invoice.owner.email ?? "",
    date: fmtDate(invoice.createdAt),
    period: `${fmtDate(invoice.periode_debut)} — ${fmtDate(invoice.periode_fin)}`,
    lineItems: invoice.lineItems.map((l) => ({
      description: l.description,
      qty: l.quantite,
      unit: l.unite,
      pu: l.prix_unitaire,
      total: l.montant_ht,
    })),
    totalHT: invoice.montant_ht,
    tva: invoice.tva_rate > 0 ? invoice.montant_ht * invoice.tva_rate : 0,
    totalTTC: invoice.montant_ttc,
    notes: invoice.notes_client ?? "",
  }
}

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const tpl = await getDefaultTemplate("FACTURE")
  if (tpl) {
    const stored = tpl.config as Partial<TemplateConfig>
    const config: TemplateConfig = {
      branding: { ...DEFAULT_CONFIG.branding, ...(stored.branding ?? {}) },
      header:   { ...DEFAULT_CONFIG.header,   ...(stored.header   ?? {}) },
      body:     { ...DEFAULT_CONFIG.body,     ...(stored.body     ?? {}) },
      table:    { ...DEFAULT_CONFIG.table,    ...(stored.table    ?? {}) },
      footer:   { ...DEFAULT_CONFIG.footer,   ...(stored.footer   ?? {}) },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(DynamicPDF, { config, type: "FACTURE", data: invoiceToSampleData(invoice) }) as any
    return renderToBuffer(element) as Promise<Buffer>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(createElement(InvoicePDF, { invoice }) as any) as Promise<Buffer>
}
