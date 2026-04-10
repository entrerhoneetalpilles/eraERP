import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getExpiringDocuments } from "@/lib/dal/documents"
import { sendNouveauMessageEmail } from "@conciergerie/email"
import { db } from "@conciergerie/db"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!process.env.CRON_SECRET || !authHeader || !safeCompare(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const docs = await getExpiringDocuments(30)

  // Group by owner email
  const byOwner = new Map<string, { email: string; nom: string; docs: Array<(typeof docs)[number]> }>()
  for (const doc of docs) {
    if (!doc.owner?.email) continue
    const key = doc.owner.email
    if (!byOwner.has(key)) {
      byOwner.set(key, { email: doc.owner.email, nom: doc.owner.nom, docs: [] })
    }
    byOwner.get(key)!.docs.push(doc)
  }

  // Group by contractor email
  const byContractor = new Map<string, { email: string; nom: string; docs: Array<(typeof docs)[number]> }>()
  for (const doc of docs) {
    if (!doc.contractor?.email) continue
    const key = doc.contractor.email
    if (!byContractor.has(key)) {
      byContractor.set(key, { email: doc.contractor.email, nom: doc.contractor.nom, docs: [] })
    }
    byContractor.get(key)!.docs.push(doc)
  }

  let sent = 0
  let errors = 0

  for (const { email, nom, docs: ownerDocs } of byOwner.values()) {
    try {
      const docList = ownerDocs
        .map(d => {
          const exp = d.date_expiration
            ? new Date(d.date_expiration).toLocaleDateString("fr-FR")
            : "?"
          return `${d.nom} (${d.type}) — expire le ${exp}`
        })
        .join(", ")

      await sendNouveauMessageEmail({
        to: email,
        recipientName: nom ?? email,
        senderName: "Entre Rhône et Alpilles",
        preview: `${ownerDocs.length} document${ownerDocs.length > 1 ? "s" : ""} arrivent à expiration : ${docList}`.slice(0, 200),
        mailboxUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })

      sent++
    } catch (err) {
      errors++
      console.error(`[document-expiry] Erreur email ${email}:`, err)
    }
  }

  for (const { email, nom, docs: contractorDocs } of byContractor.values()) {
    try {
      const docList = contractorDocs
        .map(d => {
          const exp = d.date_expiration
            ? new Date(d.date_expiration).toLocaleDateString("fr-FR")
            : "?"
          return `${d.nom} (${d.type}) — expire le ${exp}`
        })
        .join(", ")

      await sendNouveauMessageEmail({
        to: email,
        recipientName: nom ?? email,
        senderName: "Entre Rhône et Alpilles",
        preview: `${contractorDocs.length} document${contractorDocs.length > 1 ? "s" : ""} arrivent à expiration : ${docList}`.slice(0, 200),
        mailboxUrl: process.env.PORTAL_URL ?? "https://portail.entre-rhone-alpilles.fr",
      })

      sent++
    } catch (err) {
      errors++
      console.error(`[document-expiry] Erreur email ${email}:`, err)
    }
  }

  try {
    await db.auditLog.create({
      data: {
        action: "CRON_DOCUMENT_EXPIRY",
        entity_type: "Document",
        entity_id: "cron",
      },
    })
  } catch (err) {
    console.error("[document-expiry] Audit log failed:", err)
  }

  return NextResponse.json({ docs: docs.length, owners: byOwner.size, contractors: byContractor.size, sent, errors })
}
