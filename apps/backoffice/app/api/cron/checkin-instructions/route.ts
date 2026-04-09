import { NextRequest, NextResponse } from "next/server"
import { getBookingsForCheckin, markInstructionsEnvoyees } from "@/lib/dal/bookings"
import { sendAccessCodesEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const bookings = await getBookingsForCheckin()

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const booking of bookings) {
    const guestEmail = booking.guest.email
    if (!guestEmail) {
      skipped++
      continue
    }

    try {
      const access = booking.property.access
      const checkInFormatted = new Date(booking.check_in).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      const checkOutFormatted = new Date(booking.check_out).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      await sendAccessCodesEmail({
        to: guestEmail,
        guestName: `${booking.guest.prenom} ${booking.guest.nom}`,
        propertyName: booking.property.nom,
        checkIn: checkInFormatted,
        checkOut: checkOutFormatted,
        typeAcces: access?.type_acces ?? "Manuel",
        codeAcces: access?.code_acces ?? null,
        instructionsArrivee: access?.instructions_arrivee ?? null,
        wifiNom: access?.wifi_nom ?? null,
        wifiMdp: access?.wifi_mdp ?? null,
      })

      await markInstructionsEnvoyees(booking.id)

      sent++
      console.log(`[checkin-instructions] Envoyé à ${guestEmail} pour réservation ${booking.id}`)
    } catch (err) {
      errors++
      console.error(`[checkin-instructions] Erreur réservation ${booking.id}:`, err)
    }
  }

  return NextResponse.json({ sent, skipped, errors, total: bookings.length })
}
