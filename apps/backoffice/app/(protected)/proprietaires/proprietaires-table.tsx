"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getOwners } from "@/lib/dal/owners"

type OwnerRow = Awaited<ReturnType<typeof getOwners>>[number]

const columns: ColumnDef<OwnerRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.id}`}
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => row.original.telephone ?? "—",
  },
  {
    id: "biens",
    header: "Biens",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original._count.mandates} bien{row.original._count.mandates !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.id}`}
        className="text-sm text-primary hover:underline cursor-pointer"
      >
        Voir
      </Link>
    ),
  },
]

export function ProprietairesTable({ data }: { data: OwnerRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un propriétaire..."
      searchColumn="nom"
    />
  )
}
