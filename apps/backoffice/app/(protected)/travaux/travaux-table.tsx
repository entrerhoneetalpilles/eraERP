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
        className="font-medium text-foreground hover:text-primary"
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
        className="text-muted-foreground hover:text-primary"
      >
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.type}</span>
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
          className="text-muted-foreground hover:text-primary"
        >
          {row.original.contractor.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground italic">Non assigné</span>
      ),
  },
  {
    id: "date",
    header: "Créé le",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("fr-FR"),
  },
]

export function TravauxTable({ data }: { data: WorkOrderRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un travail…"
      searchColumn="titre"
    />
  )
}
