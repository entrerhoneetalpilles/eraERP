"use server"

import { revalidatePath } from "next/cache"
import { updateWorkOrderStatut } from "@/lib/dal/travaux"

export async function updateWorkOrderStatutAction(
  id: string,
  statut: "OUVERT" | "EN_COURS" | "EN_ATTENTE_DEVIS" | "EN_ATTENTE_VALIDATION" | "VALIDE" | "TERMINE" | "ANNULE"
) {
  await updateWorkOrderStatut(id, statut)
  revalidatePath(`/travaux/${id}`)
  revalidatePath("/travaux")
}
