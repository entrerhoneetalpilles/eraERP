"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { workorderSchema } from "@/lib/validations/workorder"
import { createWorkOrder } from "@/lib/dal/travaux"
import { db } from "@conciergerie/db"
import { sendDevisDemandEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"

export async function createWorkOrderAction(
  _prev: unknown,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Non authentifié")

  const raw = {
    property_id: formData.get("property_id"),
    contractor_id: formData.get("contractor_id") || undefined,
    titre: formData.get("titre"),
    description: formData.get("description"),
    type: formData.get("type"),
    urgence: formData.get("urgence"),
    imputable_a: formData.get("imputable_a"),
    notes: formData.get("notes") || undefined,
  }

  const parsed = workorderSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const workOrder = await createWorkOrder(session.user.email, parsed.data)

  // Email au prestataire si assigné
  if (workOrder.contractor_id) {
    try {
      const [contractor, property] = await Promise.all([
        db.contractor.findUnique({ where: { id: workOrder.contractor_id }, select: { nom: true, email: true } }),
        db.property.findUnique({ where: { id: workOrder.property_id }, select: { nom: true } }),
      ])
      if (contractor?.email && property) {
        const result = await sendDevisDemandEmail({
          to: contractor.email,
          contractorName: contractor.nom,
          propertyName: property.nom,
          titreOrdre: workOrder.titre,
          description: workOrder.description ?? "",
          urgence: workOrder.urgence,
        })
        await logEmail({
          to: contractor.email,
          subject: `Demande de devis — ${workOrder.titre}`,
          template: "devis-demande",
          resend_id: (result as any)?.id,
        })
      }
    } catch (e) {
      console.error("[Email] Erreur devis-demande:", e)
    }
  }

  revalidatePath("/travaux")
  redirect("/travaux")
}
