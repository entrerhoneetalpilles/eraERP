"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import type { getCleaningTasks } from "@/lib/dal/menage"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

type CleaningRow = Awaited<ReturnType<typeof getCleaningTasks>>[number]

const columns: ColumnDef<CleaningRow>[] = [
  {
    accessorKey: "date_prevue",
    header: "Date prévue",
    cell: ({ row }) =>
      new Date(row.original.date_prevue).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
  },
  {
    accessorKey: "property.nom",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.property.id}`} className="text-primary hover:underline">
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    header: "Séjour",
    cell: ({ row }) => {
      const b = row.original.booking
      return (
        <Link href={`/reservations/${b.id}`} className="text-muted-foreground hover:text-primary text-xs">
          {new Date(b.check_in).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          {" → "}
          {new Date(b.check_out).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </Link>
      )
    },
  },
  {
    header: "Prestataire",
    cell: ({ row }) =>
      row.original.contractor ? (
        <Link href={`/prestataires/${row.original.contractor.id}`} className="text-primary hover:underline">
          {row.original.contractor.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground text-xs">Non assigné</span>
      ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/menage/${row.original.id}`} className="text-xs text-primary hover:underline">
        Voir
      </Link>
    ),
  },
]

export function MenageTable({ data }: { data: CleaningRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
    />
  )
}
