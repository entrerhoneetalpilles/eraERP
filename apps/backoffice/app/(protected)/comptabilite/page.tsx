import Link from "next/link"
import { getMandantAccounts } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

type AccountRow = Awaited<ReturnType<typeof getMandantAccounts>>[number]

const columns: ColumnDef<AccountRow>[] = [
  {
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {row.original.owner.nom}
      </Link>
    ),
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.owner.email}</span>
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
    cell: ({ row }) =>
      row.original.solde_sequestre.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
  },
  {
    id: "nb_transactions",
    header: "Transactions",
    cell: ({ row }) => row.original._count.transactions,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/comptabilite/${row.original.id}`}
        className="text-sm text-primary hover:underline"
      >
        Voir
      </Link>
    ),
  },
]

export default async function ComptabilitePage() {
  const accounts = await getMandantAccounts()

  return (
    <div>
      <PageHeader
        title="Comptabilité mandant"
        description={`${accounts.length} compte${accounts.length !== 1 ? "s" : ""} mandant`}
      />
      <DataTable
        columns={columns}
        data={accounts}
        searchPlaceholder="Rechercher un propriétaire…"
        searchColumn="proprietaire"
      />
    </div>
  )
}
