import Link from "next/link"
import { getGuests } from "@/lib/dal/guests"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import type { ColumnDef } from "@tanstack/react-table"

type GuestRow = Awaited<ReturnType<typeof getGuests>>[number]

const columns: ColumnDef<GuestRow>[] = [
  {
    id: "nom",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link href={`/voyageurs/${row.original.id}`} className="font-medium text-foreground hover:text-primary">
        {row.original.prenom} {row.original.nom}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
  { accessorKey: "telephone", header: "Téléphone", cell: ({ row }) => row.original.telephone ?? "—" },
  { accessorKey: "nb_sejours", header: "Séjours" },
  { id: "reservations", header: "Rés.", cell: ({ row }) => row.original._count.bookings },
]

export default async function VoyageursPage() {
  const guests = await getGuests()
  return (
    <div>
      <PageHeader title="Voyageurs" description={`${guests.length} voyageur${guests.length !== 1 ? "s" : ""}`} />
      <DataTable columns={columns} data={guests} searchPlaceholder="Rechercher un voyageur…" searchColumn="nom" />
    </div>
  )
}
