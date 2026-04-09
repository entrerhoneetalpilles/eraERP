import { db } from "@conciergerie/db"

export interface PlanningEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  url: string
  type: "booking" | "cleaning"
}

const BOOKING_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  CHECKEDIN: "#10b981",
  CHECKEDOUT: "#9ca3af",
  CANCELLED: "#fca5a5",
}

const CLEANING_COLORS: Record<string, string> = {
  PLANIFIEE: "#7dd3fc",
  EN_COURS: "#fb923c",
  TERMINEE: "#4ade80",
  PROBLEME: "#f87171",
}

export async function getPlanningEvents(
  from: Date,
  to: Date,
  property_id?: string
): Promise<PlanningEvent[]> {
  const propertyFilter = property_id ? { property_id } : {}

  const [bookings, cleaningTasks] = await Promise.all([
    db.booking.findMany({
      where: {
        ...propertyFilter,
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: from, lte: to } },
          { check_out: { gte: from, lte: to } },
          { check_in: { lte: from }, check_out: { gte: to } },
        ],
      },
      include: {
        property: { select: { nom: true } },
        guest: { select: { prenom: true, nom: true } },
      },
    }),
    db.cleaningTask.findMany({
      where: {
        ...propertyFilter,
        date_prevue: { gte: from, lte: to },
      },
      include: {
        property: { select: { nom: true } },
      },
    }),
  ])

  const events: PlanningEvent[] = []

  for (const b of bookings) {
    events.push({
      id: b.id,
      title: `${b.guest.prenom} ${b.guest.nom} — ${b.property.nom}`,
      start: new Date(b.check_in),
      end: new Date(b.check_out),
      color: BOOKING_COLORS[b.statut] ?? "#6b7280",
      url: `/reservations/${b.id}`,
      type: "booking",
    })
  }

  for (const t of cleaningTasks) {
    const start = new Date(t.date_prevue)
    const end = new Date(start)
    // Default 3h duration — actual duration not stored on CleaningTask
    end.setHours(end.getHours() + 3)
    events.push({
      id: t.id,
      title: `Ménage — ${t.property.nom}`,
      start,
      end,
      color: CLEANING_COLORS[t.statut] ?? "#7dd3fc",
      url: `/menage/${t.id}`,
      type: "cleaning",
    })
  }

  return events
}

export async function getPlanningStats(from: Date, to: Date) {
  const totalDays = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  )

  const [bookings, arrivals, departures, cleanings, propertyCount] = await Promise.all([
    db.booking.findMany({
      where: {
        statut: { notIn: ["CANCELLED"] },
        OR: [
          { check_in: { gte: from, lte: to } },
          { check_out: { gte: from, lte: to } },
          { check_in: { lte: from }, check_out: { gte: to } },
        ],
      },
      select: { check_in: true, check_out: true },
    }),
    db.booking.count({
      where: { statut: { notIn: ["CANCELLED"] }, check_in: { gte: from, lte: to } },
    }),
    db.booking.count({
      where: { statut: { notIn: ["CANCELLED"] }, check_out: { gte: from, lte: to } },
    }),
    db.cleaningTask.count({ where: { date_prevue: { gte: from, lte: to } } }),
    db.property.count({ where: { statut: "ACTIF" } }),
  ])

  // Assumes no two bookings overlap on the same property (enforced at booking creation)
  let occupiedDays = 0
  for (const b of bookings) {
    const s = Math.max(b.check_in.getTime(), from.getTime())
    const e = Math.min(b.check_out.getTime(), to.getTime())
    if (e > s) occupiedDays += Math.ceil((e - s) / (1000 * 60 * 60 * 24))
  }

  const totalAvailable = totalDays * propertyCount
  const occupancy = totalAvailable > 0 ? Math.round((occupiedDays / totalAvailable) * 100) : 0

  return { occupancy, arrivals, departures, cleanings }
}
