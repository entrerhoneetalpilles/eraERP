"use server"

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createDevis } from "@/lib/dal/devis"
import { db } from "@conciergerie/db"
import { sendTravauxNotificationEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"
import { z } from "zod"

const schema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  titre: z.string().min(2, "Titre requis"),
  description: z.string().optional(),
  type: z.string().min(1, "Type requis"),
  urgence: z.enum(["NORMALE", "URGENTE", "CRITIQUE"]),
  imputable_a: z.enum(["PROPRIETAIRE", "SOCIETE"]),
  montant_devis: z.coerce.number().positive("Montant doit être positif"),
  notes_devis: z.string().optional(),
  contractor_id: z.string().optional(),
})

export async function createDevisAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData.entries())
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" }
  }

  const data = parsed.data

  // Fetch seuil from mandate
  const mandate = await db.mandate.findFirst({
    where: { property_id: data.property_id },
    select: {
      seuil_validation_devis: true,
      owner: { select: { id: true, nom: true, email: true } },
    },
  })
  const seuil = mandate?.seuil_validation_devis ?? 500

  const devis = await createDevis({
    property_id: data.property_id,
    titre: data.titre,
    description: data.description ?? "",
    type: data.type,
    urgence: data.urgence,
    imputable_a: data.imputable_a,
    montant_devis: data.montant_devis,
    notes_devis: data.notes_devis,
    contractor_id: data.contractor_id || undefined,
    created_by: session.user.email ?? "system",
    seuil,
  })

  // Notify owner if linked to a mandate
  if (mandate?.owner?.email) {
    const property = await db.property.findUnique({
      where: { id: data.property_id },
      select: { nom: true },
    })
    try {
      await sendTravauxNotificationEmail({
        to: mandate.owner.email,
        ownerName: mandate.owner.nom,
        propertyName: property?.nom ?? "",
        titreOrdre: data.titre,
        urgence: data.urgence,
        description:
          devis.statut === "EN_ATTENTE_VALIDATION"
            ? `Un devis de ${data.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} a été établi et nécessite votre approbation dans votre espace propriétaire.`
            : `Un devis de ${data.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} a été établi et approuvé automatiquement.`,
      })
      await logEmail({
        to: mandate.owner.email,
        subject: `Devis — ${data.titre}`,
        template: "travaux-notification",
        owner_id: mandate.owner.id,
      })
    } catch (e) {
      console.error("[Email] Erreur notification devis:", e)
    }
  }

  redirect(`/devis/${devis.id}`)
}
