"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/dal/notifications"

export async function markReadAction(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await markNotificationRead(id)
  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllReadAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non autorisé" }
  await markAllNotificationsRead(session.user.id)
  revalidatePath("/notifications")
  return { success: true }
}
