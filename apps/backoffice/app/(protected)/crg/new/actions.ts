"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/auth"
import { generateCrg } from "@/lib/dal/crg"

const schema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  periode_debut: z.string().min(1, "Date début requise"),
  periode_fin: z.string().min(1, "Date fin requise"),
})

export async function generateCrgAction(_prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const raw = {
    owner_id: formData.get("owner_id"),
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const periodeFin = new Date(parsed.data.periode_fin)
    periodeFin.setHours(23, 59, 59, 999)
    await generateCrg({
      owner_id: parsed.data.owner_id,
      periode_debut: new Date(parsed.data.periode_debut),
      periode_fin: periodeFin,
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de la génération" }
  }

  redirect("/crg")
}
