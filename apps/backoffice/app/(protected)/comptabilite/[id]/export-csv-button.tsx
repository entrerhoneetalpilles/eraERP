"use client"

import { Button } from "@conciergerie/ui"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { exportCompteCsvAction } from "./actions"

export function ExportCsvButton({ accountId, ownerNom }: { accountId: string; ownerNom: string }) {
  async function handleExport() {
    const res = await exportCompteCsvAction(accountId)
    if (!res.csv) return toast.error("Erreur lors de l'export")
    const blob = new Blob(["\uFEFF" + res.csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `compte-${ownerNom.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export CSV téléchargé")
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport} className="cursor-pointer gap-1.5">
      <Download className="w-3.5 h-3.5" />Export CSV
    </Button>
  )
}
