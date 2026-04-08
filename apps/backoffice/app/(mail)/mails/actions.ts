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
  const isInbox = t.folder === 'inbox' || !t.folder

  // Convention :
  //   inbox  → to_name/to_email = expéditeur (qui a écrit), from = conciergerie
  //   sent   → to_name/to_email = destinataire, from = conciergerie
  const fromName = isInbox
    ? (t.to_name ?? t.owner?.nom ?? 'Contact')
    : 'Entre Rhône et Alpilles'
  const fromEmail = isInbox
    ? (t.to_email ?? t.owner?.email ?? '')
    : 'contact@entre-rhone-alpilles.fr'

  const toName = isInbox ? 'Entre Rhône et Alpilles' : (t.to_name ?? t.owner?.nom ?? 'Contact')
  const toEmail = isInbox ? 'contact@entre-rhone-alpilles.fr' : (t.to_email ?? t.owner?.email ?? '')

  // Unread: messages OWNER non lus (inbox) ou tous non lus (sent)
  const unreadMessages = isInbox
    ? (t.messages ?? []).filter((m: any) => m.author_type === 'OWNER' && m.lu_at === null)
    : (t.messages ?? []).filter((m: any) => m.lu_at === null)

  return {
    id: t.id,
    from: { name: fromName, email: fromEmail },
    to: [{ name: toName, email: toEmail }],
    subject: t.subject,
    body: t.messages?.at(-1)?.contenu ?? '',
    preview: (t.messages?.at(-1)?.contenu ?? '').slice(0, 120),
    date: t.updatedAt.toISOString(),
    read: unreadMessages.length === 0,
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

  const userEmail = session.user.email!
  const userName = session.user.name ?? 'Entre Rhône et Alpilles'
  const fromHeader = `${userName} - Entre Rhône et Alpilles <${userEmail}>`

  await sendEmail({
    to: data.to,
    subject: data.subject,
    from: fromHeader,
    html: `<div style="font-family:sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px">
      <div style="white-space:pre-wrap;font-size:14px">${data.body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="font-size:12px;color:#6b7280">
        Entre Rhône et Alpilles · Conciergerie haut de gamme
      </p>
    </div>`,
    replyTo: userEmail,
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

export async function bulkMoveAction(ids: string[], folder: MailFolder) {
  await Promise.all(ids.map((id) => moveThread(id, folder)))
}

export async function bulkDeleteAction(ids: string[]) {
  await Promise.all(ids.map((id) => deleteThread(id)))
}

export async function bulkMarkReadAction(ids: string[], read: boolean) {
  if (read) {
    await Promise.all(ids.map((id) => markThreadAsRead(id)))
  } else {
    // Marquer comme non lu = reset lu_at sur tous les messages
    const { db } = await import('@conciergerie/db')
    await Promise.all(
      ids.map((id) =>
        db.message.updateMany({
          where: { thread_id: id },
          data: { lu_at: null },
        })
      )
    )
  }
}
