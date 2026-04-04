"use server"

import { revalidatePath } from "next/cache"
import { updateMandateStatut } from "@/lib/dal/mandates"

export async function updateMandateStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "ACTIF" | "SUSPENDU" | "RESILIE"
  if (!statut) return { error: "Statut requis" }

  await updateMandateStatut(id, statut)
  revalidatePath(`/mandats/${id}`)
  revalidatePath("/mandats")
}
