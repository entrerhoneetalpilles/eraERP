import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@conciergerie/db"
import { sendMandatRenewalEmail } from "@conciergerie/email"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!process.env.CRON_SECRET || !authHeader || !safeCompare(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const now = new Date()
  // Alert at J-90 and J-30 before expiry
  const thresholds = [90, 30]

  const mandates = await db.mandate.findMany({
    where: {
      statut: "ACTIF",
      date_fin: { not: null },
    },
    include: {
      owner: { select: { nom: true, email: true } },
    },
  })

  let sent = 0
  let skipped = 0
  let errors = 0
  const errorDetails: string[] = []

  for (const mandate of mandates) {
    if (!mandate.date_fin || !mandate.owner.email) { skipped++; continue }

    const msUntilExpiry = mandate.date_fin.getTime() - now.getTime()
    const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24))

    // Only send on threshold days (allow ±1 day tolerance for cron drift)
    const matchedThreshold = thresholds.find(t => Math.abs(daysUntilExpiry - t) <= 1)
    if (!matchedThreshold) { skipped++; continue }

    const backofficeUrl =
      `${process.env.BACKOFFICE_URL ?? "https://backoffice.entre-rhone-alpilles.fr"}/mandats`

    try {
      await sendMandatRenewalEmail({
        to: mandate.owner.email,
        ownerName: mandate.owner.nom,
        numeroMandat: mandate.numero_mandat,
        dateExpiration: mandate.date_fin.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        joursRestants: daysUntilExpiry,
        backofficeUrl,
      })

      sent++
    } catch (err) {
      errors++
      const msg = err instanceof Error ? err.message : String(err)
      errorDetails.push(`mandat=${mandate.numero_mandat}: ${msg}`)
      console.error(`[mandat-renewal] Erreur mandat ${mandate.numero_mandat}:`, err)
    }
  }

  try {
    await db.auditLog.create({
      data: {
        action: "CRON_MANDAT_RENEWAL",
        entity_type: "Mandate",
        entity_id: "cron",
      },
    })
  } catch (err) {
    console.error("[mandat-renewal] Audit log failed:", err)
  }

  return NextResponse.json({
    total: mandates.length,
    sent,
    skipped,
    errors,
    errorDetails,
  })
}
