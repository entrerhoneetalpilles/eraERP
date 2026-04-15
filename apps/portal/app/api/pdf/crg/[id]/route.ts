import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { auth } from "@/auth"
import { getOwnerReportForPdf } from "@/lib/dal/crg"
import { CrgPDF } from "@/lib/pdf/crg-template"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.ownerId) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const ownerId = session.user.ownerId as string
  const { id } = await params

  const report = await getOwnerReportForPdf(ownerId, id)
  if (!report) {
    return new NextResponse("CRG introuvable", { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CrgPDF, { report }) as any
  const buffer = await renderToBuffer(element)

  const mois = new Date(report.periode_debut).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  const safe = (s: string) =>
    s.normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-zA-Z0-9-]/g, "-")
     .replace(/-{2,}/g, "-")
     .replace(/^-|-$/g, "")
  const filename = `CRG-${safe(mois)}-${safe(report.account.owner.nom)}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
