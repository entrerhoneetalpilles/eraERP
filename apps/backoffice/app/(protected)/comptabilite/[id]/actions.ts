"use server"

import { exportTransactionsCsv } from "@/lib/dal/comptes"

export async function exportCompteCsvAction(id: string) {
  try {
    const csv = await exportTransactionsCsv(id)
    return { csv }
  } catch {
    return { csv: null, error: "Erreur export" }
  }
}
