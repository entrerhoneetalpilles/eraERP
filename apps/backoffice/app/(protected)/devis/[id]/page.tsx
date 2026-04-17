import { notFound } from "next/navigation"
import Link from "next/link"
import { getDevisById } from "@/lib/dal/devis"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Building2, User, Wrench, Euro, FileText, ArrowLeft } from "lucide-react"
import { DevisActions } from "./devis-actions"

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const URGENCE_LABELS: Record<string, string> = {
  NORMALE: "Normale",
  URGENTE: "Urgente",
  CRITIQUE: "Critique",
}

export default async function DevisDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const devis = await getDevisById(params.id)
  if (!devis) notFound()

  const owner = devis.property.mandate?.owner
  const ref = `D-${devis.id.slice(-6).toUpperCase()}`
  const pdfUrl = `/api/pdf/devis/${devis.id}`
  const canValidate = devis.statut === "EN_ATTENTE_VALIDATION" || devis.statut === "EN_ATTENTE_DEVIS"
  const canSend = devis.statut === "EN_ATTENTE_VALIDATION"
  const canCancel = devis.statut !== "ANNULE" && devis.statut !== "VALIDE"

  return (
    <div className="space-y-6">
      <PageHeader
        title={devis.titre}
        description={
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{ref}</span>
            <StatusBadge status={devis.statut} />
          </span>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={pdfUrl} target="_blank">
              <Button size="sm" variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </Link>
            <DevisActions
              devisId={devis.id}
              canValidate={canValidate}
              canSend={canSend}
              canCancel={canCancel}
              ownerEmail={owner?.email ?? null}
            />
          </div>
        }
      />

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bien + Propriétaire */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Bien
          </h2>
          <Link href={`/biens/${devis.property.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            {devis.property.nom}
          </Link>
          {devis.property.mandate && (
            <p className="text-xs text-muted-foreground mt-1">
              Mandat {devis.property.mandate.numero_mandat}
            </p>
          )}
          {owner && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                <User className="w-3 h-3" /> Propriétaire
              </p>
              <p className="text-sm font-medium">{owner.nom}</p>
              <p className="text-xs text-muted-foreground">{owner.email}</p>
            </div>
          )}
        </div>

        {/* Travaux */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            Travaux
          </h2>
          <div className="space-y-2">
            {[
              { label: "Type", value: devis.type },
              { label: "Urgence", value: URGENCE_LABELS[devis.urgence] ?? devis.urgence },
              { label: "Imputé à", value: devis.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société" },
              {
                label: "Créé le",
                value: new Date(devis.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Montant */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Euro className="w-3.5 h-3.5" />
            Montant
          </h2>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {devis.montant_devis != null ? fmt(devis.montant_devis) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">HT — TVA non applicable</p>
          {devis.property.mandate && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              Seuil d&apos;approbation : {fmt(devis.property.mandate.seuil_validation_devis)}
              {devis.montant_devis != null && devis.montant_devis <= devis.property.mandate.seuil_validation_devis ? (
                <span className="ml-1 text-emerald-600 font-medium">✓ dans le seuil</span>
              ) : (
                <span className="ml-1 text-amber-600 font-medium">⚠ dépasse le seuil</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Description + Notes */}
      {(devis.description || devis.notes_devis) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devis.description && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Description</h2>
              <p className="text-sm text-foreground whitespace-pre-wrap">{devis.description}</p>
            </div>
          )}
          {devis.notes_devis && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notes internes</h2>
              <p className="text-sm text-foreground whitespace-pre-wrap">{devis.notes_devis}</p>
            </div>
          )}
        </div>
      )}

      {/* Prestataire */}
      {devis.contractor && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Prestataire</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold">{devis.contractor.nom}</p>
              <p className="text-xs text-muted-foreground">{devis.contractor.metier}</p>
            </div>
            {devis.contractor.email && (
              <a href={`mailto:${devis.contractor.email}`} className="text-xs text-primary hover:underline ml-auto">
                {devis.contractor.email}
              </a>
            )}
          </div>
        </div>
      )}

      <Link href="/devis" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour aux devis
      </Link>
    </div>
  )
}
