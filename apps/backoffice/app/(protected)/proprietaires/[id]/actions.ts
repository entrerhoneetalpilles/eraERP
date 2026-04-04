"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ownerSchema } from "@/lib/validations/owner"
import { updateOwner, deleteOwner } from "@/lib/dal/owners"

export async function updateOwnerAction(id: string, formData: FormData) {
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

  await updateOwner(id, parsed.data)
  revalidatePath(`/proprietaires/${id}`)
  revalidatePath("/proprietaires")
  redirect(`/proprietaires/${id}`)
}

export async function deleteOwnerAction(id: string) {
  await deleteOwner(id)
  revalidatePath("/proprietaires")
  redirect("/proprietaires")
}
