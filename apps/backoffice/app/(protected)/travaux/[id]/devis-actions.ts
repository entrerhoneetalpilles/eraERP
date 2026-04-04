"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { devisSchema, validateDevisAgainstSeuil } from "@/lib/validations/devis"
import { getWorkOrderWithMandate, saveDevis } from "@/lib/dal/travaux"

const SEUIL_DEFAUT = 500

export async function saveDevisAction(id: string, _prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const raw = {
    montant_devis: parseFloat(formData.get("montant_devis") as string),
    notes_devis: (formData.get("notes_devis") as string) || undefined,
  }

  const parsed = devisSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const parsedId = z.string().min(1).safeParse(id)
  if (!parsedId.success) return { error: "ID invalide" }

  const wo = await getWorkOrderWithMandate(parsedId.data)
  if (!wo) return { error: "Ordre de service introuvable" }

  if (wo.statut !== "EN_ATTENTE_DEVIS") {
    return { error: "L'ordre de service n'est pas en attente de devis" }
  }

  const seuil = wo.property.mandate?.seuil_validation_devis ?? SEUIL_DEFAUT
  const next_statut = validateDevisAgainstSeuil(parsed.data.montant_devis, seuil)

  await saveDevis(parsedId.data, { ...parsed.data, next_statut })
  revalidatePath(`/travaux/${parsedId.data}`)
  revalidatePath("/travaux")
  return { success: true }
}
