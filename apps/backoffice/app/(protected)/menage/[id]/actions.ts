"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { updateCleaningStatut } from "@/lib/dal/menage"

const VALID_STATUTS = ["PLANIFIEE", "EN_COURS", "TERMINEE", "PROBLEME"] as const
const statutSchema = z.enum(VALID_STATUTS)

export async function updateCleaningStatutAction(
  id: string,
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME"
) {
  const session = await auth()
  if (!session?.user) return

  const parsedId = z.string().min(1).safeParse(id)
  const parsedStatut = statutSchema.safeParse(statut)
  if (!parsedId.success || !parsedStatut.success) return
  await updateCleaningStatut(parsedId.data, parsedStatut.data)
  revalidatePath(`/menage/${parsedId.data}`)
  revalidatePath("/menage")
}
