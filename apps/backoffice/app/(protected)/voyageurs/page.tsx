import { getGuests } from "@/lib/dal/guests"
import { PageHeader } from "@/components/ui/page-header"
import { VoyageursTable } from "./voyageurs-table"

export default async function VoyageursPage() {
  const guests = await getGuests()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voyageurs"
        description={`${guests.length} voyageur${guests.length !== 1 ? "s" : ""}`}
      />
      <VoyageursTable data={guests} />
    </div>
  )
}

