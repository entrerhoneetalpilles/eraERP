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
            <Button size="sm" variant="outline" className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Informations
          </p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Métier</span>
              <span className="text-sm text-foreground font-medium">{prestataire.metier}</span>
            </div>
            {prestataire.email && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground">{prestataire.email}</span>
              </div>
            )}
            {prestataire.telephone && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Téléphone</span>
                <span className="text-sm text-foreground">{prestataire.telephone}</span>
              </div>
            )}
            {prestataire.siret && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">SIRET</span>
                <span className="font-mono text-xs text-foreground">{prestataire.siret}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Statut</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  prestataire.actif
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {prestataire.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Statistiques
          </p>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Ordres de travaux</span>
            <span className="text-sm text-foreground font-semibold tabular-nums">
              {prestataire.workOrders.length}
            </span>
          </div>
        </div>
      </div>

      {prestataire.workOrders.length > 0 && (
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Ordres de travaux récents
          </p>
          <div className="divide-y divide-border">
            {prestataire.workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/travaux/${wo.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer"
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
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Notes
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{prestataire.notes}</p>
        </div>
      )}
    </div>
  )
}
