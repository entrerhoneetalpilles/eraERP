"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import type { getCleaningTasks } from "@/lib/dal/menage"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

type CleaningRow = Awaited<ReturnType<typeof getCleaningTasks>>[number]
type Contractor = { id: string; nom: string }

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
    cell: ({ row }) => {
      const t = row.original
      const overrun =
        t.duree_reelle != null &&
        t.duree_estimee != null &&
        t.duree_reelle > t.duree_estimee * 1.3
      return (
        <div className="space-y-1">
          {t.contractor ? (
            <Link
              href={`/prestataires/${t.contractor.id}`}
              className="font-medium text-foreground hover:text-primary cursor-pointer text-sm"
            >
              {t.contractor.nom}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Non assigné</span>
          )}
          {overrun && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded font-medium block w-fit">
              Dépassement +{Math.round(t.duree_reelle! - t.duree_estimee!)}min
            </span>
          )}
        </div>
      )
    },
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

export function MenageTable({ data, contractors: _contractors = [] }: { data: CleaningRow[]; contractors?: Contractor[] }) {
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

