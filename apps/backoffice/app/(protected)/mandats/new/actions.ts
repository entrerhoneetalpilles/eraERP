"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { mandateSchema } from "@/lib/validations/mandate"
import { createMandate, getNextMandateNumber } from "@/lib/dal/mandates"

export async function createMandateAction(_prev: unknown, formData: FormData) {
  const raw = {
    owner_id: formData.get("owner_id"),
    property_id: formData.get("property_id"),
    numero_mandat: formData.get("numero_mandat"),
    date_debut: formData.get("date_debut"),
    date_fin: formData.get("date_fin") || undefined,
    taux_honoraires: formData.get("taux_honoraires"),
    honoraires_location: formData.get("honoraires_location") || undefined,
    taux_horaire_ht: formData.get("taux_horaire_ht") || undefined,
    seuil_validation_devis: formData.get("seuil_validation_devis") || 500,
    reconduction_tacite: formData.get("reconduction_tacite") === "true",
    prestations_incluses: formData.getAll("prestations_incluses"),
  }

  const parsed = mandateSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const mandate = await createMandate({
    ...parsed.data,
    date_debut: new Date(parsed.data.date_debut),
    date_fin: parsed.data.date_fin ? new Date(parsed.data.date_fin) : undefined,
    prestations_incluses: parsed.data.prestations_incluses ?? [],
  })

  revalidatePath("/mandats")
  redirect(`/mandats/${mandate.id}`)
}

export async function getNextMandateNumberAction() {
  return getNextMandateNumber()
}

