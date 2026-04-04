"use server"

import { revalidatePath } from "next/cache"
import { updateBookingStatut } from "@/lib/dal/bookings"
import { autoCreateCleaningTask } from "@/lib/dal/menage"

export async function updateBookingStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "PENDING" | "CONFIRMED" | "CHECKEDIN" | "CHECKEDOUT" | "CANCELLED"
  if (!statut) return
  await updateBookingStatut(id, statut)
  if (statut === "CHECKEDOUT") {
    try {
      await autoCreateCleaningTask(id)
    } catch (e) {
      console.error("[autoCreateCleaningTask] Failed for booking", id, e)
    }
  }
  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
  revalidatePath("/menage")
}
