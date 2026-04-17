import { notFound } from "next/navigation"
import { getPdfTemplateById } from "@/lib/dal/pdf-templates"
import { DEFAULT_CONFIG, type TemplateConfig, type PdfTemplateType } from "@/lib/pdf/template-types"
import { TemplateEditor } from "./template-editor"

interface Props {
  params: { id: string }
}

export default async function TemplatePage({ params }: Props) {
  const tpl = await getPdfTemplateById(params.id)
  if (!tpl) notFound()

  const config = (tpl.config ?? DEFAULT_CONFIG) as TemplateConfig

  return (
    <TemplateEditor
      id={tpl.id}
      nom={tpl.nom}
      type={tpl.type as PdfTemplateType}
      initialConfig={config}
    />
  )
}
