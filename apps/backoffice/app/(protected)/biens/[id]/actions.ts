"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { propertySchema } from "@/lib/validations/property"
import { updateProperty, upsertPropertyAccess, deleteProperty } from "@/lib/dal/properties"
import { db } from "@conciergerie/db"

export async function updatePropertyAction(id: string, _prev: unknown, formData: FormData) {
  const raw = {
    nom: formData.get("nom"),
    type: formData.get("type"),
    superficie: formData.get("superficie"),
    nb_chambres: formData.get("nb_chambres"),
    capacite_voyageurs: formData.get("capacite_voyageurs"),
    adresse: {
      rue: formData.get("adresse.rue"),
      code_postal: formData.get("adresse.code_postal"),
      ville: formData.get("adresse.ville"),
      pays: "France",
    },
    statut: formData.get("statut") || "ACTIF",
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateProperty(id, parsed.data)
  revalidatePath(`/biens/${id}`)
  revalidatePath("/biens")
  redirect(`/biens/${id}`)
}

export async function updatePropertyAccessAction(property_id: string, _prev: unknown, formData: FormData) {
  const data = {
    type_acces: formData.get("type_acces") as "BOITE_CLES" | "CODE" | "AGENT" | "SERRURE_CONNECTEE",
    code_acces: (formData.get("code_acces") as string) || undefined,
    instructions_arrivee: (formData.get("instructions_arrivee") as string) || undefined,
    wifi_nom: (formData.get("wifi_nom") as string) || undefined,
    wifi_mdp: (formData.get("wifi_mdp") as string) || undefined,
    notes_depart: (formData.get("notes_depart") as string) || undefined,
  }

  await upsertPropertyAccess(property_id, data)
  revalidatePath(`/biens/${property_id}`)
  redirect(`/biens/${property_id}`)
}

export async function deletePropertyAction(id: string) {
  try {
    await deleteProperty(id)
    revalidatePath("/biens")
    redirect("/biens")
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function changePropertyStatusAction(id: string, statut: "ACTIF" | "INACTIF" | "TRAVAUX") {
  await updateProperty(id, { statut })
  revalidatePath(`/biens/${id}`)
  revalidatePath("/biens")
}

// ─── TARIFICATION ──────────────────────────────────────────────

export async function createPriceRuleAction(propertyId: string, data: {
  type: string; nom?: string; date_debut?: string; date_fin?: string
  prix_nuit: number; sejour_min: number; priorite: number
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.priceRule.create({
    data: {
      property_id: propertyId,
      type: data.type as "DEFAUT" | "SAISON" | "WEEKEND" | "EVENEMENT",
      nom: data.nom || null,
      date_debut: data.date_debut ? new Date(data.date_debut) : null,
      date_fin: data.date_fin ? new Date(data.date_fin) : null,
      prix_nuit: data.prix_nuit,
      sejour_min: data.sejour_min,
      priorite: data.priorite,
    },
  })
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}

export async function deletePriceRuleAction(id: string, propertyId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.priceRule.delete({ where: { id } })
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}

export async function togglePriceRuleAction(id: string, propertyId: string, actif: boolean) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.priceRule.update({ where: { id }, data: { actif } })
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}

// ─── DATES BLOQUÉES ────────────────────────────────────────────

export async function createBlockedDateAction(propertyId: string, data: {
  date_debut: string; date_fin: string; motif: string; notes?: string
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.blockedDate.create({
    data: {
      property_id: propertyId,
      date_debut: new Date(data.date_debut),
      date_fin: new Date(data.date_fin),
      motif: data.motif as "PROPRIETAIRE" | "TRAVAUX" | "MAINTENANCE",
      notes: data.notes || null,
    },
  })
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}

export async function deleteBlockedDateAction(id: string, propertyId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await db.blockedDate.delete({ where: { id } })
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}

// ─── DOCUMENTS LÉGAUX ──────────────────────────────────────────

export async function upsertPropertyDocumentAction(propertyId: string, data: {
  type: string; date_validite?: string; statut: string
}) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  const type = data.type as "DPE" | "ELECTRICITE" | "GAZ" | "PLOMB" | "AMIANTE" | "PNO" | "AUTRE"
  const statut = data.statut as "VALIDE" | "EXPIRE" | "MANQUANT"
  const date_validite = data.date_validite ? new Date(data.date_validite) : null
  const existing = await db.propertyDocument.findFirst({ where: { property_id: propertyId, type } })
  if (existing) {
    await db.propertyDocument.update({ where: { id: existing.id }, data: { date_validite, statut } })
  } else {
    await db.propertyDocument.create({ data: { property_id: propertyId, type, date_validite, statut } })
  }
  revalidatePath(`/biens/${propertyId}`)
  return { success: true }
}
