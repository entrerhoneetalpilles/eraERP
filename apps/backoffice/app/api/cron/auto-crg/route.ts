import { NextRequest, NextResponse } from "next/server"
import { generateCrg, getMandatesWithActiveBookings } from "@/lib/dal/crg"
import { sendCrgMensuelEmail } from "@conciergerie/email"
import { db } from "@conciergerie/db"
import { saveCrgPdfToDocuments } from "@/lib/pdf/auto-save"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const now = new Date()
  const periodeDebut = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const periodeFin = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const mandates = await getMandatesWithActiveBookings(periodeDebut, periodeFin)

  let success = 0
  let skipped = 0
  let errors = 0
  const errorDetails: string[] = []

  for (const { owner_id } of mandates) {
    try {
      const report = await generateCrg({ owner_id, periode_debut: periodeDebut, periode_fin: periodeFin })

      // Auto-save PDF to S3 + Document record
      try {
        await saveCrgPdfToDocuments(report.id)
      } catch (e) {
        console.error(`[PDF] Erreur sauvegarde CRG PDF owner=${owner_id}:`, e)
      }

      const owner = await db.owner.findUnique({
        where: { id: owner_id },
        select: { nom: true, email: true },
      })
      if (owner?.email) {
        const mois = periodeDebut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        await sendCrgMensuelEmail({
          to: owner.email,
          ownerName: owner.nom,
          periode: mois,
          revenusBruts: report.revenus_sejours.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          fraisGestion: report.honoraires_deduits.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          autresCharges: report.charges_deduites.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          revenuNet: report.montant_reverse.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
          portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
        })
      }

      await db.auditLog.create({
        data: {
          action: "CRG_AUTO_GENERATED",
          entity_type: "ManagementReport",
          entity_id: report.id,
        },
      })

      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("existe déjà")) {
        skipped++
      } else {
        errors++
        errorDetails.push(`owner_id=${owner_id}: ${msg}`)
      }
    }
  }

  return NextResponse.json({ success, skipped, errors, errorDetails })
}
