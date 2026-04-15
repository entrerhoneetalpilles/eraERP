import { db } from "@conciergerie/db"

export async function getOwnerReportForPdf(ownerId: string, reportId: string) {
  const account = await db.mandantAccount.findUnique({
    where: { owner_id: ownerId },
    select: {
      id: true,
      solde_courant: true,
      owner: {
        select: { id: true, nom: true, email: true, type: true },
      },
    },
  })
  if (!account) return null

  const report = await db.managementReport.findFirst({
    where: { id: reportId, mandant_account_id: account.id },
  })
  if (!report) return null

  return { ...report, account }
}
