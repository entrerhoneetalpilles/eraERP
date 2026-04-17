import { getPdfTemplates } from "@/lib/dal/pdf-templates"
import { PageHeader } from "@/components/ui/page-header"
import { TYPE_LABELS, TYPE_DESCRIPTIONS, TYPE_COLORS } from "@/lib/pdf/template-types"
import type { PdfTemplateType } from "@/lib/pdf/template-types"
import { TemplateListClient } from "./template-list-client"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

const ALL_TYPES: PdfTemplateType[] = ["FACTURE", "DEVIS", "MANDAT", "CONTRAT", "QUITTANCE"]

export default async function ModelesPage() {
  const templates = await getPdfTemplates()

  const byType = ALL_TYPES.map((type) => ({
    type,
    templates: templates.filter((t) => t.type === type),
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Modèles de documents"
        subtitle="Personnalisez la mise en page et le style de vos PDF"
        actions={<NewTemplateButton />}
      />

      {byType.map(({ type, templates: tpls }) => (
        <section key={type}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[type]}`}>
              {TYPE_LABELS[type]}
            </span>
            <p className="text-sm text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
          </div>

          {tpls.length === 0 ? (
            <EmptyTypeCard type={type} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tpls.map((tpl) => (
                <TemplateListClient
                  key={tpl.id}
                  id={tpl.id}
                  nom={tpl.nom}
                  type={tpl.type as PdfTemplateType}
                  isDefault={tpl.is_default}
                  updatedAt={tpl.updatedAt.toISOString()}
                />
              ))}
              <AddTemplateCard type={type} />
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

function NewTemplateButton() {
  return (
    <Link
      href="/modeles/new"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      Nouveau modèle
    </Link>
  )
}

function EmptyTypeCard({ type }: { type: PdfTemplateType }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Link
        href={`/modeles/new?type=${type}`}
        className="group flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/3 transition-all cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          Créer un modèle
        </p>
      </Link>
    </div>
  )
}

function AddTemplateCard({ type }: { type: PdfTemplateType }) {
  return (
    <Link
      href={`/modeles/new?type=${type}`}
      className="group flex flex-col items-center justify-center gap-2 h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/3 transition-all cursor-pointer"
    >
      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Ajouter</p>
    </Link>
  )
}
