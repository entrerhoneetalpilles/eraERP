'use server'

import { auth } from '@/auth'
import { sendEmail } from '@conciergerie/email'
import {
  createThread,
  markThreadAsRead,
  moveThread,
  getThreads,
  deleteThread,
  addMessageToThread,
  getThreadById,
} from '@/lib/dal/emails'
import type { Mail, MailFolder, ContactType, MailMessage } from './mail-data'

function mapThread(t: any): Mail {
  return {
    id: t.id,
    from: {
      name: t.owner?.nom ?? t.to_name ?? 'Contact',
      email: t.owner?.email ?? '',
    },
    to: [{ name: t.to_name ?? 'Conciergerie', email: t.to_email ?? 'contact@entre-rhone-alpilles.fr' }],
    subject: t.subject,
    body: t.messages?.at(-1)?.contenu ?? '',
    preview: (t.messages?.at(-1)?.contenu ?? '').slice(0, 120),
    date: t.updatedAt.toISOString(),
    read: (t.messages ?? []).every((m: any) => m.lu_at !== null),
    folder: t.folder ?? 'inbox',
    contactType: t.contact_type ?? 'autre' as ContactType,
    labels: [],
    messages: (t.messages ?? []).map((m: any): MailMessage => ({
      id: m.id,
      contenu: m.contenu,
      author_type: m.author_type,
      createdAt: m.createdAt.toISOString(),
    })),
  }
}

export async function fetchThreadsAction(
  folder: MailFolder,
  contactType?: ContactType | 'all'
): Promise<Mail[]> {
  const threads = await getThreads(folder, contactType)
  return (threads as any[]).map(mapThread)
}

export async function fetchThreadAction(threadId: string): Promise<Mail | null> {
  const thread = await getThreadById(threadId)
  if (!thread) return null
  return mapThread(thread)
}

export async function sendMailAction(data: {
  to: string
  toName: string
  subject: string
  body: string
  contactType: ContactType
  ownerId?: string
  replyToThreadId?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Non autorisé')

  await sendEmail({
    to: data.to,
    subject: data.subject,
    html: `<div style="font-family:sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px">
      <div style="white-space:pre-wrap;font-size:14px">${data.body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="font-size:12px;color:#6b7280">
        Entre Rhône et Alpilles · Conciergerie haut de gamme
      </p>
    </div>`,
    replyTo: 'contact@entrerhonenalpilles.fr',
  })

  if (data.replyToThreadId) {
    await addMessageToThread(data.replyToThreadId, {
      contenu: data.body,
      author_id: session.user.id!,
      author_type: 'USER',
    })
  } else {
    await createThread({
      subject: data.subject,
      contact_type: data.contactType,
      folder: 'sent',
      owner_id: data.ownerId,
      to_email: data.to,
      to_name: data.toName,
      firstMessage: {
        contenu: data.body,
        author_id: session.user.id!,
      },
    })
  }
}

export async function markAsReadAction(threadId: string) {
  await markThreadAsRead(threadId)
}

export async function moveThreadAction(threadId: string, folder: MailFolder) {
  await moveThread(threadId, folder)
}

export async function deleteThreadAction(threadId: string) {
  await deleteThread(threadId)
}
