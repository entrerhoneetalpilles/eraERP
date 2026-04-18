"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { updateServiceOrderStatut } from "@/lib/dal/service-orders"

export async function updateStatutAction(
  id: string,
  statut: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateServiceOrderStatut(id, statut, statut === "COMPLETED" ? new Date() : undefined)
  revalidatePath("/commandes-services")
  return { success: true }
}
