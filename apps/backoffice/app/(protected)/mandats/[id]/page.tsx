import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandateById } from "@/lib/dal/mandates"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { SuspendMandateButton } from "./suspend-button"

export default async function MandateDetailPage({ params }: { params: { id: string } }) {
  const mandate = await getMandateById(params.id)
  if (!mandate) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Mandat ${mandate.numero_mandat}`}
        actions={<SuspendMandateButton id={mandate.id} statut={mandate.statut} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Parties
          </h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Propriétaire</span>
              <Link
                href={`/proprietaires/${mandate.owner.id}`}
                className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {mandate.owner.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Bien</span>
              <Link
                href={`/biens/${mandate.property.id}`}
                className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {mandate.property.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={mandate.statut} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Conditions financières
          </h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Taux honoraires gestion</span>
              <span className="text-sm font-semibold text-foreground">{mandate.taux_honoraires}%</span>
            </div>
            {mandate.honoraires_location != null && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Honoraires location</span>
                <span className="text-sm text-foreground font-medium">{mandate.honoraires_location}%</span>
              </div>
            )}
            {mandate.taux_horaire_ht != null && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Taux horaire HT</span>
                <span className="text-sm text-foreground font-medium">{mandate.taux_horaire_ht} €/h</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Seuil validation devis</span>
              <span className="text-sm text-foreground font-medium">{mandate.seuil_validation_devis} €</span>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Reconduction tacite</span>
              <span className="text-sm text-foreground font-medium">{mandate.reconduction_tacite ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-md border border-border p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Durée
        </h2>
        <div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Date de début</span>
            <span className="text-sm text-foreground font-medium">{new Date(mandate.date_debut).toLocaleDateString("fr-FR")}</span>
          </div>
          {mandate.date_fin && (
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Date de fin</span>
              <span className="text-sm text-foreground font-medium">{new Date(mandate.date_fin).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>
      </div>

      {mandate.avenants.length > 0 && (
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Avenants
          </h2>
          <div>
            {mandate.avenants.map((avenant) => (
              <div
                key={avenant.id}
                className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0"
              >
                <span className="font-medium text-foreground">Avenant n°{avenant.numero}</span>
                <span className="text-muted-foreground">
                  {new Date(avenant.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="text-foreground truncate max-w-xs">
                  {avenant.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
