import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { InvoicePDF } from "@/lib/pdf/invoice-template"
import { auth } from "@/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) return new NextResponse("Facture introuvable", { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(InvoicePDF, { invoice }) as any
  const buffer = await renderToBuffer(element)

  const filename = `Facture-${invoice.numero_facture}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
