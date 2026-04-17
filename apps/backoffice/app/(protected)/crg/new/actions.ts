"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/auth"
import { generateCrg } from "@/lib/dal/crg"
import { getOwnerById } from "@/lib/dal/owners"
import { sendCrgMensuelEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"
import { saveCrgPdfToDocuments } from "@/lib/pdf/auto-save"

const schema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  periode_debut: z.string().min(1, "Date début requise"),
  periode_fin: z.string().min(1, "Date fin requise"),
})

export async function generateCrgAction(_prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const raw = {
    owner_id: formData.get("owner_id"),
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  let report: Awaited<ReturnType<typeof generateCrg>>
  try {
    const periodeFin = new Date(parsed.data.periode_fin)
    periodeFin.setHours(23, 59, 59, 999)
    report = await generateCrg({
      owner_id: parsed.data.owner_id,
      periode_debut: new Date(parsed.data.periode_debut),
      periode_fin: periodeFin,
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de la génération" }
  }

  // Auto-save PDF to S3 + Document record
  try {
    await saveCrgPdfToDocuments(report.id)
  } catch (e) {
    console.error("[PDF] Erreur sauvegarde CRG PDF:", e)
  }

  // Email au propriétaire
  try {
    const owner = await getOwnerById(parsed.data.owner_id)
    if (owner?.email) {
      const periodeLabel = `${new Date(parsed.data.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
      const result = await sendCrgMensuelEmail({
        to: owner.email,
        ownerName: owner.nom,
        periode: periodeLabel,
        revenusBruts: report.revenus_sejours.toFixed(2),
        fraisGestion: report.honoraires_deduits.toFixed(2),
        autresCharges: report.charges_deduites.toFixed(2),
        revenuNet: report.montant_reverse.toFixed(2),
        portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/finances`,
      })
      await logEmail({
        to: owner.email,
        subject: `Compte-rendu de gestion — ${periodeLabel}`,
        template: "crg-mensuel",
        resend_id: (result as any)?.id,
        owner_id: owner.id,
      })
    }
  } catch (e) {
    console.error("[Email] Erreur crg-mensuel:", e)
  }

  redirect("/crg")
}
