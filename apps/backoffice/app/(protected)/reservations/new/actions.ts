"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { bookingSchema } from "@/lib/validations/booking"
import { createBooking } from "@/lib/dal/bookings"

export async function createBookingAction(formData: FormData) {
  const raw = {
    property_id: formData.get("property_id"),
    guest_id: formData.get("guest_id"),
    platform: formData.get("platform") || "DIRECT",
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    nb_nuits: formData.get("nb_nuits"),
    nb_voyageurs: formData.get("nb_voyageurs"),
    montant_total: formData.get("montant_total"),
    frais_menage: formData.get("frais_menage") || 0,
    commission_plateforme: formData.get("commission_plateforme") || 0,
    revenu_net_proprietaire: formData.get("revenu_net_proprietaire"),
    notes_internes: formData.get("notes_internes") || undefined,
  }

  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const booking = await createBooking({
    ...parsed.data,
    check_in: new Date(parsed.data.check_in),
    check_out: new Date(parsed.data.check_out),
  })

  revalidatePath("/reservations")
  redirect(`/reservations/${booking.id}`)
}
