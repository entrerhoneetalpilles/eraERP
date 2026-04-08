import { NextRequest, NextResponse } from 'next/server'
import { createThread } from '@/lib/dal/emails'

/**
 * Endpoint de test pour simuler la réception d'un email entrant.
 * Usage: POST /api/debug/test-inbound-email
 * Body: { from, fromName, subject, body }
 *
 * UNIQUEMENT en développement — désactivé en production.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  const { from, fromName, subject, body } = await req.json()

  await createThread({
    subject: subject ?? 'Test email entrant',
    contact_type: 'autre',
    folder: 'inbox',
    to_email: from ?? 'test@exemple.fr',
    to_name: fromName ?? (from ?? 'Contact Test'),
    firstMessage: {
      contenu: body ?? 'Ceci est un message de test généré manuellement.',
      author_id: from ?? 'test@exemple.fr',
      author_type: 'OWNER',
    },
  })

  return NextResponse.json({ success: true, message: 'Thread créé dans inbox' })
}
