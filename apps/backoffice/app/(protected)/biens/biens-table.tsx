"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getProperties } from "@/lib/dal/properties"

type PropertyRow = Awaited<ReturnType<typeof getProperties>>[number]

const columns: ColumnDef<PropertyRow>[] = [
  {
    accessorKey: "nom",
    header: "Bien",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <StatusBadge status={row.original.type} />,
  },
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) =>
      row.original.mandate?.owner ? (
        <Link
          href={`/proprietaires/${row.original.mandate.owner.id}`}
          className="text-muted-foreground hover:text-primary cursor-pointer"
        >
          {row.original.mandate.owner.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground italic">Sans mandat</span>
      ),
  },
  {
    id: "capacite",
    header: "Capacité",
    cell: ({ row }) => `${row.original.capacite_voyageurs} voyageurs`,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => row.original._count.bookings,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.id}`}
        className="text-sm text-primary hover:underline cursor-pointer"
      >
        Voir
      </Link>
    ),
  },
]

export function BiensTable({ data }: { data: PropertyRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Rechercher un bien…"
          searchColumn="nom"
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Aucun bien</p>
        ) : (
          data.map((row) => (
            <Link
              key={row.id}
              href={`/biens/${row.id}`}
              className="block rounded-lg border border-border bg-card p-4 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground">{row.nom}</p>
                <StatusBadge status={row.statut} />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.type} />
                <span className="text-xs text-muted-foreground">
                  {row.capacite_voyageurs} voyageurs
                </span>
              </div>
              {row.mandate?.owner ? (
                <p className="text-xs text-muted-foreground">{row.mandate.owner.nom}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sans mandat</p>
              )}
              <p className="text-xs text-muted-foreground">
                {row._count.bookings} réservation{row._count.bookings !== 1 ? "s" : ""}
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  )
}

