import { PageHeader } from "@/components/ui/page-header"
import { NewTemplateForm } from "./new-template-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { PdfTemplateType } from "@/lib/pdf/template-types"
import { TYPE_LABELS } from "@/lib/pdf/template-types"

interface Props {
  searchParams: { type?: string }
}

export default function NewModelePage({ searchParams }: Props) {
  const preType = (searchParams.type as PdfTemplateType) || undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau modèle"
        actions={
          <Link
            href="/modeles"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        }
      />

      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Configurer le modèle</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un type et un nom. Vous pourrez personnaliser la mise en page dans l&apos;éditeur.
            </p>
          </div>
          <NewTemplateForm preType={preType} typeLabels={TYPE_LABELS} />
        </div>
      </div>
    </div>
  )
}
