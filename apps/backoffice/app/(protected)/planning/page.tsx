import { db } from "@conciergerie/db"
import { PageHeader } from "@/components/ui/page-header"
import { PlanningGrid } from "./planning-grid"

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string }
}) {
  const now = new Date()
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear()
  const month = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59)

  const [bookings, properties] = await Promise.all([
    db.booking.findMany({
      where: {
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: firstDay, lte: lastDay } },
          { check_out: { gte: firstDay, lte: lastDay } },
          { check_in: { lte: firstDay }, check_out: { gte: lastDay } },
        ],
      },
      include: {
        property: { select: { id: true, nom: true } },
        guest: { select: { prenom: true, nom: true } },
      },
    }),
    db.property.findMany({
      where: { statut: "ACTIF" },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    }),
  ])

  const slots = bookings.map((b) => ({
    id: b.id,
    property_id: b.property_id,
    property_nom: b.property.nom,
    guest_nom: `${b.guest.prenom} ${b.guest.nom}`,
    check_in: b.check_in.toISOString(),
    check_out: b.check_out.toISOString(),
    statut: b.statut,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        description={`${bookings.length} réservation${bookings.length !== 1 ? "s" : ""} ce mois`}
      />
      <PlanningGrid
        bookings={slots}
        properties={properties}
        year={year}
        month={month}
      />
    </div>
  )
}
