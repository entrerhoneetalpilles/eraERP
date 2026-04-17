"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { updatePdfTemplate } from "@/lib/dal/pdf-templates"
import type { TemplateConfig } from "@/lib/pdf/template-types"

export async function saveTemplateAction(id: string, nom: string, config: TemplateConfig) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  if (!nom.trim()) return { error: "Nom requis" }
  await updatePdfTemplate(id, { nom: nom.trim(), config })
  revalidatePath(`/modeles/${id}`)
  revalidatePath("/modeles")
  return { success: true }
}
