"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { updateInvoiceStatut } from "@/lib/dal/facturation"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { getOwnerById } from "@/lib/dal/owners"
import { sendFactureEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"

export async function updateInvoiceStatutAction(
  id: string,
  statut: "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  await updateInvoiceStatut(id, statut)
  revalidatePath(`/facturation/${id}`)
  revalidatePath("/facturation")
  return { success: true }
}

export async function resendFactureEmailAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const invoice = await getFeeInvoiceById(id)
  if (!invoice) return { error: "Facture introuvable" }

  const owner = await getOwnerById(invoice.owner_id)
  if (!owner?.email) return { error: "Email propriétaire manquant" }

  const periodeLabel = `${new Date(invoice.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — ${new Date(invoice.periode_fin).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`

  try {
    const result = await sendFactureEmail({
      to: owner.email,
      ownerName: owner.nom,
      numeroFacture: invoice.numero_facture,
      periode: periodeLabel,
      montantHT: invoice.montant_ht.toFixed(2),
      montantTTC: invoice.montant_ttc.toFixed(2),
      portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/documents`,
    })
    await logEmail({
      to: owner.email,
      subject: `Facture d'honoraires n° ${invoice.numero_facture}`,
      template: "facture",
      resend_id: (result as any)?.id,
      owner_id: owner.id,
    })
    return { success: true }
  } catch (e) {
    console.error("[Email] Erreur renvoi facture:", e)
    return { error: "Échec de l'envoi" }
  }
}
