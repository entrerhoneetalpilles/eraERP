"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  updateInvoiceStatut,
  recordPayment,
  duplicateFeeInvoice,
  updateInvoiceNotes,
  getFeeInvoiceById,
} from "@/lib/dal/facturation"
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

export async function recordPaymentAction(
  id: string,
  data: { date_paiement: string; mode_paiement: string; reference_paiement?: string }
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await recordPayment(id, {
    date_paiement: new Date(data.date_paiement),
    mode_paiement: data.mode_paiement,
    reference_paiement: data.reference_paiement,
  })
  revalidatePath(`/facturation/${id}`)
  revalidatePath("/facturation")
  return { success: true }
}

export async function duplicateInvoiceAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const copy = await duplicateFeeInvoice(id)
  revalidatePath("/facturation")
  return { success: true, id: copy.id }
}

export async function updateInvoiceNotesAction(
  id: string,
  notes: { notes?: string; notes_client?: string }
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateInvoiceNotes(id, notes)
  revalidatePath(`/facturation/${id}`)
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

export async function sendReminderAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const invoice = await getFeeInvoiceById(id)
  if (!invoice) return { error: "Facture introuvable" }
  if (invoice.statut !== "EMISE") return { error: "Seules les factures émises peuvent être relancées" }
  const owner = await getOwnerById(invoice.owner_id)
  if (!owner?.email) return { error: "Email propriétaire manquant" }
  const overdueDays = invoice.date_echeance
    ? Math.ceil((new Date().getTime() - new Date(invoice.date_echeance).getTime()) / 86400000)
    : 0
  try {
    const result = await sendFactureEmail({
      to: owner.email,
      ownerName: owner.nom,
      numeroFacture: invoice.numero_facture,
      periode: `Relance — échéance ${invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString("fr-FR") : "dépassée"}`,
      montantHT: invoice.montant_ht.toFixed(2),
      montantTTC: invoice.montant_ttc.toFixed(2),
      portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/documents`,
    })
    await logEmail({
      to: owner.email,
      subject: `[Relance] Facture n° ${invoice.numero_facture}${overdueDays > 0 ? ` — ${overdueDays}j de retard` : ""}`,
      template: "facture",
      resend_id: (result as any)?.id,
      owner_id: owner.id,
    })
    return { success: true }
  } catch (e) {
    console.error("[Email] Erreur relance:", e)
    return { error: "Échec de l'envoi" }
  }
}

export async function exportInvoiceCsvAction() {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const { getFeeInvoices } = await import("@/lib/dal/facturation")
  const invoices = await getFeeInvoices()
  const rows = [
    ["N° Facture","Propriétaire","Email","Objet","Période début","Période fin","Échéance","HT","TVA","TTC","Statut","Date paiement","Mode règlement","Référence"],
    ...invoices.map((inv) => [
      inv.numero_facture, inv.owner.nom, inv.owner.email, inv.objet ?? "",
      new Date(inv.periode_debut).toLocaleDateString("fr-FR"),
      new Date(inv.periode_fin).toLocaleDateString("fr-FR"),
      inv.date_echeance ? new Date(inv.date_echeance).toLocaleDateString("fr-FR") : "",
      inv.montant_ht.toFixed(2), (inv.montant_ttc - inv.montant_ht).toFixed(2), inv.montant_ttc.toFixed(2),
      inv.statut,
      inv.date_paiement ? new Date(inv.date_paiement).toLocaleDateString("fr-FR") : "",
      inv.mode_paiement ?? "", inv.reference_paiement ?? "",
    ]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n")
  return { success: true, csv }
}
