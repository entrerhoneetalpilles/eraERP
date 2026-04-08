"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getWorkOrders } from "@/lib/dal/travaux"

type WorkOrderRow = Awaited<ReturnType<typeof getWorkOrders>>[number]

const columns: ColumnDef<WorkOrderRow>[] = [
  {
    accessorKey: "titre",
    header: "Titre",
    cell: ({ row }) => (
      <Link
        href={`/travaux/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.titre}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.property.id}`}
        className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
      >
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "urgence",
    header: "Urgence",
    cell: ({ row }) => <StatusBadge status={row.original.urgence} />,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "prestataire",
    header: "Prestataire",
    cell: ({ row }) =>
      row.original.contractor ? (
        <Link
          href={`/prestataires/${row.original.contractor.id}`}
          className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
        >
          {row.original.contractor.nom}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground italic">Non assigné</span>
      ),
  },
  {
    id: "date",
    header: "Créé le",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
]

export function TravauxTable({ data }: { data: WorkOrderRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Rechercher un travail…"
          searchColumn="titre"
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Aucun travail</p>
        ) : (
          data.map((row) => (
            <Link
              key={row.id}
              href={`/travaux/${row.id}`}
              className="block rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground">{row.titre}</p>
                <StatusBadge status={row.statut} />
              </div>
              <p className="text-xs text-muted-foreground">{row.property.nom}</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.urgence} />
                <span className="text-xs text-muted-foreground">{row.type}</span>
              </div>
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

