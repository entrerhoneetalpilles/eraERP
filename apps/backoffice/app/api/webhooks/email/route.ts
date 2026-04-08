import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createThread } from '@/lib/dal/emails'
import { db } from '@conciergerie/db'

function verifyResendSignature(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string
): boolean {
  try {
    // Resend utilise Svix — secret base64 préfixé "whsec_"
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    // Contenu signé : "{svix-id}.{svix-timestamp}.{raw-body}"
    const toSign = `${headers.id}.${headers.timestamp}.${payload}`
    const hmac = createHmac('sha256', secretBytes)
    hmac.update(toSign)
    const computed = hmac.digest('base64')
    // svix-signature peut contenir plusieurs sigs : "v1,<base64> v1,<base64>"
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

    // Resend inbound emails are wrapped in payload.data
    // Format: { type: "email.received", data: { from, to, subject, html, text, message_id } }
    const emailData = payload.data ?? payload
    const { from, subject, text, html, to } = emailData
    const id = emailData.message_id ?? emailData.id ?? payload.id

    console.log('[Webhook Resend] type:', payload.type, '| from:', from, '| subject:', subject)

    if (!from) {
      console.error('[Webhook Resend] Payload invalide, champ "from" manquant:', JSON.stringify(payload).slice(0, 500))
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { contact_type, owner_id, guest_id, contractor_id } = await resolveContactType(from)

    // Extraire nom + email de l'expéditeur (ex: "Jean Martin <jean@mail.com>")
    const fromEmailMatch = from.match(/<(.+)>/)
    const fromEmail = fromEmailMatch ? fromEmailMatch[1] : from
    const fromName = fromEmailMatch ? from.replace(/<.+>/, '').trim() : from

    // Convention inbox : to_email/to_name = expéditeur (pas le destinataire)
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
        contenu: html || text || 'Message sans contenu',
        author_id: fromEmail,
        author_type: 'OWNER',
      },
      resend_id: id,
    })

    console.log(`[Webhook] Thread créé : ${subject || 'sans sujet'} from ${from} (${contact_type})`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook Resend]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
