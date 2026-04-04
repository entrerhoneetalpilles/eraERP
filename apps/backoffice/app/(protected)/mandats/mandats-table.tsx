"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getMandates } from "@/lib/dal/mandates"

type MandateRow = Awaited<ReturnType<typeof getMandates>>[number]

const columns: ColumnDef<MandateRow>[] = [
  {
    accessorKey: "numero_mandat",
    header: "N° Mandat",
    cell: ({ row }) => (
      <Link
        href={`/mandats/${row.original.id}`}
        className="font-mono text-sm text-foreground hover:text-primary"
      >
        {row.original.numero_mandat}
      </Link>
    ),
  },
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.owner.id}`}
        className="text-foreground hover:text-primary"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.property.id}`}
        className="text-foreground hover:text-primary"
      >
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "taux_honoraires",
    header: "Honoraires",
    cell: ({ row }) => `${row.original.taux_honoraires}%`,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    accessorKey: "date_debut",
    header: "Début",
    cell: ({ row }) =>
      new Date(row.original.date_debut).toLocaleDateString("fr-FR"),
  },
]

export function MandatsTable({ data }: { data: MandateRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un mandat…"
      searchColumn="numero_mandat"
    />
  )
}
