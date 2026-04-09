import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { simpleParser } from 'mailparser'
import { createThread } from '@/lib/dal/emails'
import { createDocument } from '@/lib/dal/documents'
import { uploadFile, buildStorageKey } from '@conciergerie/storage'
import { db } from '@conciergerie/db'

// ─── Signature Resend (svix) ────────────────────────────────────────────────
function verifyResendSignature(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string
): boolean {
  try {
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    const toSign = `${headers.id}.${headers.timestamp}.${payload}`
    const hmac = createHmac('sha256', secretBytes)
    hmac.update(toSign)
    const computed = hmac.digest('base64')
    return headers.signature.split(' ').some((sig) => {
      const [version, sigValue] = sig.split(',')
      if (version !== 'v1') return false
      try {
        return timingSafeEqual(Buffer.from(sigValue, 'base64'), Buffer.from(computed, 'base64'))
      } catch { return false }
    })
  } catch { return false }
}

// ─── Résolution du type de contact ─────────────────────────────────────────
async function resolveContactType(fromEmail: string): Promise<{
  contact_type: string
  owner_id?: string
  guest_id?: string
  contractor_id?: string
}> {
  const owner = await db.owner.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (owner) return { contact_type: 'proprietaire', owner_id: owner.id }

  const guest = await db.guest.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (guest) return { contact_type: 'voyageur', guest_id: guest.id }

  const contractor = await db.contractor.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (contractor) return { contact_type: 'prestataire', contractor_id: contractor.id }

  return { contact_type: 'autre' }
}

// ─── Normalisation du payload (Postmark ou Resend) ─────────────────────────
interface NormalizedEmail {
  from: string
  subject: string
  html: string
  text: string
  messageId: string
  attachments: Array<{ filename: string; content: string; contentType: string }>
}

async function parseRawMime(rawBase64: string, fallbackFrom: string): Promise<NormalizedEmail | null> {
  const buffer = Buffer.from(rawBase64, 'base64')
  const parsed = await simpleParser(buffer)

  const fromAddr = parsed.from?.value?.[0]
  const from = fromAddr
    ? (fromAddr.name ? `${fromAddr.name} <${fromAddr.address}>` : (fromAddr.address ?? fallbackFrom))
    : fallbackFrom

  const attachments = (parsed.attachments ?? [])
    .filter((a) => a.contentDisposition === 'attachment' || a.filename)
    .map((a) => ({
      filename: a.filename ?? 'fichier',
      content: a.content.toString('base64'),
      contentType: a.contentType ?? 'application/octet-stream',
    }))

  return {
    from,
    subject: parsed.subject ?? '',
    html: String(parsed.html || '').trim(),
    text: String(parsed.text || '').trim(),
    messageId: String(parsed.messageId || ''),
    attachments,
  }
}

function normalizePayload(payload: any): NormalizedEmail | null {
  // Format Cloudflare Worker (raw MIME base64)
  if (payload.raw) return null // handled separately (async)

  // Format Postmark-compatible (HtmlBody / TextBody)
  if (payload.HtmlBody !== undefined || payload.TextBody !== undefined) {
    return {
      from: payload.From ?? '',
      subject: payload.Subject ?? '',
      html: String(payload.HtmlBody ?? '').trim(),
      text: String(payload.TextBody ?? '').trim(),
      messageId: payload.MessageID ?? '',
      attachments: (payload.Attachments ?? []).map((a: any) => ({
        filename: a.Name ?? 'fichier',
        content: a.Content ?? '',
        contentType: a.ContentType ?? 'application/octet-stream',
      })),
    }
  }

  // Format Resend (type: email.received)
  const data = payload.data ?? payload
  if (!data.from && !data.From) return null

  return {
    from: data.from ?? '',
    subject: data.subject ?? '',
    html: String(data.html ?? data.html_body ?? '').trim(),
    text: String(data.text ?? data.plain_text ?? data.text_body ?? '').trim(),
    messageId: data.message_id ?? data.email_id ?? '',
    attachments: (data.attachments ?? [])
      .filter((a: any) => a.content || a.data)
      .map((a: any) => ({
        filename: a.filename ?? a.name ?? 'fichier',
        content: a.content ?? a.data ?? '',
        contentType: a.content_type ?? a.contentType ?? 'application/octet-stream',
      })),
  }
}

// ─── Handler principal ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const payload = JSON.parse(rawBody)

    // Vérification signature Resend (si configuré)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (webhookSecret && payload.type) {
      const svixId = req.headers.get('svix-id') ?? ''
      const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
      const svixSignature = req.headers.get('svix-signature') ?? ''
      if (!verifyResendSignature(rawBody, { id: svixId, timestamp: svixTimestamp, signature: svixSignature }, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Vérification token Postmark (si configuré)
    const postmarkToken = process.env.POSTMARK_WEBHOOK_TOKEN
    if (postmarkToken && payload.HtmlBody !== undefined) {
      const receivedToken = req.headers.get('x-postmark-token') ?? req.nextUrl.searchParams.get('token') ?? ''
      if (receivedToken !== postmarkToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    // Ignorer les événements Resend qui ne sont pas des emails reçus
    if (payload.type && payload.type !== 'email.received') {
      return NextResponse.json({ success: true })
    }

    // Format Cloudflare Worker : MIME brut encodé en base64
    let email: NormalizedEmail | null = null
    if (payload.raw) {
      email = await parseRawMime(payload.raw, payload.from ?? '')
    } else {
      email = normalizePayload(payload)
    }

    if (!email?.from) {
      console.error('[Webhook] Payload invalide ou champ from manquant')
      return NextResponse.json({ error: 'Missing from field' }, { status: 400 })
    }

    const { from, subject, html, text, messageId, attachments } = email
    console.log('[Webhook] from:', from, '| subject:', subject, '| html:', html.length, '| text:', text.length, '| pj:', attachments.length)

    const { contact_type, owner_id, guest_id, contractor_id } = await resolveContactType(from)

    const fromEmailMatch = from.match(/<(.+)>/)
    const fromEmail = fromEmailMatch ? fromEmailMatch[1] : from
    const fromName = fromEmailMatch ? from.replace(/<.+>/, '').trim().replace(/^"|"$/g, '') : from

    const contenu = html || text || '(aucun contenu)'

    const thread = await createThread({
      subject: subject || 'Sans objet',
      contact_type,
      folder: 'inbox',
      owner_id,
      guest_id,
      contractor_id,
      to_email: fromEmail,
      to_name: fromName || fromEmail,
      firstMessage: {
        contenu,
        author_id: fromEmail,
        author_type: 'OWNER',
      },
      resend_id: messageId,
    })

    // Sauvegarder les pièces jointes
    if (attachments.length > 0) {
      const msgId = (thread as any).messages?.[0]?.id
      for (const att of attachments) {
        try {
          const buffer = Buffer.from(att.content, 'base64')
          const safeName = att.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
          const key = buildStorageKey({
            entityType: 'message',
            entityId: msgId ?? 'unknown',
            folder: 'attachments',
            fileName: `${Date.now()}-${safeName}`,
          })
          const url = await uploadFile({ key, body: buffer, contentType: att.contentType })

          const doc = await createDocument({
            nom: att.filename,
            type: 'AUTRE',
            url_storage: url,
            mime_type: att.contentType,
            taille: buffer.byteLength,
            entity_type: 'message',
            entity_id: msgId ?? thread.id,
            uploaded_by: fromEmail,
            owner_id,
          })
          // Connecter le document à la relation Prisma Message.attachments
          if (msgId) {
            await db.message.update({
              where: { id: msgId },
              data: { attachments: { connect: { id: doc.id } } },
            })
          }
          console.log('[Webhook] PJ sauvegardée:', att.filename)
        } catch (e) {
          console.error('[Webhook] Erreur sauvegarde PJ:', att.filename, e)
        }
      }
    }

    console.log(`[Webhook] Thread créé : "${subject}" from ${fromEmail} (${contact_type})`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook Resend]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
