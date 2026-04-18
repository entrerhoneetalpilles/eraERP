"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function generateAttestationAction(ownerId: string, annee: number) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/pdf/attestation/${ownerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annee }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    return { error: body.error ?? `Erreur ${res.status}` }
  }

  revalidatePath("/attestation-fiscale")
  revalidatePath("/documents")
  return { success: true }
}
