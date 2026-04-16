import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { db } from "@conciergerie/db"
import { buildStorageKey, uploadFile } from "@conciergerie/storage"
import { createDocument } from "@/lib/dal/documents"
import { AttestationFiscalePDF } from "@/lib/pdf/attestation-template"
import { auth } from "@/auth"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(
  req: NextRequest,
  { params }: { params: { ownerId: string } }
) {
  // Allow both session auth (backoffice UI) and cron secret (automated)
  const session = await auth()
  const authHeader = req.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET
  const isCron = cronSecret && authHeader && safeCompare(authHeader, `Bearer ${cronSecret}`)

  if (!session?.user && !isCron) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { annee?: number }
  const annee = body.annee ?? new Date().getFullYear() - 1

  const owner = await db.owner.findUnique({
    where: { id: params.ownerId },
    select: { id: true, nom: true, email: true },
  })
  if (!owner) return new NextResponse("Propriétaire introuvable", { status: 404 })

  const periodeDebut = new Date(annee, 0, 1)
  const periodeFin = new Date(annee, 11, 31, 23, 59, 59)

  const reports = await db.managementReport.findMany({
    where: {
      account: { owner_id: owner.id },
      periode_debut: { gte: periodeDebut },
      periode_fin: { lte: periodeFin },
    },
    orderBy: { periode_debut: "asc" },
  })

  if (reports.length === 0) {
    return NextResponse.json({ error: "Aucun CRG trouvé pour cette année" }, { status: 404 })
  }

  const totalLoyers = reports.reduce((s, r) => s + r.revenus_sejours, 0)
  const totalHonoraires = reports.reduce((s, r) => s + r.honoraires_deduits, 0)
  const totalCharges = reports.reduce((s, r) => s + r.charges_deduites, 0)
  const totalVerse = reports.reduce((s, r) => s + r.montant_reverse, 0)

  const data = {
    owner: { nom: owner.nom, email: owner.email ?? "" },
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

  const doc = await createDocument({
    nom: `Attestation Fiscale ${annee} — ${owner.nom}.pdf`,
    type: "ATTESTATION_FISCALE",
    url_storage: url,
    mime_type: "application/pdf",
    taille: buffer.byteLength,
    entity_type: "owner",
    entity_id: owner.id,
    uploaded_by: session?.user?.email ?? "cron",
    owner_id: owner.id,
    mandate_id: mandate?.id,
  })

  await db.auditLog.create({
    data: {
      action: "ATTESTATION_FISCALE_GENERATED",
      entity_type: "Owner",
      entity_id: owner.id,
    },
  })

  return NextResponse.json({ success: true, document: doc, url })
}
