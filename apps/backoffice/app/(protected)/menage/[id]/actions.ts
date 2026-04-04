"use server"

import { revalidatePath } from "next/cache"
import { updateCleaningStatut } from "@/lib/dal/menage"

export async function updateCleaningStatutAction(
  id: string,
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"
) {
  await updateCleaningStatut(id, statut)
  revalidatePath(`/menage/${id}`)
  revalidatePath("/menage")
}
