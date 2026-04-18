"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { matchBankLine, ignoreBankLine, importBankStatementCsv } from "@/lib/dal/rapprochement"

export async function matchBankLineAction(bankLineId: string, transactionId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await matchBankLine(bankLineId, transactionId)
  revalidatePath("/rapprochement")
  return { success: true }
}

export async function ignoreBankLineAction(bankLineId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }
  await ignoreBankLine(bankLineId)
  revalidatePath("/rapprochement")
  return { success: true }
}

export async function importCsvAction(_prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Non autorisé" }

  const file = formData.get("file") as File | null
  if (!file) return { error: "Fichier requis" }

  const text = await file.text()
  const lines = text
    .split("\n")
    .slice(1) // skip header
    .filter(l => l.trim())
    .map(l => {
      const cols = l.split(";").map(c => c.replace(/^"|"$/g, "").trim())
      // Expected CSV format: date;libelle;montant
      const [date, libelle, montantStr] = cols
      const montant = parseFloat(montantStr?.replace(",", ".") ?? "0")
      return { date: date ?? "", libelle: libelle ?? "", montant: isNaN(montant) ? 0 : montant }
    })
    .filter(l => l.date && l.libelle)

  if (lines.length === 0) return { error: "Aucune ligne valide trouvée. Format attendu: date;libelle;montant" }

  await importBankStatementCsv(file.name, lines)
  revalidatePath("/rapprochement")
  return { success: true, nb: lines.length }
}
