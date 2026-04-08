"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { updateMandateStatut, deleteMandate } from "@/lib/dal/mandates"

export async function updateMandateStatutAction(id: string, formData: FormData) {
  const statut = formData.get("statut") as "ACTIF" | "SUSPENDU" | "RESILIE"
  if (!statut) return

  await updateMandateStatut(id, statut)
  revalidatePath(`/mandats/${id}`)
  revalidatePath("/mandats")
}

export async function changeMandateStatusAction(id: string, statut: "ACTIF" | "SUSPENDU" | "RESILIE") {
  await updateMandateStatut(id, statut)
  revalidatePath(`/mandats/${id}`)
  revalidatePath("/mandats")
}

export async function deleteMandateAction(id: string) {
  try {
    await deleteMandate(id)
    revalidatePath("/mandats")
    redirect("/mandats")
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
