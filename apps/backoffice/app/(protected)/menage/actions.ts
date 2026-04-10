"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { assignContractor } from "@/lib/dal/menage"
import { sendMenageAssignEmail } from "@conciergerie/email"
import { db } from "@conciergerie/db"

export async function assignCleaningTaskAction(taskId: string, contractorId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const task = await assignContractor(taskId, contractorId)

  if (task.contractor?.email) {
    try {
      await sendMenageAssignEmail({
        to: task.contractor.email,
        contractorName: task.contractor.nom,
        propertyName: task.property.nom,
        datePrevue: new Date(task.date_prevue).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        notes: task.notes ?? undefined,
      })
    } catch (e) {
      console.error("[assignCleaningTask] email failed:", e)
    }
  }

  await db.auditLog.create({
    data: {
      action: "MENAGE_ASSIGNED",
      entity_type: "CleaningTask",
      entity_id: taskId,
    },
  })

  revalidatePath("/menage")
  revalidatePath(`/menage/${taskId}`)
  return { success: true }
}
