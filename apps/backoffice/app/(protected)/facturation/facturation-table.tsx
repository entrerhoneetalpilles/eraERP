"use client"

import { useState } from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Download, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import type { getFeeInvoices } from "@/lib/dal/facturation"
import { exportInvoiceCsvAction } from "./[id]/actions"
import { cn } from "@conciergerie/ui"

type InvoiceRow = Awaited<ReturnType<typeof getFeeInvoices>>[number]
type StatutFilter = "TOUS" | "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"

const STATUT_TABS: { key: StatutFilter; label: string }[] = [
  { key: "TOUS", label: "Toutes" },
  { key: "BROUILLON", label: "Brouillons" },
  { key: "EMISE", label: "\u00c9mises" },
  { key: "PAYEE", label: "Pay\u00e9es" },
  { key: "AVOIR", label: "Avoirs" },
]

function isOverdue(row: InvoiceRow) {
  return row.statut === "EMISE" && row.date_echeance && new Date(row.date_echeance) < new Date()
}

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "numero_facture",
    header: "N\u00b0 Facture",
    cell: ({ row }) => (
      <Link
        href={`/facturation/${row.original.id}`}
        className="font-mono text-sm font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.numero_facture}
      </Link>
    ),
  },
  {
    id: "proprietaire",
    header: "Propri\u00e9taire",
    cell: ({ row }) => (
      <Link href={`/proprietaires/${row.original.owner.id}`} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "objet",
    header: "Objet",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
        {row.original.objet ?? "\u2014"}
      </span>
    ),
  },
  {
    id: "periode",
    header: "P\u00e9riode",
    cell: ({ row }) =>
      `${new Date(row.original.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} \u2192 ${new Date(row.original.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`,
  },
  {
    id: "echeance",
    header: "\u00c9ch\u00e9ance",
    cell: ({ row }) => {
      const overdue = isOverdue(row.original)
      if (!row.original.date_echeance) return <span className="text-muted-foreground text-sm">\u2014</span>
      return (
        <span className={cn("text-sm flex items-center gap-1", overdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
          {overdue && <AlertTriangle className="w-3 h-3" />}
          {new Date(row.original.date_echeance).toLocaleDateString("fr-FR")}
        </span>
      )
    },
  },
  {
    accessorKey: "montant_ttc",
    header: "Montant TTC",
    cell: ({ row }) => (
      <span className="text-sm font-semibold font-mono text-foreground">
        {row.original.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={row.original.statut} />
        {isOverdue(row.original) && (
          <span className="text-xs text-red-500 font-medium">retard</span>
        )}
      </div>
    ),
  },
]

export function FacturationTable({ data }: { data: InvoiceRow[] }) {
  const [statut, setStatut] = useState<StatutFilter>("TOUS")
  const filtered = statut === "TOUS" ? data : data.filter((inv) => inv.statut === statut)

  async function exportCsv() {
    const res = await exportInvoiceCsvAction()
    if (!res || res.error || !res.csv) return toast.error((res as any)?.error ?? "Erreur export")
    const blob = new Blob(["\uFEFF" + res.csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export CSV t\u00e9l\u00e9charg\u00e9")
  }

  const overdueCount = filtered.filter(isOverdue).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {STATUT_TABS.map((tab) => {
            const count = tab.key === "TOUS" ? data.length : data.filter((i) => i.statut === tab.key).length
            const active = statut === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setStatut(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <Button
          size="sm" variant="outline"
          onClick={exportCsv}
          className="gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{overdueCount} facture{overdueCount !== 1 ? "s" : ""} en retard de paiement dans cette vue</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Rechercher par num\u00e9ro, propri\u00e9taire\u2026"
        searchColumn="numero_facture"
      />
    </div>
  )
}
