"use server"

import { revalidatePath } from "next/cache"
import { updateBookingStatut } from "@/lib/dal/bookings"
import { autoCreateCleaningTask } from "@/lib/dal/menage"
import { db } from "@conciergerie/db"
import { auth } from "@/auth"

export async function updateBookingStatutAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const VALID_STATUTS = ["PENDING", "CONFIRMED", "CHECKEDIN", "CHECKEDOUT", "CANCELLED"] as const
  type ValidStatut = typeof VALID_STATUTS[number]
  const statut = formData.get("statut") as string
  if (!VALID_STATUTS.includes(statut as ValidStatut)) return
  await updateBookingStatut(id, statut as ValidStatut)
  if (statut === "CHECKEDOUT") {
    try {
      await autoCreateCleaningTask(id)
    } catch (e) {
      console.error("[autoCreateCleaningTask] Failed for booking", id, e)
    }
  }
  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
  revalidatePath("/menage")
}

export async function startCheckinAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const checklist = [
    formData.get("item_0") === "on",
    formData.get("item_1") === "on",
    formData.get("item_2") === "on",
    formData.get("item_3") === "on",
  ]

  const booking = await db.booking.findUnique({ where: { id }, select: { notes_internes: true } })
  if (!booking) return
  const existing = (() => {
    try { return JSON.parse(booking?.notes_internes ?? "{}") } catch { return {} }
  })()

  const updated = {
    ...existing,
    checkin: { items: checklist, at: new Date().toISOString() },
  }

  await db.booking.update({
    where: { id },
    data: {
      statut: "CHECKEDIN",
      notes_internes: JSON.stringify(updated),
    },
  })

  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
}

export async function completeCheckoutAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const checklist = [
    formData.get("item_0") === "on",
    formData.get("item_1") === "on",
    formData.get("item_2") === "on",
    formData.get("item_3") === "on",
  ]

  const caution = formData.get("caution") as string
  const montant_retenu = parseFloat(formData.get("montant_retenu") as string) || 0
  const motif = formData.get("motif") as string
  const observations = formData.get("observations") as string

  const booking = await db.booking.findUnique({ where: { id }, select: { notes_internes: true } })
  if (!booking) return
  const existing = (() => {
    try { return JSON.parse(booking?.notes_internes ?? "{}") } catch { return {} }
  })()

  const updated = {
    ...existing,
    checkout: {
      items: checklist,
      caution,
      montant_retenu: montant_retenu || undefined,
      motif: motif || undefined,
      observations: observations || undefined,
      at: new Date().toISOString(),
    },
  }

  await db.booking.update({
    where: { id },
    data: {
      statut: "CHECKEDOUT",
      notes_internes: JSON.stringify(updated),
    },
  })

  try {
    await autoCreateCleaningTask(id)
  } catch (e) {
    console.error("[autoCreateCleaningTask] Failed for booking", id, e)
  }

  revalidatePath(`/reservations/${id}`)
  revalidatePath("/reservations")
  revalidatePath("/menage")
}
