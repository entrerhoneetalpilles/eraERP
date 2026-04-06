"use server"

import { redirect } from "next/navigation"
import { propertySchema } from "@/lib/validations/property"
import { createProperty } from "@/lib/dal/properties"

export async function createPropertyAction(_prev: unknown, formData: FormData) {
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
    statut: "ACTIF",
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createProperty(parsed.data)
  redirect("/biens")
}

