"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import { FileText, Download, Save, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { saveMandatePdfAction } from "@/app/(protected)/documents/actions"

export function MandatePdfButton({ mandateId }: { mandateId: string }) {
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const result = await saveMandatePdfAction(mandateId)
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("PDF sauvegardé dans les documents")
    }
  }

  const pdfUrl = `/api/pdf/mandate/${mandateId}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="sm" variant="outline" className="gap-2" disabled={saving}>
          <FileText className="w-4 h-4" />
          {saving ? "Génération…" : "PDF"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(pdfUrl, "_blank")} className="gap-2 cursor-pointer">
          <ExternalLink className="w-3.5 h-3.5" />
          Aperçu PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const a = document.createElement("a")
            a.href = pdfUrl
            a.download = `Mandat-${mandateId}.pdf`
            a.click()
          }}
          className="gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Télécharger
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSave} className="gap-2 cursor-pointer">
          <Save className="w-3.5 h-3.5" />
          Sauvegarder dans les documents
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
