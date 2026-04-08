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
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Rechercher…"
          searchColumn="voyageur"
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Aucune réservation</p>
        ) : (
          data.map((row) => (
            <Link
              key={row.id}
              href={`/reservations/${row.id}`}
              className="block rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {row.guest.prenom} {row.guest.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.property.nom}</p>
                </div>
                <StatusBadge status={row.statut} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(row.check_in).toLocaleDateString("fr-FR")} →{" "}
                  {new Date(row.check_out).toLocaleDateString("fr-FR")}
                </span>
                <span className="font-medium text-foreground tabular-nums">
                  {row.revenu_net_proprietaire.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{row.nb_nuits} nuit{row.nb_nuits !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{row.platform}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}

