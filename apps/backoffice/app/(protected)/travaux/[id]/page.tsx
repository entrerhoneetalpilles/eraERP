import { notFound } from "next/navigation"
import Link from "next/link"
import { getWorkOrderById } from "@/lib/dal/travaux"
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
  const wo = await getWorkOrderById(params.id)
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
                  className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Détails
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bien</span>
              <Link href={`/biens/${wo.property.id}`} className="text-primary hover:underline">
                {wo.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">{wo.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Urgence</span>
              <StatusBadge status={wo.urgence} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={wo.statut} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Imputable à</span>
              <span className="text-foreground">
                {wo.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société"}
              </span>
            </div>
            {wo.contractor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${wo.contractor.id}`} className="text-primary hover:underline">
                  {wo.contractor.nom}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Description
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{wo.description}</p>
          {wo.notes && (
            <>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide pt-4 border-t">
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wo.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
