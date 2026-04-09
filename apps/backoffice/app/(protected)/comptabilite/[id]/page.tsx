import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandantAccountById, getMandantAccountKpis } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Clock, ArrowUpRight, FileText, Download } from "lucide-react"
import { ExportCsvButton } from "./export-csv-button"

const TX_TYPE_LABELS: Record<string, string> = {
  REVENU_SEJOUR: "Revenu séjour", HONORAIRES: "Honoraires", TRAVAUX: "Travaux",
  REVERSEMENT: "Reversement", CHARGE: "Charge", AUTRE: "Autre",
}
const TX_TYPE_COLORS: Record<string, string> = {
  REVENU_SEJOUR: "text-emerald-600", HONORAIRES: "text-orange-600", TRAVAUX: "text-orange-600",
  REVERSEMENT: "text-blue-600", CHARGE: "text-red-600", AUTRE: "text-muted-foreground",
}

function fmt(n: number, signed = false) {
  const f = Math.abs(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
  if (!signed) return f
  return n >= 0 ? `+${f}` : `−${f}`
}

export default async function CompteDetailPage({ params }: { params: { id: string } }) {
  const [account, kpis] = await Promise.all([
    getMandantAccountById(params.id),
    getMandantAccountKpis(params.id),
  ])
  if (!account) notFound()

  const totalDebits = account.transactions.filter(t => t.montant < 0).reduce((s, t) => s + t.montant, 0)
  const totalCredits = account.transactions.filter(t => t.montant > 0).reduce((s, t) => s + t.montant, 0)
  const evolution = kpis.revenuMoisPrecedent > 0
    ? Math.round(((kpis.revenuCeMois - kpis.revenuMoisPrecedent) / kpis.revenuMoisPrecedent) * 100)
    : null

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/comptabilite" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm cursor-pointer"><ArrowLeft className="w-4 h-4" />Comptabilité</Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-base font-semibold text-foreground">{account.owner.nom}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/proprietaires/${account.owner.id}`} className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" />Voir propriétaire</Link>
          <ExportCsvButton accountId={account.id} ownerNom={account.owner.nom} />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`rounded-lg border p-4 ${account.solde_courant >= 0 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />Solde courant</p>
          <p className={`text-2xl font-bold tabular-nums ${account.solde_courant >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>{fmt(account.solde_courant)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Séquestre</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(account.solde_sequestre)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenus ce mois</p>
          <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(kpis.revenuCeMois)}</p>
          {evolution !== null && (
            <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${evolution >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {evolution >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {evolution >= 0 ? "+" : ""}{evolution}% vs mois préc.
            </p>
          )}
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">En attente</p>
          <p className="text-2xl font-bold tabular-nums text-amber-600">{kpis.nbPending}</p>
          <p className="text-xs text-muted-foreground mt-0.5">transaction{kpis.nbPending !== 1 ? "s" : ""} PENDING</p>
        </div>
      </div>

      {/* Mandates actifs */}
      {account.owner.mandates.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mandats actifs</p>
          <div className="flex flex-wrap gap-2">
            {account.owner.mandates.map(m => (
              <Link key={m.id} href={`/mandats/${m.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-accent border border-border text-sm cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground">{m.property.nom}</span>
                <span className="text-muted-foreground text-xs">{(m.taux_honoraires * 100).toFixed(0)}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" />Total crédits</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmt(totalCredits)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-red-500" />Total débits</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-400 tabular-nums">{fmt(totalDebits)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transactions</p>
          <span className="text-xs text-muted-foreground">{account.transactions.length} entrées</span>
        </div>
        {account.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Aucune transaction</p>
        ) : (
          <div className="divide-y divide-border">
            {account.transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-muted-foreground w-24 shrink-0 tabular-nums">{new Date(tx.date).toLocaleDateString("fr-FR")}</span>
                  <div className="min-w-0">
                    <p className="text-foreground truncate">{tx.libelle}</p>
                    {(tx as any).booking?.guest && (
                      <p className="text-xs text-muted-foreground">{(tx as any).booking.guest.prenom} {(tx as any).booking.guest.nom}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TX_TYPE_COLORS[tx.type] ?? "text-muted-foreground"}`}>{TX_TYPE_LABELS[tx.type] ?? tx.type}</span>
                  <StatusBadge status={tx.statut} />
                  <span className={`font-semibold w-28 text-right tabular-nums ${tx.montant >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {fmt(tx.montant, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CRG Reports */}
      {account.reports.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Comptes rendus de gestion</p>
          </div>
          <div className="divide-y divide-border">
            {account.reports.map(report => (
              <div key={report.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-muted-foreground w-36 shrink-0">
                  {new Date(report.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span>Revenus : <span className="text-foreground font-medium">{fmt(report.revenus_sejours)}</span></span>
                  <span>Honoraires : <span className="text-foreground font-medium">{fmt(report.honoraires_deduits)}</span></span>
                  {report.charges_deduites > 0 && <span>Charges : <span className="text-foreground font-medium">{fmt(report.charges_deduites)}</span></span>}
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 ml-auto">{fmt(report.montant_reverse)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
