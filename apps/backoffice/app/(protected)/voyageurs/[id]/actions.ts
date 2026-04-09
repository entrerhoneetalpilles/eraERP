"use server"

import { revalidatePath } from "next/cache"
import { updateGuest } from "@/lib/dal/guests"

const VALID_TAGS = ["VIP", "REGULIER", "BLACKLIST", "AVEC_ANIMAL", "FAMILLE", "SANS_CONTACT"]

export async function updateGuestAction(id: string, formData: FormData) {
  try {
    const tags = formData.getAll("tags").filter(t => VALID_TAGS.includes(t as string)) as string[]
    const noteRaw = formData.get("note_interne")
    await updateGuest(id, {
      prenom: (formData.get("prenom") as string)?.trim() || undefined,
      nom: (formData.get("nom") as string)?.trim() || undefined,
      email: (formData.get("email") as string)?.trim() || undefined,
      telephone: (formData.get("telephone") as string)?.trim() || undefined,
      langue: (formData.get("langue") as string)?.trim() || undefined,
      nationalite: (formData.get("nationalite") as string)?.trim() || undefined,
      tags,
      notes_internes: (formData.get("notes_internes") as string)?.trim() || undefined,
      note_interne: noteRaw ? parseFloat(noteRaw as string) : null,
    })
    revalidatePath(`/voyageurs/${id}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message ?? "Erreur lors de la mise à jour" }
  }
}
