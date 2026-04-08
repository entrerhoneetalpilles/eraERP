import { Resend } from "resend"

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Entre Rhône et Alpilles <contact@entre-rhone-alpilles.fr>"

interface EmailPayload {
  from: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  from?: string
}

export function buildEmailPayload(options: SendEmailOptions): EmailPayload {
  return {
    from: options.from ?? FROM_EMAIL,
    to: typeof options.to === "string" ? [options.to] : options.to,
    subject: options.subject,
    html: options.html,
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
  }
}

export async function sendEmail(options: SendEmailOptions) {
  const payload = buildEmailPayload(options)
  const { data, error } = await getResend().emails.send(payload)

  if (error) {
    console.error("[Email] Erreur envoi:", error)
    throw new Error(`Email send failed: ${error.message}`)
  }

  return data
}
