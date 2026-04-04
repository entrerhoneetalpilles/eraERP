import { notFound } from "next/navigation"
import Link from "next/link"
import { getWorkOrderWithMandate } from "@/lib/dal/travaux"
import { DevisForm } from "./devis-form"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateWorkOrderStatutAction } from "./actions"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: string }>> = {
  OUVERT: [
    { label: "Démarrer", value: "EN_COURS" },
    { label: "Demander devis", value: "EN_ATTENTE_DEVIS" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_COURS: [
    { label: "Terminer", value: "TERMINE" },
    { label: "Mettre en attente", value: "EN_ATTENTE_VALIDATION" },
  ],
  EN_ATTENTE_DEVIS: [
    { label: "Valider", value: "VALIDE" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_ATTENTE_VALIDATION: [
    { label: "Valider", value: "VALIDE" },
    { label: "Refuser", value: "ANNULE" },
  ],
  VALIDE: [{ label: "Démarrer", value: "EN_COURS" }],
  TERMINE: [],
  ANNULE: [],
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const wo = await getWorkOrderWithMandate(params.id)
  if (!wo) notFound()

  const actions = NEXT_STATUTS[wo.statut] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={wo.titre}
        actions={
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <form
                key={action.value}
                action={updateWorkOrderStatutAction.bind(null, wo.id, action.value as any)}
              >
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors duration-100 cursor-pointer"
                >
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Détails
          </p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Bien</span>
              <Link href={`/biens/${wo.property.id}`} className="text-sm font-medium text-primary hover:underline cursor-pointer">
                {wo.property.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm text-foreground font-medium">{wo.type}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Urgence</span>
              <StatusBadge status={wo.urgence} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={wo.statut} />
            </div>
            <div className={`flex items-center justify-between py-2 ${wo.contractor ? "border-b border-border" : ""}`}>
              <span className="text-sm text-muted-foreground">Imputable à</span>
              <span className="text-sm text-foreground font-medium">
                {wo.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société"}
              </span>
            </div>
            {wo.contractor && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${wo.contractor.id}`} className="text-sm font-medium text-primary hover:underline cursor-pointer">
                  {wo.contractor.nom}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Description
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{wo.description}</p>
          {wo.notes && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-5 mb-3 pt-4 border-t border-border">
                Notes
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wo.notes}</p>
            </>
          )}
        </div>
      </div>

      {wo.statut === "EN_ATTENTE_DEVIS" && (
        <DevisForm
          workOrderId={wo.id}
          montantDevisActuel={wo.montant_devis ?? null}
          notesDevisActuel={wo.notes_devis ?? null}
          seuil={wo.property.mandate?.seuil_validation_devis ?? 500}
        />
      )}
      {wo.montant_devis != null && wo.statut !== "EN_ATTENTE_DEVIS" && (
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Devis
          </p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">Montant HT</span>
              <span className="text-sm text-foreground font-semibold tabular-nums">
                {wo.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            {wo.notes_devis && (
              <p className="text-sm text-muted-foreground pt-2">{wo.notes_devis}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
