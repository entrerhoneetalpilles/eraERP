import { db } from "@conciergerie/db"
import { PageHeader } from "@/components/ui/page-header"
import { PlanningGrid } from "./planning-grid"
import { PlanningCalendar } from "./planning-calendar"
import { PlanningStats } from "./planning-stats"
import { PropertyFilter } from "./planning-filter"
import { getPlanningEvents, getPlanningStats } from "@/lib/dal/planning"
import Link from "next/link"

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; view?: string; property_id?: string }
}) {
  const now = new Date()
  const rawYear = parseInt(searchParams.year ?? "", 10)
  const rawMonth = parseInt(searchParams.month ?? "", 10)
  const year = isNaN(rawYear) ? now.getFullYear() : rawYear
  const month = isNaN(rawMonth) ? now.getMonth() : Math.min(11, Math.max(0, rawMonth))
  const view = searchParams.view ?? "grid"
  const propertyId = searchParams.property_id || undefined

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59)

  const [bookings, properties, events, stats] = await Promise.all([
    db.booking.findMany({
      where: {
        ...(propertyId ? { property_id: propertyId } : {}),
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
    getPlanningEvents(firstDay, lastDay, propertyId),
    getPlanningStats(firstDay, lastDay),
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

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planning"
        description={`${monthLabel} — ${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
      />

      {/* Stats bar */}
      <PlanningStats {...stats} />

      {/* Filtre par bien + switcher vue */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PropertyFilter
          properties={properties}
          defaultValue={propertyId ?? ""}
          year={year}
          month={month}
          view={view}
        />

        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Link
            href={`/planning?year=${year}&month=${month}&view=grid${propertyId ? `&property_id=${propertyId}` : ""}`}
            className={`px-3 py-1 text-sm rounded-sm transition-colors ${view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Timeline
          </Link>
          <Link
            href={`/planning?year=${year}&month=${month}&view=calendar${propertyId ? `&property_id=${propertyId}` : ""}`}
            className={`px-3 py-1 text-sm rounded-sm transition-colors ${view === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Calendrier
          </Link>
        </div>
      </div>

      {/* Vue */}
      {view === "calendar" ? (
        <PlanningCalendar events={events} />
      ) : (
        <PlanningGrid
          bookings={slots}
          properties={properties}
          year={year}
          month={month}
        />
      )}
    </div>
  )
}
