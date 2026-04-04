"use server"

import { revalidatePath } from "next/cache"
import { updateBookingStatut } from "@/lib/dal/bookings"

export async function updateBookingStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "PENDING" | "CONFIRMED" | "CHECKEDIN" | "CHECKEDOUT" | "CANCELLED"
  if (!statut) return
  await updateBookingStatut(id, statut)
  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
}
