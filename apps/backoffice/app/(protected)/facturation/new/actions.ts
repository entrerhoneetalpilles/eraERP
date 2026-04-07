"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { factureSchema, computeMontantTTC } from "@/lib/validations/facture"
import { createFeeInvoice } from "@/lib/dal/facturation"
import { getOwnerById } from "@/lib/dal/owners"
import { sendFactureEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"

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

  const invoice = await createFeeInvoice({
    owner_id,
    periode_debut: new Date(periode_debut),
    periode_fin: new Date(periode_fin),
    montant_ht,
    tva_rate,
    montant_ttc,
  })

  // Email au propriétaire
  try {
    const owner = await getOwnerById(owner_id)
    if (owner?.email) {
      const periodeLabel = `${new Date(periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — ${new Date(periode_fin).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
      const result = await sendFactureEmail({
        to: owner.email,
        ownerName: owner.nom,
        numeroFacture: invoice.numero_facture,
        periode: periodeLabel,
        montantHT: montant_ht.toFixed(2),
        montantTTC: montant_ttc.toFixed(2),
        portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/documents`,
      })
      await logEmail({
        to: owner.email,
        subject: `Facture d'honoraires n° ${invoice.numero_facture}`,
        template: "facture",
        resend_id: (result as any)?.id,
        owner_id: owner.id,
      })
    }
  } catch (e) {
    console.error("[Email] Erreur facture:", e)
  }

  revalidatePath("/facturation")
  redirect("/facturation")
}
