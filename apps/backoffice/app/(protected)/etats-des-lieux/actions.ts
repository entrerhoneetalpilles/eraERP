"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { createPropertyInventory, updateInventorySignatures } from "@/lib/dal/inventaires"

const createSchema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  booking_id: z.string().optional(),
  type: z.enum(["ENTREE", "SORTIE"]),
  date: z.string().min(1, "Date requise"),
  realise_par: z.string().min(1, "Réalisé par requis"),
})

export async function createInventoryAction(_prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const parsed = createSchema.safeParse({
    property_id: formData.get("property_id"),
    booking_id: formData.get("booking_id") || undefined,
    type: formData.get("type"),
    date: formData.get("date"),
    realise_par: formData.get("realise_par"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await createPropertyInventory({
    ...parsed.data,
    date: new Date(parsed.data.date),
  })
  revalidatePath("/etats-des-lieux")
  return { success: true }
}

export async function updatePiecesAction(id: string, pieces: object[]) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const { updateInventoryPieces } = await import("@/lib/dal/inventaires")
  await updateInventoryPieces(id, pieces)
  revalidatePath(`/etats-des-lieux/${id}`)
  revalidatePath("/etats-des-lieux")
  return { success: true }
}

export async function signInventoryAction(
  id: string,
  role: "voyageur" | "agent"
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateInventorySignatures(id, {
    signe_voyageur: role === "voyageur" ? true : undefined,
    signe_agent: role === "agent" ? true : undefined,
  })
  revalidatePath("/etats-des-lieux")
  return { success: true }
}
