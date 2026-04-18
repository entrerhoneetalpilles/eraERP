import {
  getBankStatements,
  getBankLines,
  getUnmatchedCompanyTransactions,
  getRapprochementStats,
} from "@/lib/dal/rapprochement"
import { PageHeader } from "@/components/ui/page-header"
import { RapprochementPanel } from "./rapprochement-panel"
import { CsvImport } from "./csv-import"
import { Landmark, CheckCircle2, Clock, FileX } from "lucide-react"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export default async function RapprochementPage() {
  const [statements, unmatchedTx, stats] = await Promise.all([
    getBankStatements(),
    getUnmatchedCompanyTransactions(),
    getRapprochementStats(),
  ])

  // Load lines from the most recent statement
  const latestStatement = statements[0]
  const lines = latestStatement ? await getBankLines(latestStatement.id) : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapprochement bancaire"
        description="Associez les lignes de relevé aux écritures comptables"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total lignes</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{stats.totalLines}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Lettrées</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.lettrees}</p>
        </div>
        <div className={`rounded-lg border p-4 ${stats.nonLettrees > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className={`w-3.5 h-3.5 ${stats.nonLettrees > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">À rapprocher</p>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${stats.nonLettrees > 0 ? "text-amber-600" : "text-foreground"}`}>{stats.nonLettrees}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FileX className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Ignorées</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-muted-foreground">{stats.ignorees}</p>
        </div>
      </div>

      {/* Import + statements list */}
      <div className="flex items-start gap-4 flex-wrap">
        <CsvImport />
        {statements.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{statements.length} relevé{statements.length !== 1 ? "s" : ""} importé{statements.length !== 1 ? "s" : ""}</span>
            {latestStatement && (
              <span> · Dernier : <span className="text-foreground">{latestStatement.fichier_nom}</span> ({latestStatement.nb_lignes} lignes)</span>
            )}
          </div>
        )}
      </div>

      {/* Rapprochement panel */}
      {statements.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Landmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Aucun relevé importé</p>
          <p className="text-xs text-muted-foreground">Importez un fichier CSV pour commencer le rapprochement</p>
        </div>
      ) : (
        <RapprochementPanel lines={lines} unmatchedTx={unmatchedTx} />
      )}
    </div>
  )
}
