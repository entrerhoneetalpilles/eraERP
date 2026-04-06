"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { workorderSchema } from "@/lib/validations/workorder"
import { createWorkOrder } from "@/lib/dal/travaux"

export async function createWorkOrderAction(
  _prev: unknown,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Non authentifié")

  const raw = {
    property_id: formData.get("property_id"),
    contractor_id: formData.get("contractor_id") || undefined,
    titre: formData.get("titre"),
    description: formData.get("description"),
    type: formData.get("type"),
    urgence: formData.get("urgence"),
    imputable_a: formData.get("imputable_a"),
    notes: formData.get("notes") || undefined,
  }

  const parsed = workorderSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createWorkOrder(session.user.email, parsed.data)
  revalidatePath("/travaux")
  redirect("/travaux")
}

