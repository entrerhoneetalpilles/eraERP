"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  createPdfTemplate,
  deletePdfTemplate,
  duplicatePdfTemplate,
  setDefaultTemplate,
} from "@/lib/dal/pdf-templates"
import type { PdfTemplateType } from "@/lib/pdf/template-types"

export async function createTemplateAction(nom: string, type: PdfTemplateType) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  if (!nom.trim()) return { error: "Nom requis" }
  const tpl = await createPdfTemplate({ nom: nom.trim(), type })
  revalidatePath("/modeles")
  redirect(`/modeles/${tpl.id}`)
}

export async function deleteTemplateAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await deletePdfTemplate(id)
  revalidatePath("/modeles")
  return { success: true }
}

export async function duplicateTemplateAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const copy = await duplicatePdfTemplate(id)
  revalidatePath("/modeles")
  return { success: true, id: copy.id }
}

export async function setDefaultTemplateAction(id: string, type: PdfTemplateType) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await setDefaultTemplate(id, type)
  revalidatePath("/modeles")
  return { success: true }
}
