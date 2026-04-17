"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { updateMandateStatut, deleteMandate } from "@/lib/dal/mandates"
import { db } from "@conciergerie/db"

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

export async function createAvenantAction(mandateId: string, data: {
  date: string
  description: string
  modifications: string
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const count = await db.mandateAmendment.count({ where: { mandate_id: mandateId } })
  await db.mandateAmendment.create({
    data: {
      mandate_id: mandateId,
      numero: count + 1,
      date: new Date(data.date),
      description: data.description,
      modifications: { texte: data.modifications },
    },
  })
  revalidatePath(`/mandats/${mandateId}`)
  return { success: true }
}

export async function deleteAvenantAction(avenantId: string, mandateId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.mandateAmendment.delete({ where: { id: avenantId } })
  revalidatePath(`/mandats/${mandateId}`)
  return { success: true }
}
