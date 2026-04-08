import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getEmailById } from '@conciergerie/email'
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

    // LOG COMPLET pour diagnostiquer la structure Resend
    console.log('[Webhook] payload.type:', payload.type)
    console.log('[Webhook] payload keys:', Object.keys(payload).join(', '))
    if (payload.data) console.log('[Webhook] payload.data keys:', Object.keys(payload.data).join(', '))
    console.log('[Webhook] rawBody (500 chars):', rawBody.slice(0, 500))

    if (payload.type && payload.type !== 'email.received') {
      return NextResponse.json({ success: true })
    }

    const webhookData = payload.data ?? payload
    const emailId: string = webhookData.email_id ?? webhookData.id

    let from: string = webhookData.from ?? ''
    let subject: string = webhookData.subject ?? ''
    let htmlContent = ''
    let textContent = ''
    let resendEmailData: any = null

    // Le payload webhook ne contient pas html/text — les récupérer via l'API Resend
    if (emailId && process.env.RESEND_API_KEY) {
      try {
        // Essai 1 : SDK Resend
        const fullEmail = await getEmailById(emailId)
        console.log('[Webhook] getEmailById result keys:', fullEmail ? Object.keys(fullEmail).join(', ') : 'null')
        if (fullEmail) {
          resendEmailData = fullEmail
          from = (fullEmail as any).from ?? from
          subject = (fullEmail as any).subject ?? subject
          htmlContent = String((fullEmail as any).html ?? '').trim()
          textContent = String((fullEmail as any).text ?? '').trim()
          console.log('[Webhook] SDK | html:', htmlContent.length, 'chars | text:', textContent.length, 'chars')
        }
      } catch (e) {
        console.error('[Webhook] SDK getEmailById a échoué:', String(e))
      }

      // Essai 2 : fetch direct si SDK n'a pas retourné de contenu
      if (!htmlContent && !textContent) {
        try {
          const res = await fetch(`https://api.resend.com/emails/${emailId}`, {
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
          })
          const json = await res.json()
          console.log('[Webhook] fetch direct status:', res.status, '| keys:', Object.keys(json).join(', '))
          if (json.html || json.text) {
            resendEmailData = json
            from = json.from ?? from
            subject = json.subject ?? subject
            htmlContent = String(json.html ?? '').trim()
            textContent = String(json.text ?? '').trim()
            console.log('[Webhook] fetch direct | html:', htmlContent.length, 'chars | text:', textContent.length, 'chars')
          } else {
            console.log('[Webhook] fetch direct réponse complète:', JSON.stringify(json).slice(0, 500))
          }
        } catch (e) {
          console.error('[Webhook] fetch direct a échoué:', String(e))
        }
      }
    }

    // Fallback sur les champs du payload si l'API n'a rien donné
    if (!htmlContent && !textContent) {
      htmlContent = String(webhookData.html ?? webhookData.html_body ?? '').trim()
      textContent = String(webhookData.text ?? webhookData.plain_text ?? webhookData.text_body ?? '').trim()
    }

    console.log('[Webhook] from:', from, '| subject:', subject)

    if (!from) {
      console.error('[Webhook] Payload invalide:', JSON.stringify(payload).slice(0, 300))
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
