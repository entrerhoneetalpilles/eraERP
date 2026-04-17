import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { getDevisById } from "@/lib/dal/devis"
import { DevisPDF } from "@/lib/pdf/devis-template"
import { auth } from "@/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const devis = await getDevisById(params.id)
  if (!devis) return new NextResponse("Devis introuvable", { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(DevisPDF, { devis }) as any
  const buffer = await renderToBuffer(element)

  const ref = `D-${devis.id.slice(-6).toUpperCase()}`
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Devis-${ref}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
