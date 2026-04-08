import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'
import { createThread } from '@/lib/dal/emails'
import { createDocument } from '@/lib/dal/documents'
import { uploadFile, buildStorageKey } from '@conciergerie/storage'
import { db } from '@conciergerie/db'

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

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (webhookSecret) {
      const svixId = req.headers.get('svix-id') ?? ''
      const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
      const svixSignature = req.headers.get('svix-signature') ?? ''
      if (!verifyResendSignature(rawBody, { id: svixId, timestamp: svixTimestamp, signature: svixSignature }, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)

    if (payload.type && payload.type !== 'email.received') {
      return NextResponse.json({ success: true })
    }

    const webhookData = payload.data ?? payload

    // Le payload webhook Resend ne contient pas html/text — il faut les récupérer
    // via l'API Resend en utilisant l'email_id
    const emailId: string = webhookData.email_id ?? webhookData.id

    let from: string = webhookData.from ?? ''
    let subject: string = webhookData.subject ?? ''
    let htmlContent = ''
    let textContent = ''
    let resendEmailData: any = null

    if (emailId && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { data: fullEmail, error } = await resend.emails.get(emailId)
        if (error) {
          console.error('[Webhook Resend] Erreur récupération email:', error)
        } else if (fullEmail) {
          resendEmailData = fullEmail
          from = (fullEmail as any).from ?? from
          subject = (fullEmail as any).subject ?? subject
          htmlContent = String((fullEmail as any).html ?? '').trim()
          textContent = String((fullEmail as any).text ?? '').trim()
          console.log('[Webhook Resend] Email récupéré | html:', htmlContent.length, 'chars | text:', textContent.length, 'chars | PJ:', ((fullEmail as any).attachments ?? []).length)
        }
      } catch (e) {
        console.error('[Webhook Resend] Impossible de récupérer le contenu via API:', e)
      }
    }

    // Fallback sur les champs du payload si l'API n'a rien donné
    if (!htmlContent && !textContent) {
      htmlContent = String(webhookData.html ?? webhookData.html_body ?? '').trim()
      textContent = String(webhookData.text ?? webhookData.plain_text ?? webhookData.text_body ?? '').trim()
    }

    console.log('[Webhook Resend] from:', from, '| subject:', subject,
      '| html:', htmlContent.length, 'chars | text:', textContent.length, 'chars')

    if (!from) {
      console.error('[Webhook Resend] Payload invalide:', JSON.stringify(payload).slice(0, 300))
      return NextResponse.json({ error: 'Missing from field' }, { status: 400 })
    }

    const { contact_type, owner_id, guest_id, contractor_id } = await resolveContactType(from)

    const fromEmailMatch = from.match(/<(.+)>/)
    const fromEmail = fromEmailMatch ? fromEmailMatch[1] : from
    const fromName = fromEmailMatch ? from.replace(/<.+>/, '').trim().replace(/^"|"$/g, '') : from

    const contenu = htmlContent || textContent || '(aucun contenu)'
    const messageId = webhookData.message_id ?? emailId

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

    // Sauvegarder les pièces jointes en storage + Document
    const resendAttachments: any[] = resendEmailData?.attachments ?? []
    if (resendAttachments.length > 0) {
      const msgId = (thread as any).messages?.[0]?.id
      for (const att of resendAttachments) {
        try {
          const filename = att.filename ?? att.name ?? 'fichier'
          const contentType = att.content_type ?? att.contentType ?? 'application/octet-stream'
          const rawContent = att.content ?? att.data ?? ''
          if (!rawContent) continue

          const buffer = Buffer.from(rawContent, 'base64')
          const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
          const key = buildStorageKey({
            entityType: 'message',
            entityId: msgId ?? 'unknown',
            folder: 'attachments',
            fileName: `${Date.now()}-${safeName}`,
          })
          const url = await uploadFile({ key, body: buffer, contentType })

          await createDocument({
            nom: filename,
            type: 'AUTRE',
            url_storage: url,
            mime_type: contentType,
            taille: buffer.byteLength,
            entity_type: 'message',
            entity_id: msgId ?? thread.id,
            uploaded_by: fromEmail,
            owner_id,
          })
          console.log('[Webhook] PJ sauvegardée:', filename)
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
