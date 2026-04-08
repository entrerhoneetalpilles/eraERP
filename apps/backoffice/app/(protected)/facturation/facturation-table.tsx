"use client"

import { useState } from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getFeeInvoices } from "@/lib/dal/facturation"

type InvoiceRow = Awaited<ReturnType<typeof getFeeInvoices>>[number]
type StatutFilter = "TOUS" | "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"

const STATUT_TABS: { key: StatutFilter; label: string }[] = [
  { key: "TOUS", label: "Toutes" },
  { key: "BROUILLON", label: "Brouillons" },
  { key: "EMISE", label: "Émises" },
  { key: "PAYEE", label: "Payées" },
  { key: "AVOIR", label: "Avoirs" },
]

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "numero_facture",
    header: "N° Facture",
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
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.owner.id}`}
        className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "periode",
    header: "Période",
    cell: ({ row }) =>
      `${new Date(row.original.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → ${new Date(row.original.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`,
  },
  {
    id: "date_creation",
    header: "Créée le",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
  {
    accessorKey: "montant_ht",
    header: "Montant HT",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </span>
    ),
  },
  {
    accessorKey: "montant_ttc",
    header: "Montant TTC",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {row.original.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
]

export function FacturationTable({ data }: { data: InvoiceRow[] }) {
  const [statut, setStatut] = useState<StatutFilter>("TOUS")

  const filtered = statut === "TOUS" ? data : data.filter((inv) => inv.statut === statut)

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {STATUT_TABS.map((tab) => {
          const count = tab.key === "TOUS" ? data.length : data.filter((i) => i.statut === tab.key).length
          const active = statut === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatut(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Rechercher une facture…"
        searchColumn="numero_facture"
      />
    </div>
  )
}
