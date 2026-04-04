import Link from "next/link"
import { getBookings } from "@/lib/dal/bookings"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type BookingRow = Awaited<ReturnType<typeof getBookings>>[number]

const columns: ColumnDef<BookingRow>[] = [
  {
    id: "voyageur",
    header: "Voyageur",
    cell: ({ row }) => (
      <Link href={`/voyageurs/${row.original.guest.id}`} className="text-garrigue-900 hover:text-olivier-600">
        {row.original.guest.prenom} {row.original.guest.nom}
      </Link>
    ),
  },
  {
    id: "bien",
    header: "Bien",
    cell: ({ row }) => (
      <Link href={`/biens/${row.original.property.id}`} className="text-garrigue-700 hover:text-olivier-600">
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
    cell: ({ row }) => row.original.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.statut} />,
  },
  {
    id: "platform",
    header: "Canal",
    cell: ({ row }) => <span className="text-xs text-garrigue-500">{row.original.platform}</span>,
  },
]

export default async function ReservationsPage() {
  const bookings = await getBookings()
  return (
    <div>
      <PageHeader
        title="Réservations"
        description={`${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/reservations/new">
            <Button size="sm" className="bg-olivier-500 hover:bg-olivier-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle réservation
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={bookings} searchPlaceholder="Rechercher…" searchColumn="voyageur" />
    </div>
  )
}
