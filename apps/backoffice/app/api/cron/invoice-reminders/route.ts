import { NextRequest, NextResponse } from "next/server"
import { getOverdueInvoices, updateDerniereRelance } from "@/lib/dal/facturation"
import { sendFactureEmail } from "@conciergerie/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const invoices = await getOverdueInvoices()

  let sent = 0
  let errors = 0

  for (const invoice of invoices) {
    try {
      const now = new Date()
      const echeance = new Date(invoice.date_echeance!)
      const overdueDays = Math.floor((now.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24))

      const relanceLabel =
        overdueDays >= 30 ? "3e relance (J+30)" :
        overdueDays >= 14 ? "2e relance (J+14)" :
        "1ère relance (J+7)"

      await sendFactureEmail({
        to: invoice.owner.email,
        ownerName: invoice.owner.nom,
        numeroFacture: invoice.numero_facture,
        periode: `${new Date(invoice.periode_debut).toLocaleDateString("fr-FR")} — ${new Date(invoice.periode_fin).toLocaleDateString("fr-FR")}`,
        montantHT: invoice.montant_ht.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
        montantTTC: invoice.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
        portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })

      await updateDerniereRelance(invoice.id)

      sent++
      console.log(`[invoice-reminders] ${relanceLabel} envoyée pour ${invoice.numero_facture} → ${invoice.owner.email}`)
    } catch (err) {
      errors++
      console.error(`[invoice-reminders] Erreur facture ${invoice.id}:`, err)
    }
  }

  return NextResponse.json({ sent, errors, total: invoices.length })
}
