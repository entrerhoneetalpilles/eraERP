import { db } from "@conciergerie/db"

export async function getCleaningTasks() {
  return db.cleaningTask.findMany({
    include: {
      property: { select: { id: true, nom: true } },
      booking: { select: { id: true, check_in: true, check_out: true } },
      contractor: { select: { id: true, nom: true } },
    },
    orderBy: { date_prevue: "asc" },
  })
}

export async function getCleaningTaskById(id: string) {
  return db.cleaningTask.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, nom: true } },
      booking: {
        select: {
          id: true,
          check_in: true,
          check_out: true,
          guest: { select: { prenom: true, nom: true } },
        },
      },
      contractor: { select: { id: true, nom: true, telephone: true } },
    },
  })
}

export async function autoCreateCleaningTask(booking_id: string) {
  const existing = await db.cleaningTask.findFirst({ where: { booking_id } })
  if (existing) return existing

  const booking = await db.booking.findUnique({
    where: { id: booking_id },
    select: { property_id: true, check_out: true },
  })
  if (!booking) throw new Error(`Booking ${booking_id} not found`)

  return db.cleaningTask.create({
    data: {
      booking_id,
      property_id: booking.property_id,
      date_prevue: booking.check_out,
      statut: "PLANIFIEE",
      checklist: [],
      photos: [],
    },
  })
}

export async function updateCleaningStatut(
  id: string,
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"
) {
  return db.cleaningTask.update({
    where: { id },
    data: {
      statut,
      ...(statut === "TERMINEE" ? { date_realisation: new Date() } : {}),
    },
  })
}
