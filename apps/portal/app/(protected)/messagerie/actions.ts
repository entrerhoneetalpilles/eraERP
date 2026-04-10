"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { sendOwnerMessage } from "@/lib/dal/messagerie"
import { sendNouveauMessageEmail } from "@conciergerie/email"

export async function sendOwnerMessageAction(threadId: string, contenu: string) {
  const session = await auth()
  if (!session?.user?.ownerId) return { error: "Non autorisé" }

  if (!contenu.trim()) return { error: "Message vide" }

  try {
    await sendOwnerMessage(session.user.ownerId, threadId, contenu)
  } catch {
    return { error: "Thread introuvable" }
  }

  const gestEmail = process.env.GESTIONNAIRE_EMAIL ?? process.env.EMAIL_FROM
  if (gestEmail) {
    try {
      await sendNouveauMessageEmail({
        to: gestEmail,
        recipientName: "l'équipe ERA",
        senderName: session.user.name ?? "Un propriétaire",
        preview: contenu.slice(0, 120),
        mailboxUrl: `${process.env.NEXTAUTH_URL?.replace("portal", "backoffice") ?? ""}/messagerie/${threadId}`,
      })
    } catch (e) {
      console.error("[sendOwnerMessage] email failed:", e)
    }
  } else {
    console.warn("[sendOwnerMessage] no gestionnaire email configured")
  }

  revalidatePath(`/messagerie/${threadId}`)
  revalidatePath("/messagerie")
  return { success: true }
}
