"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { updateDevisStatut, getDevisById } from "@/lib/dal/devis"
import { sendTravauxNotificationEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"
import { saveDevisPdfToDocuments } from "@/lib/pdf/auto-save"

export async function validateDevisAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateDevisStatut(id, "VALIDE")

  // Auto-save PDF to S3 + Document record
  try {
    await saveDevisPdfToDocuments(id)
  } catch (e) {
    console.error("[PDF] Erreur sauvegarde devis PDF:", e)
  }

  revalidatePath(`/devis/${id}`)
  revalidatePath("/devis")
  return { success: true }
}

export async function cancelDevisAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateDevisStatut(id, "ANNULE")
  revalidatePath(`/devis/${id}`)
  revalidatePath("/devis")
  return { success: true }
}

export async function sendDevisToOwnerAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const devis = await getDevisById(id)
  if (!devis) return { error: "Devis introuvable" }

  const owner = devis.property.mandate?.owner
  if (!owner?.email) return { error: "Aucun email propriétaire associé à ce bien" }

  const montantStr = (devis.montant_devis ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

  // Save PDF before sending so the document is available on the portal
  try {
    await saveDevisPdfToDocuments(id)
  } catch (e) {
    console.error("[PDF] Erreur sauvegarde devis PDF:", e)
  }

  try {
    await sendTravauxNotificationEmail({
      to: owner.email,
      ownerName: owner.nom,
      propertyName: devis.property.nom,
      titreOrdre: devis.titre,
      urgence: devis.urgence,
      description: `Un devis de ${montantStr} est en attente de votre approbation. Connectez-vous à votre espace propriétaire pour valider ou refuser ce devis.`,
    })
    await logEmail({
      to: owner.email,
      subject: `Devis à valider — ${devis.titre}`,
      template: "travaux-notification",
      owner_id: owner.id,
    })
    return { success: true }
  } catch (e) {
    console.error("[Email] Erreur envoi devis:", e)
    return { error: "Échec de l'envoi" }
  }
}
