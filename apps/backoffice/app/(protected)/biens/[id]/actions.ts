"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { propertySchema } from "@/lib/validations/property"
import { updateProperty, upsertPropertyAccess } from "@/lib/dal/properties"

export async function updatePropertyAction(id: string, _prev: unknown, formData: FormData) {
  const raw = {
    nom: formData.get("nom"),
    type: formData.get("type"),
    superficie: formData.get("superficie"),
    nb_chambres: formData.get("nb_chambres"),
    capacite_voyageurs: formData.get("capacite_voyageurs"),
    adresse: {
      rue: formData.get("adresse.rue"),
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: "France",
    },
    statut: formData.get("statut") || "ACTIF",
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateProperty(id, parsed.data)
  revalidatePath(`/biens/${id}`)
  revalidatePath("/biens")
  redirect(`/biens/${id}`)
}

export async function updatePropertyAccessAction(property_id: string, _prev: unknown, formData: FormData) {
  const data = {
    type_acces: formData.get("type_acces") as "BOITE_CLES" | "CODE" | "AGENT" | "SERRURE_CONNECTEE",
    code_acces: (formData.get("code_acces") as string) || undefined,
    instructions_arrivee: (formData.get("instructions_arrivee") as string) || undefined,
    wifi_nom: (formData.get("wifi_nom") as string) || undefined,
    wifi_mdp: (formData.get("wifi_mdp") as string) || undefined,
    notes_depart: (formData.get("notes_depart") as string) || undefined,
  }

  await upsertPropertyAccess(property_id, data)
  revalidatePath(`/biens/${property_id}`)
  redirect(`/biens/${property_id}`)
}
