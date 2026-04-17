import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { auth } from "@/auth"
import { DynamicPDF } from "@/lib/pdf/dynamic-template"
import type { TemplateConfig, PdfTemplateType } from "@/lib/pdf/template-types"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 })

  const { config, type } = (await req.json()) as { config: TemplateConfig; type: PdfTemplateType }
  if (!config || !type) return new NextResponse("Paramètres manquants", { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(DynamicPDF, { config, type }) as any
  const buffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  })
}
