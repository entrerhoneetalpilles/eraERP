import { db } from "@conciergerie/db"

export async function getBookings(filters?: { property_id?: string }) {
  return db.booking.findMany({
    where: filters,
    orderBy: { check_in: "desc" },
    include: {
      property: true,
      guest: true,
    },
  })
}

export async function getBookingById(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: {
      property: {
        include: { access: true, mandate: { include: { owner: true } } },
      },
      guest: true,
    },
  })
}

export async function createBooking(data: {
  property_id: string
  guest_id: string
  platform: "AIRBNB" | "DIRECT" | "MANUAL"
  platform_booking_id?: string
  check_in: Date
  check_out: Date
  nb_nuits: number
  nb_voyageurs: number
  montant_total: number
  frais_menage: number
  commission_plateforme: number
  revenu_net_proprietaire: number
  notes_internes?: string
}) {
  const booking = await db.booking.create({ data })
  // Incrémenter le compteur de séjours du voyageur
  await db.guest.update({
    where: { id: data.guest_id },
    data: { nb_sejours: { increment: 1 } },
  })
  return booking
}

export async function updateBookingStatut(
  id: string,
  statut: "PENDING" | "CONFIRMED" | "CHECKEDIN" | "CHECKEDOUT" | "CANCELLED"
) {
  return db.booking.update({ where: { id }, data: { statut } })
}
