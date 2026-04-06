"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { getMandantAccounts } from "@/lib/dal/comptes"

type AccountRow = Awaited<ReturnType<typeof getMandantAccounts>>[number]

const columns: ColumnDef<AccountRow>[] = [
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.owner.email}</span>
    ),
  },
  {
    accessorKey: "solde_courant",
    header: "Solde courant",
    cell: ({ row }) => (
      <span
        className={
          row.original.solde_courant >= 0
            ? "font-semibold text-green-700"
            : "font-semibold text-red-600"
        }
      >
        {row.original.solde_courant.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    ),
  },
  {
    accessorKey: "solde_sequestre",
    header: "Séquestre",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.solde_sequestre.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    ),
  },
  {
    id: "nb_transactions",
    header: "Transactions",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original._count.transactions}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="text-sm text-primary hover:underline cursor-pointer"
      >
        Voir
      </Link>
    ),
  },
]

export function ComptesTable({ data }: { data: AccountRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un propriétaire…"
      searchColumn="proprietaire"
    />
  )
}

