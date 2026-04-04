"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createUser } from "@/lib/dal/admin"

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  nom: z.string().min(1, "Nom requis"),
  role: z.enum(["ADMIN", "GESTIONNAIRE", "COMPTABLE", "TRAVAUX", "SERVICES", "DIRECTION"]),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
})

export async function createUserAction(_prev: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email"),
    nom: formData.get("nom"),
    role: formData.get("role"),
    password: formData.get("password"),
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createUser(parsed.data)
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: { email: ["Cet email est déjà utilisé"] } }
    }
    throw e
  }

  revalidatePath("/admin")
  redirect("/admin")
}
