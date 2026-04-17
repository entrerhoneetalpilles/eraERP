"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { factureSchema, lineItemSchema, computeMontantTTC } from "@/lib/validations/facture"
import { createFeeInvoice, getNextInvoiceNumber } from "@/lib/dal/facturation"
import { getOwnerById } from "@/lib/dal/owners"
import { sendFactureEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"

export interface RevenusItem {
  propertyId: string
  propertyName: string
  taux: number
  revenusNet: number
  honoraires: number
  nbSejours: number
}

export async function getRevenusForFactureAction(
  ownerId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ error?: string; items?: RevenusItem[]; totalHonoraires?: number }> {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  if (!ownerId || !periodStart || !periodEnd) return { error: "Paramètres manquants" }

  const bookings = await db.booking.findMany({
    where: {
      statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] },
      check_out: { gte: new Date(periodStart), lte: new Date(periodEnd) },
      property: { mandate: { owner_id: ownerId } },
    },
    include: { property: { include: { mandate: true } } },
  })

  const byProperty = new Map<string, { nom: string; taux: number; revenu: number; nb: number }>()
  for (const b of bookings) {
    const mandate = b.property.mandate
    if (!mandate) continue
    const existing = byProperty.get(b.property_id)
    if (existing) {
      existing.revenu += b.revenu_net_proprietaire
      existing.nb++
    } else {
      byProperty.set(b.property_id, {
        nom: b.property.nom,
        taux: mandate.taux_honoraires,
        revenu: b.revenu_net_proprietaire,
        nb: 1,
      })
    }
  }

  const items: RevenusItem[] = Array.from(byProperty.entries()).map(([propertyId, d]) => ({
    propertyId,
    propertyName: d.nom,
    taux: d.taux,
    revenusNet: Math.round(d.revenu * 100) / 100,
    honoraires: Math.round(d.revenu * d.taux * 100) / 100,
    nbSejours: d.nb,
  }))

  const totalHonoraires = items.reduce((s, i) => s + i.honoraires, 0)
  return { items, totalHonoraires }
}

export async function createFactureAction(_prev: unknown, formData: FormData) {
  const raw = {
    owner_id: formData.get("owner_id"),
    objet: formData.get("objet") || undefined,
    periode_debut: formData.get("periode_debut"),
    periode_fin: formData.get("periode_fin"),
    montant_ht: formData.get("montant_ht"),
    tva_rate: formData.get("tva_rate"),
    remise_pourcent: formData.get("remise_pourcent") || undefined,
    date_echeance: formData.get("date_echeance") || undefined,
    notes: formData.get("notes") || undefined,
    notes_client: formData.get("notes_client") || undefined,
    line_items_json: formData.get("line_items_json") || undefined,
  }

  const parsed = factureSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const {
    owner_id, objet, periode_debut, periode_fin,
    montant_ht, tva_rate, remise_pourcent,
    date_echeance, notes, notes_client, line_items_json,
  } = parsed.data

  // Parse line items
  let lineItems: any[] | undefined
  if (line_items_json) {
    try {
      const rawItems = JSON.parse(line_items_json)
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        lineItems = rawItems
          .map((item: any, i: number) => {
            const r = lineItemSchema.safeParse({ ...item, ordre: i })
            return r.success ? r.data : null
          })
          .filter(Boolean)
      }
    } catch { /* ignore */ }
  }

  const montant_ttc = computeMontantTTC(montant_ht, tva_rate)

  const dueDate = date_echeance
    ? new Date(date_echeance)
    : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d })()

  const invoice = await createFeeInvoice({
    owner_id,
    objet: objet || undefined,
    periode_debut: new Date(periode_debut),
    periode_fin: new Date(periode_fin),
    montant_ht,
    tva_rate,
    montant_ttc,
    remise_pourcent: remise_pourcent ?? undefined,
    date_echeance: dueDate,
    notes: notes || undefined,
    notes_client: notes_client || undefined,
    lineItems: lineItems as any,
  })

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
  redirect(`/facturation/${invoice.id}`)
}

export async function getNextInvoiceNumberAction() {
  return getNextInvoiceNumber()
}
