import { db } from "@conciergerie/db"

export async function getOwnerThreads(ownerId: string) {
  return db.messageThread.findMany({
    where: { owner_id: ownerId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { author_type: "USER", lu_at: null },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getOwnerThread(ownerId: string, threadId: string) {
  const thread = await db.messageThread.findFirst({
    where: { id: threadId, owner_id: ownerId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          attachments: {
            select: { id: true, nom: true, mime_type: true },
          },
        },
      },
    },
  })
  if (!thread) return null

  await db.message.updateMany({
    where: {
      thread_id: threadId,
      author_type: "USER",
      lu_at: null,
    },
    data: { lu_at: new Date() },
  })
  return thread
}

export async function sendOwnerMessage(
  ownerId: string,
  threadId: string,
  contenu: string
) {
  const thread = await db.messageThread.findFirst({
    where: { id: threadId, owner_id: ownerId },
  })
  if (!thread) throw new Error("Thread introuvable")

  const message = await db.message.create({
    data: {
      thread_id: threadId,
      author_type: "OWNER",
      author_id: ownerId,
      contenu,
    },
  })

  await db.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  return message
}

export async function getOwnerUnreadCount(ownerId: string): Promise<number> {
  return db.message.count({
    where: {
      thread: { owner_id: ownerId },
      author_type: "USER",
      lu_at: null,
    },
  })
}

export async function createOwnerThread(
  ownerId: string,
  subject: string,
  contenu: string
) {
  return db.$transaction(async (tx) => {
    const thread = await tx.messageThread.create({
      data: {
        owner_id: ownerId,
        subject,
        to_name: "Équipe ERA",
        contact_type: "autre",
        folder: "inbox",
      },
    })
    await tx.message.create({
      data: {
        thread_id: thread.id,
        author_type: "OWNER",
        author_id: ownerId,
        contenu,
      },
    })
    return thread
  })
}
