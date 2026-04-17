"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { createService, updateService, deleteService } from "@/lib/dal/catalogue"

export async function createServiceAction(data: {
  nom: string; description?: string; categorie: string
  tarif: number; unite: "ACTE" | "HEURE" | "NUIT" | "MOIS"; tva_rate?: number
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await createService(data)
  revalidatePath("/catalogue")
  return { success: true }
}

export async function updateServiceAction(id: string, data: Partial<{
  nom: string; description: string | null; categorie: string
  tarif: number; unite: "ACTE" | "HEURE" | "NUIT" | "MOIS"; tva_rate: number; actif: boolean
}>) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateService(id, data)
  revalidatePath("/catalogue")
  return { success: true }
}

export async function deleteServiceAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await deleteService(id)
  revalidatePath("/catalogue")
  return { success: true }
}
