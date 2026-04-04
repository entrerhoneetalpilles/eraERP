"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { updateUser } from "@/lib/dal/admin"

export async function updateUserAction(
  id: string,
  _prev: unknown,
  formData: FormData
) {
  const nom = formData.get("nom") as string
  const actif = formData.get("actif") === "true"

  if (!nom) return { error: { nom: ["Nom requis"] } }

  await updateUser(id, { nom, actif })
  revalidatePath("/admin")
  redirect("/admin")
}
