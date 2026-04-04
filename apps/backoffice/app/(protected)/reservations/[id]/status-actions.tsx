"use client"

import { updateBookingStatutAction } from "./actions"
import { Button } from "@conciergerie/ui"

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  PENDING: [{ label: "Confirmer", next: "CONFIRMED" }],
  CONFIRMED: [
    { label: "Check-in", next: "CHECKEDIN" },
    { label: "Annuler", next: "CANCELLED" },
  ],
  CHECKEDIN: [{ label: "Check-out", next: "CHECKEDOUT" }],
  CHECKEDOUT: [],
  CANCELLED: [],
}

interface Props { id: string; statut: string }

export function BookingStatusActions({ id, statut }: Props) {
  const transitions = TRANSITIONS[statut] ?? []
  if (transitions.length === 0) return null
  return (
    <div className="flex gap-2">
      {transitions.map(({ label, next }) => {
        const action = updateBookingStatutAction.bind(null, id)
        return (
          <form key={next} action={action}>
            <input type="hidden" name="statut" value={next} />
            <Button
              type="submit"
              size="sm"
              variant={next === "CANCELLED" ? "outline" : "default"}
              className="cursor-pointer"
            >
              {label}
            </Button>
          </form>
        )
      })}
    </div>
  )
}
