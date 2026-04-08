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
      <Link href={`/biens/${row.original.property.id}`} className="font-medium text-foreground hover:text-primary cursor-pointer">
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    header: "Séjour",
    cell: ({ row }) => {
      const b = row.original.booking
      return (
        <Link href={`/reservations/${b.id}`} className="text-muted-foreground hover:text-primary text-xs cursor-pointer">
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
        <Link href={`/prestataires/${row.original.contractor.id}`} className="font-medium text-foreground hover:text-primary cursor-pointer">
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
      <Link href={`/menage/${row.original.id}`} className="text-xs text-primary hover:underline cursor-pointer">
        Voir
      </Link>
    ),
  },
]

export function MenageTable({ data }: { data: CleaningRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable columns={columns} data={data} />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Aucun ménage</p>
        ) : (
          data.map((row) => (
            <Link
              key={row.id}
              href={`/menage/${row.id}`}
              className="block rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground">{row.property.nom}</p>
                <StatusBadge status={row.statut} />
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(row.date_prevue).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.booking.check_in
                  ? `${new Date(row.booking.check_in).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → ${new Date(row.booking.check_out).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.contractor ? row.contractor.nom : "Non assigné"}
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  )
}

