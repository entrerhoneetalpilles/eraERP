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
]

export function BiensTable({ data }: { data: PropertyRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un bien…"
      searchColumn="nom"
    />
  )
}

