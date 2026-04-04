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
          <Link href={`/proprietaires/${owner.id}/edit`} className="cursor-pointer">
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        }
      />

      {/* Info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Informations
          </h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Type</span>
              <StatusBadge status={owner.type} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground font-medium">{owner.email}</span>
            </div>
            {owner.telephone && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Téléphone</span>
                <span className="text-sm text-foreground font-medium">{owner.telephone}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Adresse</span>
              <span className="text-sm text-foreground font-medium text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
            {owner.rib_iban && (
              <div className="flex items-center justify-between py-2 last:border-0">
                <span className="text-sm text-muted-foreground">IBAN</span>
                <span className="font-mono text-xs text-muted-foreground">{owner.rib_iban}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compte mandant */}
        {owner.mandantAccount && (
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Compte mandant
            </h2>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Solde courant</span>
              <span className="text-sm font-semibold text-foreground">
                {owner.mandantAccount.solde_courant.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mandats */}
      <div className="bg-card rounded-md border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Mandats ({owner.mandates.length})
          </h2>
          <Link href={`/mandats/new?owner=${owner.id}`} className="cursor-pointer">
            <Button size="sm" variant="outline">Nouveau mandat</Button>
          </Link>
        </div>
        {owner.mandates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun mandat</p>
        ) : (
          <div className="space-y-0.5">
            {owner.mandates.map((mandate) => (
              <Link
                key={mandate.id}
                href={`/mandats/${mandate.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer"
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
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Notes internes
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{owner.notes}</p>
        </div>
      )}
    </div>
  )
}
