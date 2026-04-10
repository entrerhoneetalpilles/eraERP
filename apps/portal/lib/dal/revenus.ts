import { db } from "@conciergerie/db"

export async function getOwnerReports(ownerId: string, year?: number) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
  })
  if (!account) return []

  const yearFilter = year
    ? {
        periode_debut: { gte: new Date(year, 0, 1) },
        periode_fin: { lte: new Date(year, 11, 31, 23, 59, 59) },
      }
    : {}

  return db.managementReport.findMany({
    where: { mandant_account_id: account.id, ...yearFilter },
    orderBy: { periode_debut: "desc" },
  })
}

export async function getOwnerReportById(ownerId: string, reportId: string) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
  })
  if (!account) return null

  const report = await db.managementReport.findFirst({
    where: { id: reportId, mandant_account_id: account.id },
  })
  if (!report) return null

  const bookings = await db.booking.findMany({
    where: {
      property: { mandate: { owner_id: ownerId } },
      statut: "CHECKEDOUT",
      check_in: { gte: report.periode_debut },
      check_out: { lte: new Date(report.periode_fin.getTime() + 24 * 60 * 60 * 1000) },
    },
    include: { property: { select: { nom: true } } },
    orderBy: { check_in: "asc" },
  })

  return { ...report, bookings }
}
