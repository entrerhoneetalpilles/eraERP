import Link from "next/link"
import { getCompanyTransactions, getJournalTotaux } from "@/lib/dal/journal"
import { PageHeader } from "@/components/ui/page-header"
import { BookOpen, TrendingUp, Landmark, AlertCircle } from "lucide-react"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

const JOURNAL_LABELS: Record<string, string> = {
  VENTES: "Ventes",
  ACHATS: "Achats",
  BANQUE: "Banque",
  OD: "OD",
}
const JOURNAL_COLORS: Record<string, string> = {
  VENTES: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  BANQUE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  ACHATS: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  OD: "bg-muted text-muted-foreground border-border",
}
const TYPE_LABELS: Record<string, string> = {
  REVENU_HONORAIRES: "Honoraires",
  CHARGE: "Charge",
  TVA_COLLECTEE: "TVA collectée",
  TVA_DEDUCTIBLE: "TVA déductible",
  AUTRE: "Autre",
}

export default async function JournalComptablePage() {
  const [transactions, totaux] = await Promise.all([
    getCompanyTransactions(),
    getJournalTotaux(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal comptable"
        description="Écritures société — honoraires facturés et encaissés"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">CA HT (ventes)</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(totaux.totalVentesHT)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{totaux.nbVentes} écriture{totaux.nbVentes !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">CA TTC (ventes)</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{fmt(totaux.totalVentesTTC)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Encaissé (banque)</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmt(totaux.totalBanque)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{totaux.nbBanque} écriture{totaux.nbBanque !== 1 ? "s" : ""}</p>
        </div>
        <div className={`rounded-lg border p-4 ${totaux.nbNonLettrees > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Non lettrées</p>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${totaux.nbNonLettrees > 0 ? "text-amber-600" : "text-foreground"}`}>{totaux.nbNonLettrees}</p>
          <p className="text-xs text-muted-foreground mt-0.5">à rapprocher</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Écritures</p>
          <span className="text-xs text-muted-foreground">{transactions.length} ligne{transactions.length !== 1 ? "s" : ""}</span>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Aucune écriture comptable</p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${JOURNAL_COLORS[tx.journal] ?? ""}`}>
                      {JOURNAL_LABELS[tx.journal] ?? tx.journal}
                    </span>
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[tx.type] ?? tx.type}</span>
                    {tx.lettree && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">
                        Lettré
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{tx.libelle}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">HT</p>
                    <p className="text-sm font-semibold tabular-nums">{fmt(tx.montant_ht)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TVA</p>
                    <p className="text-sm tabular-nums text-muted-foreground">{fmt(tx.montant_ttc - tx.montant_ht)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TTC</p>
                    <p className="text-sm font-semibold tabular-nums">{fmt(tx.montant_ttc)}</p>
                  </div>
                  <div className="w-24">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm tabular-nums text-foreground">{fmtDate(tx.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Les écritures sont générées automatiquement à l&apos;émission et au paiement des factures d&apos;honoraires.{" "}
        <Link href="/facturation" className="text-primary hover:underline">Voir la facturation →</Link>
      </p>
    </div>
  )
}
