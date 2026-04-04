"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { getGuests } from "@/lib/dal/guests"

type GuestRow = Awaited<ReturnType<typeof getGuests>>[number]

const columns: ColumnDef<GuestRow>[] = [
  {
    id: "nom",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link href={`/voyageurs/${row.original.id}`} className="font-medium text-foreground hover:text-primary cursor-pointer">
        {row.original.prenom} {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email ?? "—"}</span>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.telephone ?? "—"}</span>
    ),
  },
  {
    accessorKey: "nb_sejours",
    header: "Séjours",
  },
  {
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => row.original._count.bookings,
  },
]

export function VoyageursTable({ data }: { data: GuestRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un voyageur…"
      searchColumn="nom"
    />
  )
}
