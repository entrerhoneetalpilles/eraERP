"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { getManagementReports } from "@/lib/dal/crg"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"

type CrgRow = Awaited<ReturnType<typeof getManagementReports>>[number]

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const columns: ColumnDef<CrgRow>[] = [
  {
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link href={`/proprietaires/${row.original.account.owner.id}`} className="font-medium text-foreground hover:text-primary cursor-pointer">
        {row.original.account.owner.nom}
      </Link>
    ),
  },
  {
    header: "Période",
    cell: ({ row }) =>
      `${new Date(row.original.periode_debut).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      })} → ${new Date(row.original.periode_fin).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      })}`,
  },
  {
    accessorKey: "revenus_sejours",
    header: "Revenus",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{fmt(row.original.revenus_sejours)}</span>
    ),
  },
  {
    accessorKey: "honoraires_deduits",
    header: "Honoraires",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{fmt(row.original.honoraires_deduits)}</span>
    ),
  },
  {
    accessorKey: "charges_deduites",
    header: "Charges",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{fmt(row.original.charges_deduites)}</span>
    ),
  },
  {
    accessorKey: "montant_reverse",
    header: "Reversé",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">{fmt(row.original.montant_reverse)}</span>
    ),
  },
  {
    header: "Virement",
    cell: ({ row }) =>
      row.original.date_virement ? (
        <span className="text-sm text-foreground">
          {new Date(row.original.date_virement).toLocaleDateString("fr-FR")}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">En attente</span>
      ),
  },
]

export function CrgTable({ data }: { data: CrgRow[] }) {
  return <DataTable columns={columns} data={data} />
}
