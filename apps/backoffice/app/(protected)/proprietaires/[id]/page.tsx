import { notFound } from "next/navigation"
import Link from "next/link"
import { getOwnerById } from "@/lib/dal/owners"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit, Building2, FileText } from "lucide-react"

export default async function OwnerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const owner = await getOwnerById(params.id)
  if (!owner) notFound()

  const adresse = owner.adresse as any

  return (
    <div className="space-y-6">
      <PageHeader
        title={owner.nom}
        actions={
          <Link href={`/proprietaires/${owner.id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      {/* Info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Informations
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <StatusBadge status={owner.type} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{owner.email}</span>
            </div>
            {owner.telephone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="text-foreground">{owner.telephone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Adresse</span>
              <span className="text-foreground text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
            {owner.rib_iban && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN</span>
                <span className="font-mono text-xs text-muted-foreground">{owner.rib_iban}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compte mandant */}
        {owner.mandantAccount && (
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Compte mandant
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Solde courant</span>
                <span className="font-semibold text-foreground">
                  {owner.mandantAccount.solde_courant.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Mandats ({owner.mandates.length})
          </h2>
          <Link href={`/mandats/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline">Nouveau mandat</Button>
          </Link>
        </div>
        {owner.mandates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun mandat</p>
        ) : (
          <div className="space-y-2">
            {owner.mandates.map((mandate) => (
              <Link
                key={mandate.id}
                href={`/mandats/${mandate.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {mandate.property.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mandat n° {mandate.numero_mandat}
                  </p>
                </div>
                <StatusBadge status={mandate.statut} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {owner.notes && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes internes
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{owner.notes}</p>
        </div>
      )}
    </div>
  )
}
