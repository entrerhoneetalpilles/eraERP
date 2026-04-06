"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getFeeInvoices } from "@/lib/dal/facturation"

type InvoiceRow = Awaited<ReturnType<typeof getFeeInvoices>>[number]

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
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher une facture…"
      searchColumn="numero_facture"
    />
  )
}

