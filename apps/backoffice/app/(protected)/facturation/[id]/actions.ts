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
import { db } from "@conciergerie/db"
import { getOwnerById } from "@/lib/dal/owners"
import { sendFactureEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"
import { renderInvoicePdf } from "@/lib/pdf/render-with-template"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"

async function saveInvoicePdfToDocuments(id: string) {
  try {
    const invoice = await getFeeInvoiceById(id)
    if (!invoice) return
    const buffer = await renderInvoicePdf(invoice)
    const filename = `Facture-${invoice.numero_facture}-${Date.now()}.pdf`
    const key = buildStorageKey({
      entityType: "fee_invoice",
      entityId: invoice.id,
      folder: "facture",
      fileName: filename,
    })
    const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })
    await createDocument({
      nom: `Facture ${invoice.numero_facture}.pdf`,
      type: "FACTURE",
      url_storage: url,
      mime_type: "application/pdf",
      taille: buffer.byteLength,
      entity_type: "fee_invoice",
      entity_id: invoice.id,
      uploaded_by: "system",
      owner_id: invoice.owner_id,
    })
  } catch (e) {
    console.error("[saveInvoicePdf] error:", e)
  }
}

export async function updateInvoiceStatutAction(
  id: string,
  statut: "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"
) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await updateInvoiceStatut(id, statut)
  if (statut === "EMISE") {
    await saveInvoicePdfToDocuments(id)
  }
  revalidatePath(`/facturation/${id}`)
  revalidatePath("/facturation")
  revalidatePath("/documents")
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

export async function createTimeEntryAction(invoiceId: string, data: {
  date: string; description: string; nb_heures: number; taux_horaire: number
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const invoice = await getFeeInvoiceById(invoiceId)
  if (!invoice) return { error: "Facture introuvable" }
  const montant_ht = data.nb_heures * data.taux_horaire
  await db.timeEntry.create({
    data: {
      owner_id: invoice.owner_id,
      fee_invoice_id: invoiceId,
      date: new Date(data.date),
      description: data.description,
      nb_heures: data.nb_heures,
      taux_horaire: data.taux_horaire,
      montant_ht,
      created_by: session.user.id ?? "system",
    },
  })
  revalidatePath(`/facturation/${invoiceId}`)
  return { success: true }
}

export async function deleteTimeEntryAction(entryId: string, invoiceId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.timeEntry.delete({ where: { id: entryId } })
  revalidatePath(`/facturation/${invoiceId}`)
  return { success: true }
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

export async function exportFecAction() {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const { getFeeInvoices } = await import("@/lib/dal/facturation")
  const invoices = await getFeeInvoices()
  const fmtFec = (d: Date | string) => {
    const dt = new Date(d)
    return `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}`
  }
  const rows: string[][] = []
  let ecritureNum = 1
  for (const inv of invoices) {
    if (inv.statut === "BROUILLON") continue
    const dateEmission = inv.createdAt
    const ref = inv.numero_facture
    const tvaAmount = inv.montant_ttc - inv.montant_ht
    // Débit client 411
    rows.push(["VT", "Ventes", String(ecritureNum), fmtFec(dateEmission), "411000", `Client ${inv.owner.nom}`, "", "", ref, fmtFec(dateEmission), inv.objet ?? "Honoraires gestion", inv.montant_ttc.toFixed(2), "0.00", "", "", fmtFec(dateEmission), "", "EUR"])
    // Crédit produits 706
    rows.push(["VT", "Ventes", String(ecritureNum), fmtFec(dateEmission), "706000", "Honoraires de gestion", "", "", ref, fmtFec(dateEmission), inv.objet ?? "Honoraires gestion", "0.00", inv.montant_ht.toFixed(2), "", "", fmtFec(dateEmission), "", "EUR"])
    // TVA collectée 44571
    if (tvaAmount > 0) {
      rows.push(["VT", "Ventes", String(ecritureNum), fmtFec(dateEmission), "44571", "TVA collectée", "", "", ref, fmtFec(dateEmission), inv.objet ?? "Honoraires gestion", "0.00", tvaAmount.toFixed(2), "", "", fmtFec(dateEmission), "", "EUR"])
    }
    ecritureNum++
    if (inv.date_paiement) {
      rows.push(["BQ", "Banque", String(ecritureNum), fmtFec(inv.date_paiement), "512000", "Banque", "", "", inv.reference_paiement ?? ref, fmtFec(inv.date_paiement), `Règlement ${ref}`, inv.montant_ttc.toFixed(2), "0.00", "", "", fmtFec(inv.date_paiement), "", "EUR"])
      rows.push(["BQ", "Banque", String(ecritureNum), fmtFec(inv.date_paiement), "411000", `Client ${inv.owner.nom}`, "", "", inv.reference_paiement ?? ref, fmtFec(inv.date_paiement), `Règlement ${ref}`, "0.00", inv.montant_ttc.toFixed(2), "", "", fmtFec(inv.date_paiement), "", "EUR"])
      ecritureNum++
    }
  }
  const header = ["JournalCode","JournalLib","EcritureNum","EcritureDate","CompteNum","CompteLib","CompAuxNum","CompAuxLib","PieceRef","PieceDate","EcritureLib","Debit","Credit","EcritureLet","DateLet","ValidDate","Montantdevise","Idevise"]
  const fec = [header, ...rows].map(r => r.join("\t")).join("\r\n")
  return { success: true, fec }
}
