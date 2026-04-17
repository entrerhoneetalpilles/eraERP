"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { upsertReviewResponse } from "@/lib/dal/reviews"

export async function upsertReviewResponseAction(bookingId: string, reponse: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await upsertReviewResponse(bookingId, reponse)
  revalidatePath("/avis")
  return { success: true }
}
