import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getOwnerFeeInvoiceForPdf } from "@/lib/dal/factures"
import { renderInvoicePdf } from "@/lib/pdf/render-with-template"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.ownerId) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const { id } = await params
  const invoice = await getOwnerFeeInvoiceForPdf(session.user.ownerId as string, id)
  if (!invoice) {
    return new NextResponse("Facture introuvable", { status: 404 })
  }

  const buffer = await renderInvoicePdf(invoice)

  const filename = `Facture-${invoice.numero_facture}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
