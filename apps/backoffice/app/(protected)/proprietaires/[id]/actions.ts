"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ownerSchema } from "@/lib/validations/owner"
import { updateOwner, deleteOwner, createOrResetOwnerPortalAccess } from "@/lib/dal/owners"

export async function updateOwnerAction(id: string, _prev: unknown, formData: FormData) {
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
  try {
    await deleteOwner(id)
  } catch (e: any) {
    return { error: e.message ?? "Suppression impossible" }
  }
  revalidatePath("/proprietaires")
  redirect("/proprietaires")
}

export async function createPortalAccessAction(ownerId: string): Promise<{
  tempPassword?: string
  email?: string
  action?: "created" | "reset"
  error?: string
}> {
  try {
    const result = await createOrResetOwnerPortalAccess(ownerId)
    revalidatePath(`/proprietaires/${ownerId}`)
    return result
  } catch (e: any) {
    return { error: e.message ?? "Erreur lors de la création de l'accès portail" }
  }
}
