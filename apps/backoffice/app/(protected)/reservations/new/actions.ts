"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { bookingSchema } from "@/lib/validations/booking"
import { createBooking, getBookingById } from "@/lib/dal/bookings"
import { sendBookingConfirmedEmail, sendAccessCodesEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"

export async function createBookingAction(_prev: unknown, formData: FormData) {
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

  // Emails transactionnels
  const full = await getBookingById(booking.id)
  if (full) {
    const checkInStr = new Date(full.check_in).toLocaleDateString("fr-FR")
    const checkOutStr = new Date(full.check_out).toLocaleDateString("fr-FR")

    // Email au propriétaire
    if (full.property.mandate?.owner?.email) {
      try {
        const result = await sendBookingConfirmedEmail({
          to: full.property.mandate.owner.email,
          ownerName: full.property.mandate.owner.nom,
          propertyName: full.property.nom,
          guestName: `${full.guest.prenom} ${full.guest.nom}`,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          nbNuits: full.nb_nuits,
          revenuNet: full.revenu_net_proprietaire.toFixed(2),
        })
        await logEmail({
          to: full.property.mandate.owner.email,
          subject: `Nouvelle réservation — ${full.property.nom}`,
          template: "booking-confirmed",
          resend_id: (result as any)?.id,
          owner_id: full.property.mandate.owner.id,
          booking_id: full.id,
        })
      } catch (e) {
        console.error("[Email] Erreur booking-confirmed owner:", e)
      }
    }

    // Email au voyageur avec codes d'accès si disponibles
    if (full.guest.email && full.property.access) {
      try {
        const access = full.property.access
        const result = await sendAccessCodesEmail({
          to: full.guest.email,
          guestName: full.guest.prenom,
          propertyName: full.property.nom,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          typeAcces: (access as any).type_acces ?? "CODE",
          codeAcces: (access as any).code_acces ?? null,
          instructionsArrivee: (access as any).instructions_arrivee ?? null,
          wifiNom: (access as any).wifi_nom ?? null,
          wifiMdp: (access as any).wifi_mdp ?? null,
        })
        await logEmail({
          to: full.guest.email,
          subject: `Informations d'accès — ${full.property.nom}`,
          template: "access-codes",
          resend_id: (result as any)?.id,
          booking_id: full.id,
        })
      } catch (e) {
        console.error("[Email] Erreur access-codes guest:", e)
      }
    }
  }

  revalidatePath("/reservations")
  redirect(`/reservations/${booking.id}`)
}
