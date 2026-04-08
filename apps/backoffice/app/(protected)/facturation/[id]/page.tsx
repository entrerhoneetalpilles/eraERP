import { notFound } from "next/navigation"
import Link from "next/link"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft } from "lucide-react"
import { InvoiceActions } from "./invoice-actions"

export default async function FactureDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) notFound()

  const tvaAmount = invoice.montant_ttc - invoice.montant_ht

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.numero_facture}
        description={`Créée le ${new Date(invoice.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/facturation" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            <InvoiceActions id={invoice.id} statut={invoice.statut as any} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infos facture */}
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Facture
          </p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">N° Facture</span>
              <span className="text-sm font-mono font-medium text-foreground">{invoice.numero_facture}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Propriétaire</span>
              <Link href={`/proprietaires/${invoice.owner.id}`} className="text-sm font-medium text-foreground hover:text-primary cursor-pointer">
                {invoice.owner.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Période</span>
              <span className="text-sm text-foreground font-medium">
                {new Date(invoice.periode_debut).toLocaleDateString("fr-FR")} →{" "}
                {new Date(invoice.periode_fin).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={invoice.statut} />
            </div>
          </div>
        </div>

        {/* Montants */}
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Montants
          </p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Montant HT</span>
              <span className="text-sm text-foreground font-medium">
                {invoice.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</span>
              <span className="text-sm text-foreground font-medium">
                {tvaAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border mt-1">
              <span className="text-sm font-semibold text-foreground">Total TTC</span>
              <span className="text-lg font-semibold text-foreground">
                {invoice.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {invoice.timeEntries.length > 0 && (
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Temps passé
          </p>
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
                <span className="font-semibold ml-4 text-foreground">
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
