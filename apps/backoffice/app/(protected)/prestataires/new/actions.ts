"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prestataireSchema } from "@/lib/validations/prestataire"
import { createPrestataire } from "@/lib/dal/prestataires"

export async function createPrestataireAction(
  _prev: unknown,
  formData: FormData
) {
  const raw = {
    nom: formData.get("nom"),
    metier: formData.get("metier"),
    email: formData.get("email") || undefined,
    telephone: formData.get("telephone") || undefined,
    siret: formData.get("siret") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = prestataireSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createPrestataire(parsed.data)
  revalidatePath("/prestataires")
  redirect("/prestataires")
}

