import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { auth } from "@/auth"
import { getDevisForOwnerPdf } from "@/lib/dal/travaux"
import { DevisPDF } from "@/lib/pdf/devis-template"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.ownerId) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const { id } = await params
  const devis = await getDevisForOwnerPdf(session.user.ownerId as string, id)
  if (!devis) {
    return new NextResponse("Devis introuvable", { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(DevisPDF, { devis }) as any
  const buffer = await renderToBuffer(element)

  const filename = `Devis-D-${devis.id.slice(-6).toUpperCase()}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
