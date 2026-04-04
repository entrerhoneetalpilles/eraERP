"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { getBookings } from "@/lib/dal/bookings"

type BookingRow = Awaited<ReturnType<typeof getBookings>>[number]

const columns: ColumnDef<BookingRow>[] = [
  {
    id: "voyageur",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link
        href={`/voyageurs/${row.original.guest.id}`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.guest.prenom} {row.original.guest.nom}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link
        href={`/biens/${row.original.property.id}`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.property.nom}
      </Link>
    ),
  },
  {
    accessorKey: "check_in",
    header: "Arrivée",
    cell: ({ row }) => new Date(row.original.check_in).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "check_out",
    header: "Départ",
    cell: ({ row }) => new Date(row.original.check_out).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "nb_nuits",
    header: "Nuits",
  },
  {
    accessorKey: "revenu_net_proprietaire",
    header: "Revenu net",
    cell: ({ row }) =>
      row.original.revenu_net_proprietaire.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "platform",
    header: "Canal",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.platform}</span>
    ),
  },
]

export function ReservationsTable({ data }: { data: BookingRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher…"
      searchColumn="voyageur"
    />
  )
}
