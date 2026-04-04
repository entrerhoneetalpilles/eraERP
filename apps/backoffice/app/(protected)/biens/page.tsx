import Link from "next/link"
import { getProperties } from "@/lib/dal/properties"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type PropertyRow = Awaited<ReturnType<typeof getProperties>>[number]

const columns: ColumnDef<PropertyRow>[] = [
  {
    accessorKey: "nom",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.id}`} className="font-medium text-foreground hover:text-primary">
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
    id: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) =>
      row.original.mandate?.owner ? (
        <Link href={`/proprietaires/${row.original.mandate.owner.id}`} className="text-muted-foreground hover:text-primary">
          {row.original.mandate.owner.nom}
        </Link>
      ) : (
        <span className="text-muted-foreground italic">Sans mandat</span>
      ),
  },
  {
    id: "capacite",
    header: "Capacité",
    cell: ({ row }) => `${row.original.capacite_voyageurs} voyageurs`,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "reservations",
    header: "Rés.",
    cell: ({ row }) => row.original._count.bookings,
  },
]

export default async function BiensPage() {
  const properties = await getProperties()

  return (
    <div>
      <PageHeader
        title="Biens"
        description={`${properties.length} bien${properties.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/biens/new">
            <Button size="sm" className="">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bien
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={properties} searchPlaceholder="Rechercher un bien…" searchColumn="nom" />
    </div>
  )
}
