import Link from "next/link"
import { getMandates } from "@/lib/dal/mandates"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type MandateRow = Awaited<ReturnType<typeof getMandates>>[number]

const columns: ColumnDef<MandateRow>[] = [
  {
    accessorKey: "numero_mandat",
    header: "N° Mandat",
    cell: ({ row }) => (
      <Link
        href={`/mandats/${row.original.id}`}
        className="font-mono text-sm text-foreground hover:text-primary"
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
        className="text-foreground hover:text-primary"
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
        className="text-foreground hover:text-primary"
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
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    accessorKey: "date_debut",
    header: "Début",
    cell: ({ row }) =>
      new Date(row.original.date_debut).toLocaleDateString("fr-FR"),
  },
]

export default async function MandatsPage() {
  const mandates = await getMandates()

  return (
    <div>
      <PageHeader
        title="Mandats"
        description={`${mandates.length} mandat${mandates.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/mandats/new">
            <Button size="sm" className="">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau mandat
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={mandates}
        searchPlaceholder="Rechercher un mandat…"
        searchColumn="numero_mandat"
      />
    </div>
  )
}
