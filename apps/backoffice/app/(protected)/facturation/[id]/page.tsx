import { notFound } from "next/navigation"
import Link from "next/link"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft } from "lucide-react"

export default async function FactureDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.numero_facture}
        actions={
          <Link href="/facturation" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Facture
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Propriétaire</span>
              <Link href={`/proprietaires/${invoice.owner.id}`} className="text-primary hover:underline">
                {invoice.owner.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Période</span>
              <span>
                {new Date(invoice.periode_debut).toLocaleDateString("fr-FR")} →{" "}
                {new Date(invoice.periode_fin).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={invoice.statut} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Montants
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant HT</span>
              <span>
                {invoice.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</span>
              <span>
                {(invoice.montant_ttc - invoice.montant_ht).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-3">
              <span className="text-foreground">Total TTC</span>
              <span className="text-foreground">
                {invoice.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {invoice.timeEntries.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Temps passé
          </h2>
          <div className="divide-y divide-border">
            {invoice.timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground w-24 shrink-0">
                  {new Date(entry.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="flex-1 text-foreground">{entry.description}</span>
                <span className="text-muted-foreground ml-4">
                  {entry.nb_heures}h × {entry.taux_horaire}€/h
                </span>
                <span className="font-semibold ml-4">
                  {entry.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
