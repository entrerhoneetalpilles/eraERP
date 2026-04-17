import { db } from "@conciergerie/db"

export async function getUnreadNotificationsCount(userId: string) {
  return db.notification.count({ where: { user_id: userId, lu: false } })
}

export async function getNotifications(userId: string, limit = 50) {
  return db.notification.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function markNotificationRead(id: string) {
  return db.notification.update({ where: { id }, data: { lu: true } })
}

export async function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({ where: { user_id: userId, lu: false }, data: { lu: true } })
}
