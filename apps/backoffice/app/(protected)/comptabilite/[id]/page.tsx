import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandantAccountById } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft } from "lucide-react"

const TX_TYPE_LABELS: Record<string, string> = {
  REVENU_SEJOUR: "Revenu séjour",
  HONORAIRES: "Honoraires",
  TRAVAUX: "Travaux",
  REVERSEMENT: "Reversement",
  CHARGE: "Charge",
  AUTRE: "Autre",
}

export default async function CompteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const account = await getMandantAccountById(params.id)
  if (!account) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Compte — ${account.owner.nom}`}
        actions={
          <Link
            href="/comptabilite"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        }
      />

      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Solde courant</p>
          <p
            className={`text-2xl font-semibold mt-1 ${
              account.solde_courant >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {account.solde_courant.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Séquestre</p>
          <p className="text-2xl font-semibold mt-1 text-foreground">
            {account.solde_sequestre.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Nb transactions</p>
          <p className="text-2xl font-semibold mt-1 text-foreground">
            {account.transactions.length}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          Dernières transactions
        </h2>
        {account.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune transaction</p>
        ) : (
          <div className="divide-y divide-border">
            {account.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-24 shrink-0">
                    {new Date(tx.date).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-foreground">{tx.libelle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {TX_TYPE_LABELS[tx.type] ?? tx.type}
                  </span>
                  <StatusBadge status={tx.statut} />
                  <span
                    className={`font-semibold w-28 text-right ${
                      tx.montant >= 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {tx.montant >= 0 ? "+" : ""}
                    {tx.montant.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapports CRG */}
      {account.reports.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Comptes rendus de gestion (CRG)
          </h2>
          <div className="divide-y divide-border">
            {account.reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">
                  {new Date(report.periode_debut).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-foreground">
                  Revenus :{" "}
                  {report.revenus_sejours.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
                <span className="text-muted-foreground">
                  Honoraires :{" "}
                  {report.honoraires_deduits.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
                <span className="font-semibold text-foreground">
                  Reversé :{" "}
                  {report.montant_reverse.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
