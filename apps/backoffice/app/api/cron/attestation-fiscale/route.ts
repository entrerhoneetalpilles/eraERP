import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { db } from "@conciergerie/db"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"
import { AttestationFiscalePDF } from "@/lib/pdf/attestation-template"
import { sendAttestationFiscaleEmail } from "@conciergerie/email"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!process.env.CRON_SECRET || !authHeader || !safeCompare(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const annee = new Date().getFullYear() - 1
  const periodeDebut = new Date(annee, 0, 1)
  const periodeFin = new Date(annee, 11, 31, 23, 59, 59)

  // Get all owners who have at least one ManagementReport in the target year
  const accounts = await db.mandantAccount.findMany({
    where: {
      reports: {
        some: {
          periode_debut: { gte: periodeDebut },
          periode_fin: { lte: periodeFin },
        },
      },
    },
    include: {
      owner: { select: { id: true, nom: true, email: true } },
    },
  })

  let success = 0
  let skipped = 0
  let errors = 0
  const errorDetails: string[] = []

  for (const account of accounts) {
    const owner = account.owner
    if (!owner.email) { skipped++; continue }

    try {
      // Skip if attestation already generated for this year
      const existing = await db.document.findFirst({
        where: {
          owner_id: owner.id,
          type: "ATTESTATION_FISCALE",
          nom: { contains: String(annee) },
        },
      })
      if (existing) { skipped++; continue }

      const reports = await db.managementReport.findMany({
        where: {
          mandant_account_id: account.id,
          periode_debut: { gte: periodeDebut },
          periode_fin: { lte: periodeFin },
        },
        orderBy: { periode_debut: "asc" },
      })

      if (reports.length === 0) { skipped++; continue }

      const totalLoyers = reports.reduce((s, r) => s + r.revenus_sejours, 0)
      const totalHonoraires = reports.reduce((s, r) => s + r.honoraires_deduits, 0)
      const totalCharges = reports.reduce((s, r) => s + r.charges_deduites, 0)
      const totalVerse = reports.reduce((s, r) => s + r.montant_reverse, 0)

      const data = {
        owner: { nom: owner.nom, email: owner.email },
        annee,
        reports: reports.map(r => ({
          periode_debut: r.periode_debut,
          periode_fin: r.periode_fin,
          revenus_sejours: r.revenus_sejours,
          honoraires_deduits: r.honoraires_deduits,
          charges_deduites: r.charges_deduites,
          montant_reverse: r.montant_reverse,
        })),
        totalLoyers,
        totalHonoraires,
        totalCharges,
        totalVerse,
        generatedAt: new Date(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = createElement(AttestationFiscalePDF, { data }) as any
      const buffer = await renderToBuffer(element)

      const safeName = owner.nom.replace(/\s+/g, "-")
      const filename = `Attestation-Fiscale-${annee}-${safeName}-${Date.now()}.pdf`
      const key = buildStorageKey({
        entityType: "owner",
        entityId: owner.id,
        folder: "attestation_fiscale",
        fileName: filename,
      })

      const url = await uploadFile({ key, body: buffer, contentType: "application/pdf" })

      const mandate = await db.mandate.findFirst({
        where: { owner_id: owner.id },
        select: { id: true },
      })

      await createDocument({
        nom: `Attestation Fiscale ${annee} — ${owner.nom}.pdf`,
        type: "ATTESTATION_FISCALE",
        url_storage: url,
        mime_type: "application/pdf",
        taille: buffer.byteLength,
        entity_type: "owner",
        entity_id: owner.id,
        uploaded_by: "cron",
        owner_id: owner.id,
        mandate_id: mandate?.id,
      })

      await sendAttestationFiscaleEmail({
        to: owner.email,
        ownerName: owner.nom,
        annee,
        totalLoyers,
        totalHonoraires,
        totalCharges,
        totalVerse,
        portalUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })

      success++
    } catch (err) {
      errors++
      const msg = err instanceof Error ? err.message : String(err)
      errorDetails.push(`owner_id=${owner.id}: ${msg}`)
      console.error(`[attestation-fiscale] Erreur owner ${owner.id}:`, err)
    }
  }

  try {
    await db.auditLog.create({
      data: {
        action: "CRON_ATTESTATION_FISCALE",
        entity_type: "Owner",
        entity_id: "cron",
      },
    })
  } catch (err) {
    console.error("[attestation-fiscale] Audit log failed:", err)
  }

  return NextResponse.json({ annee, total: accounts.length, success, skipped, errors, errorDetails })
}
