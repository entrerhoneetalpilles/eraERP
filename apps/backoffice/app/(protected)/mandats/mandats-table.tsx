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
        className="font-mono text-sm font-medium text-foreground hover:text-primary cursor-pointer"
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
        className="font-medium text-foreground hover:text-primary cursor-pointer"
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
        className="font-medium text-foreground hover:text-primary cursor-pointer"
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
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => (row.original.property as any)._count?.bookings ?? "—",
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    accessorKey: "date_debut",
    header: "Début",
    cell: ({ row }) => new Date(row.original.date_debut).toLocaleDateString("fr-FR"),
  },
  {
    id: "date_fin",
    header: "Fin",
    cell: ({ row }) =>
      row.original.date_fin
        ? new Date(row.original.date_fin).toLocaleDateString("fr-FR")
        : <span className="text-muted-foreground">—</span>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/mandats/${row.original.id}`}
        className="text-sm text-primary hover:underline cursor-pointer"
      >
        Voir
      </Link>
    ),
  },
]

export function MandatsTable({ data }: { data: MandateRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Rechercher un mandat…"
          searchColumn="numero_mandat"
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Aucun mandat</p>
        ) : (
          data.map((row) => (
            <Link
              key={row.id}
              href={`/mandats/${row.id}`}
              className="block rounded-lg border border-border bg-card p-4 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-foreground">{row.numero_mandat}</p>
                <StatusBadge status={row.statut} />
              </div>
              <p className="text-sm font-medium text-foreground">{row.owner.nom}</p>
              <p className="text-xs text-muted-foreground">{row.property.nom}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Honoraires : {row.taux_honoraires}% · Début {new Date(row.date_debut).toLocaleDateString("fr-FR")}
                </p>
                {(row.property as any)._count?.bookings != null && (
                  <span className="text-xs text-muted-foreground">
                    {(row.property as any)._count.bookings} rés.
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
