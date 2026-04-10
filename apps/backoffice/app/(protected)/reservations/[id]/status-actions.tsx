"use client"

import { updateBookingStatutAction } from "./actions"
import { CheckinForm } from "./checkin-form"
import { CheckoutForm } from "./checkout-form"
import { Button } from "@conciergerie/ui"

interface Props { id: string; statut: string; guestId: string }

export function BookingStatusActions({ id, statut, guestId }: Props) {
  if (statut === "CONFIRMED") {
    return <CheckinForm bookingId={id} />
  }

  if (statut === "CHECKEDIN") {
    return <CheckoutForm bookingId={id} guestId={guestId} />
  }

  if (statut === "PENDING") {
    const action = updateBookingStatutAction.bind(null, id)
    return (
      <form action={action}>
        <input type="hidden" name="statut" value="CONFIRMED" />
        <Button type="submit" size="sm" className="cursor-pointer">Confirmer</Button>
      </form>
    )
  }

  return null
}
