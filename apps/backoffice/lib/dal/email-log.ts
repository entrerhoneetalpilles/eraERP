import { db } from "@conciergerie/db"

export async function logEmail(data: {
  to: string
  subject: string
  template: string
  resend_id?: string | null
  status?: string
  error?: string
  owner_id?: string
  booking_id?: string
}) {
  return db.emailLog.create({ data: { ...data, status: data.status ?? "sent" } })
}

export async function getEmailLogs(filters?: { owner_id?: string; booking_id?: string }) {
  return db.emailLog.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}
