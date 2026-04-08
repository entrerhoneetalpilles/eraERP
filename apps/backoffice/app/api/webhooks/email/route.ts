import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'
import { createThread } from '@/lib/dal/emails'
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

    if (emailId && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { data: fullEmail, error } = await resend.emails.get(emailId)
        if (error) {
          console.error('[Webhook Resend] Erreur récupération email:', error)
        } else if (fullEmail) {
          from = (fullEmail as any).from ?? from
          subject = (fullEmail as any).subject ?? subject
          htmlContent = String((fullEmail as any).html ?? '').trim()
          textContent = String((fullEmail as any).text ?? '').trim()
          console.log('[Webhook Resend] Email récupéré via API | html:', htmlContent.length, 'chars | text:', textContent.length, 'chars')
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

    await createThread({
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

    console.log(`[Webhook] Thread créé : "${subject}" from ${fromEmail} (${contact_type})`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook Resend]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
