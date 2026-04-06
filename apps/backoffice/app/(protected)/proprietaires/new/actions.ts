"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ownerSchema } from "@/lib/validations/owner"
import { createOwner } from "@/lib/dal/owners"

export async function createOwnerAction(_prev: unknown, formData: FormData) {
  const raw = {
    type: formData.get("type"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone") || undefined,
    adresse: {
      rue: formData.get("adresse.rue"),
      complement: formData.get("adresse.complement") || undefined,
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: formData.get("adresse.pays") || "France",
    },
    rib_iban: formData.get("rib_iban") || undefined,
    nif: formData.get("nif") || undefined,
    notes: formData.get("notes") || undefined,
  }

  const parsed = ownerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const owner = await createOwner(parsed.data)
  revalidatePath("/proprietaires")
  redirect(`/proprietaires/${owner.id}`)
}

