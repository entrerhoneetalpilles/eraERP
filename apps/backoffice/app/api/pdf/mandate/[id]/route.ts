import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { getMandateById } from "@/lib/dal/mandates"
import { MandatePDF } from "@/lib/pdf/mandate-template"
import { auth } from "@/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const mandate = await getMandateById(params.id)
  if (!mandate) return new NextResponse("Mandat introuvable", { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(MandatePDF, { mandate }) as any
  const buffer = await renderToBuffer(element)

  const filename = `Mandat-${mandate.numero_mandat}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
