import Link from "next/link"
import { getBookings } from "@/lib/dal/bookings"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { ReservationsTable } from "./reservations-table"

export default async function ReservationsPage() {
  const bookings = await getBookings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réservations"
        description={`${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/reservations/new" className="cursor-pointer">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle réservation
            </Button>
          </Link>
        }
      />
      <ReservationsTable data={bookings} />
    </div>
  )
}
