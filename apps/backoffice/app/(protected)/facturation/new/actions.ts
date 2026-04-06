"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { factureSchema, computeMontantTTC } from "@/lib/validations/facture"
import { createFeeInvoice } from "@/lib/dal/facturation"

export async function createFactureAction(
  _prev: unknown,
  formData: FormData
) {
  const raw = {
    owner_id: formData.get("owner_id"),
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
    montant_ht: formData.get("montant_ht"),
    tva_rate: formData.get("tva_rate"),
  }

  const parsed = factureSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { owner_id, periode_debut, periode_fin, montant_ht, tva_rate } = parsed.data
  const montant_ttc = computeMontantTTC(montant_ht, tva_rate)

  await createFeeInvoice({
    owner_id,
    periode_debut: new Date(periode_debut),
    periode_fin: new Date(periode_fin),
    montant_ht,
    tva_rate,
    montant_ttc,
  })

  revalidatePath("/facturation")
  redirect("/facturation")
}

