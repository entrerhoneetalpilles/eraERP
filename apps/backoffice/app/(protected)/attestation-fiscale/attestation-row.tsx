"use client"

import { useTransition } from "react"
import Link from "next/link"
import { FileText, Download, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { generateAttestationAction } from "./actions"

type Row = {
  id: string
  nom: string
  email: string | null
  hasData: boolean
  nbCrg: number
  totalHonoraires: number
  attestationGenerated: boolean
  attestationDoc: { id: string; nom: string; url_storage: string; createdAt: Date } | null
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export function AttestationRow({ row, annee }: { row: Row; annee: number }) {
  const [pending, startTransition] = useTransition()

  function generate() {
    startTransition(() => { void generateAttestationAction(row.id, annee) })
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/proprietaires/${row.id}`} className="text-sm font-medium text-foreground hover:text-primary">
            {row.nom}
          </Link>
          {row.attestationGenerated ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />Générée
            </span>
          ) : row.hasData ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />À générer
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">
              Pas de CRG
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {row.email ?? "—"} · {row.nbCrg} CRG · {fmt(row.totalHonoraires)} HT
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {row.attestationDoc && (
          <a
            href={row.attestationDoc.url_storage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Download className="w-3.5 h-3.5" />PDF
          </a>
        )}
        {row.hasData && (
          <button
            onClick={generate}
            disabled={pending}
            title={row.attestationGenerated ? "Regénérer" : "Générer"}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
          >
            {pending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : row.attestationGenerated
                ? <RefreshCw className="w-3.5 h-3.5" />
                : <FileText className="w-3.5 h-3.5" />}
            {row.attestationGenerated ? "Regénérer" : "Générer"}
          </button>
        )}
      </div>
    </div>
  )
}
