"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { getPrestataires } from "@/lib/dal/prestataires"

type PrestataireRow = Awaited<ReturnType<typeof getPrestataires>>[number]

const columns: ColumnDef<PrestataireRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/prestataires/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "metier",
    header: "Métier",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.metier}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => row.original.telephone ?? "—",
  },
  {
    id: "nb_interventions",
    header: "Interventions",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original._count.workOrders} ordre{row.original._count.workOrders !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    id: "actif",
    header: "Statut",
    cell: ({ row }) => (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          row.original.actif
            ? "bg-green-100 text-green-800"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {row.original.actif ? "Actif" : "Inactif"}
      </span>
    ),
  },
]

export function PrestatairesTable({ data }: { data: PrestataireRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un prestataire…"
      searchColumn="nom"
    />
  )
}
