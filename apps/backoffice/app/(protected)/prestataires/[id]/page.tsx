import { notFound } from "next/navigation"
import Link from "next/link"
import { getPrestataireById } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit } from "lucide-react"

export default async function PrestataireDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const prestataire = await getPrestataireById(params.id)
  if (!prestataire) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={prestataire.nom}
        actions={
          <Link href={`/prestataires/${prestataire.id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Informations
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Métier</span>
              <span className="text-foreground font-medium">{prestataire.metier}</span>
            </div>
            {prestataire.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{prestataire.email}</span>
              </div>
            )}
            {prestataire.telephone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="text-foreground">{prestataire.telephone}</span>
              </div>
            )}
            {prestataire.siret && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SIRET</span>
                <span className="font-mono text-xs text-foreground">{prestataire.siret}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  prestataire.actif
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {prestataire.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Statistiques
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ordres de travaux</span>
              <span className="text-foreground font-semibold">{prestataire.workOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {prestataire.workOrders.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Ordres de travaux récents
          </h2>
          <div className="divide-y divide-border">
            {prestataire.workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/travaux/${wo.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{wo.titre}</p>
                  <p className="text-xs text-muted-foreground">{wo.property.nom}</p>
                </div>
                <StatusBadge status={wo.statut} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {prestataire.notes && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            Notes
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{prestataire.notes}</p>
        </div>
      )}
    </div>
  )
}
