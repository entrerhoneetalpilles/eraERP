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
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">
            Parties
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Propriétaire</span>
              <Link
                href={`/proprietaires/${mandate.owner.id}`}
                className="text-olivier-600 hover:underline"
              >
                {mandate.owner.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Bien</span>
              <Link
                href={`/biens/${mandate.property.id}`}
                className="text-olivier-600 hover:underline"
              >
                {mandate.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Statut</span>
              <StatusBadge status={mandate.statut} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">
            Conditions financières
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Taux honoraires gestion</span>
              <span className="font-semibold">{mandate.taux_honoraires}%</span>
            </div>
            {mandate.honoraires_location != null && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Honoraires location</span>
                <span>{mandate.honoraires_location}%</span>
              </div>
            )}
            {mandate.taux_horaire_ht != null && (
              <div className="flex justify-between">
                <span className="text-garrigue-500">Taux horaire HT</span>
                <span>{mandate.taux_horaire_ht} €/h</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-garrigue-500">Seuil validation devis</span>
              <span>{mandate.seuil_validation_devis} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Reconduction tacite</span>
              <span>{mandate.reconduction_tacite ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4">
          Durée
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-garrigue-500">Date de début</span>
            <span>{new Date(mandate.date_debut).toLocaleDateString("fr-FR")}</span>
          </div>
          {mandate.date_fin && (
            <div className="flex justify-between">
              <span className="text-garrigue-500">Date de fin</span>
              <span>{new Date(mandate.date_fin).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>
      </div>

      {mandate.avenants.length > 0 && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4">
            Avenants
          </h2>
          <div className="space-y-2">
            {mandate.avenants.map((avenant) => (
              <div
                key={avenant.id}
                className="flex justify-between items-center text-sm py-2 border-b border-garrigue-50 last:border-0"
              >
                <span className="font-medium">Avenant n°{avenant.numero}</span>
                <span className="text-garrigue-500">
                  {new Date(avenant.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="text-garrigue-700 truncate max-w-xs">
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
