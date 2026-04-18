"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, EyeOff, Loader2, Link2 } from "lucide-react"
import { matchBankLineAction, ignoreBankLineAction } from "./actions"

type BankLine = {
  id: string
  date: Date
  libelle: string
  montant: number
  statut: string
}

type CompanyTx = {
  id: string
  date: Date
  libelle: string
  montant_ttc: number
  journal: string
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const STATUT_COLORS: Record<string, string> = {
  NON_LETTREE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  LETTREE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  IGNOREE: "bg-muted text-muted-foreground border-border",
}

export function RapprochementPanel({
  lines,
  unmatchedTx,
}: {
  lines: BankLine[]
  unmatchedTx: CompanyTx[]
}) {
  const [pending, startTransition] = useTransition()
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<string | null>(null)

  function doMatch() {
    if (!selectedLine || !selectedTx) return
    startTransition(async () => {
      await matchBankLineAction(selectedLine, selectedTx)
      setSelectedLine(null)
      setSelectedTx(null)
    })
  }

  function doIgnore(id: string) {
    startTransition(() => { void ignoreBankLineAction(id) })
  }

  const nonLettrees = lines.filter(l => l.statut === "NON_LETTREE")
  const autres = lines.filter(l => l.statut !== "NON_LETTREE")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Lignes bancaires */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Lignes bancaires</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cliquez une ligne pour la sélectionner</p>
        </div>
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {nonLettrees.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">Toutes les lignes sont lettrées</p>
          )}
          {nonLettrees.map(line => (
            <button
              key={line.id}
              onClick={() => setSelectedLine(l => l === line.id ? null : line.id)}
              className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer ${selectedLine === line.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent/50"}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{line.libelle}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(line.date)}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0 ${line.montant >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {fmt(line.montant)}
              </span>
              <button
                onClick={e => { e.stopPropagation(); doIgnore(line.id) }}
                disabled={pending}
                title="Ignorer"
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
          {autres.map(line => (
            <div key={line.id} className="px-5 py-3 flex items-center gap-3 opacity-50">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{line.libelle}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(line.date)}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[line.statut] ?? ""}`}>
                {line.statut === "LETTREE" ? "Lettré" : "Ignoré"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions à rapprocher */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Écritures BANQUE non lettrées</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sélectionnez une écriture à associer</p>
          </div>
          {selectedLine && selectedTx && (
            <button
              onClick={doMatch}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              Lettrer
            </button>
          )}
        </div>
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {unmatchedTx.length === 0 && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Toutes les écritures sont lettrées</p>
            </div>
          )}
          {unmatchedTx.map(tx => (
            <button
              key={tx.id}
              onClick={() => setSelectedTx(t => t === tx.id ? null : tx.id)}
              disabled={!selectedLine}
              className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${selectedTx === tx.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent/50"}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{tx.libelle}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(tx.date)}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-emerald-600 shrink-0">{fmt(tx.montant_ttc)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
