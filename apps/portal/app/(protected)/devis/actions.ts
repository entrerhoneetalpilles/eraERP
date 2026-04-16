"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { getWorkOrderForOwner } from "@/lib/dal/travaux"

export async function validateDevisAction(workOrderId: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const wo = await getWorkOrderForOwner(session.user.ownerId, workOrderId)
  if (!wo) return { error: "Introuvable ou non autorisé" }
  if (wo.statut !== "EN_ATTENTE_VALIDATION") return { error: "Ce devis n'est pas en attente de validation" }

  await db.workOrder.update({
    where: { id: workOrderId },
    data: { statut: "VALIDE" },
  })

  revalidatePath("/devis")
  redirect("/devis")
}

export async function refuseDevisAction(workOrderId: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  const wo = await getWorkOrderForOwner(session.user.ownerId, workOrderId)
  if (!wo) return { error: "Introuvable ou non autorisé" }
  if (wo.statut !== "EN_ATTENTE_VALIDATION") return { error: "Ce devis n'est pas en attente de validation" }

  await db.workOrder.update({
    where: { id: workOrderId },
    data: { statut: "ANNULE" },
  })

  revalidatePath("/devis")
  redirect("/devis")
}
