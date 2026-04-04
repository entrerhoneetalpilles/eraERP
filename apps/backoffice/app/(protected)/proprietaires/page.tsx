import Link from "next/link"
import { getOwners } from "@/lib/dal/owners"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type OwnerRow = Awaited<ReturnType<typeof getOwners>>[number]

const columns: ColumnDef<OwnerRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/proprietaires/${row.original.id}`}
        className="font-medium text-garrigue-900 hover:text-olivier-600"
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
      <span className="text-garrigue-600">{row.original.email}</span>
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
      <span className="text-garrigue-500">
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
        className="text-sm text-olivier-600 hover:underline"
      >
        Voir
      </Link>
    ),
  },
]

export default async function ProprietairesPage() {
  const owners = await getOwners()

  return (
    <div>
      <PageHeader
        title="Propriétaires"
        description={`${owners.length} propriétaire${owners.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/proprietaires/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau propriétaire
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={owners}
        searchPlaceholder="Rechercher un propriétaire..."
        searchColumn="nom"
      />
    </div>
  )
}
