import { db } from '@conciergerie/db'
import type { MailFolder, ContactType } from '@/app/(protected)/mails/mail-data'

export async function getThreads(folder: MailFolder = 'inbox', contactType?: ContactType | 'all') {
    return db.messageThread.findMany({
        where: {
            folder,
            ...(contactType && contactType !== 'all' ? { contact_type: contactType } : {}),
        } as any,
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { attachments: true },
            },
            owner: { select: { id: true, nom: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
    })
}

export async function markThreadAsRead(threadId: string) {
    return db.message.updateMany({
        where: { thread_id: threadId, lu_at: null },
        data: { lu_at: new Date() },
    })
}

export async function moveThread(threadId: string, folder: MailFolder) {
    return db.messageThread.update({
        where: { id: threadId },
        data: { folder } as any,
    })
}

export async function deleteThread(threadId: string) {
    await db.message.deleteMany({ where: { thread_id: threadId } })
    return db.messageThread.delete({ where: { id: threadId } })
}

export async function createThread(data: {
    subject: string
    contact_type: string
    folder: string
    owner_id?: string
    guest_id?: string
    contractor_id?: string
    property_id?: string
    to_email?: string
    to_name?: string
    resend_id?: string
    firstMessage: { contenu: string; author_id: string }
}) {
    const { firstMessage, owner_id, property_id, ...rest } = data
    return db.messageThread.create({
        data: {
            ...rest,
            ...(owner_id ? { owner: { connect: { id: owner_id } } } : {}),
            ...(property_id ? { property: { connect: { id: property_id } } } : {}),
            messages: {
                create: {
                    author_type: 'USER',
                    author_id: firstMessage.author_id,
                    contenu: firstMessage.contenu,
                },
            },
        } as any,
        include: { messages: true },
    })
}

export async function addMessageToThread(threadId: string, data: {
  contenu: string
  author_id: string
  author_type: "USER" | "OWNER"
}) {
  const [message] = await Promise.all([
    db.message.create({
      data: {
        thread_id: threadId,
        author_type: data.author_type,
        author_id: data.author_id,
        contenu: data.contenu,
      },
    }),
    db.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    }),
  ])
  return message
}

export async function getThreadById(threadId: string) {
  return db.messageThread.findUnique({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      owner: { select: { id: true, nom: true, email: true } },
    },
  })
}