"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import { CheckCircle2, X, Send } from "lucide-react"
import { toast } from "sonner"
import { validateDevisAction, cancelDevisAction, sendDevisToOwnerAction } from "./actions"

interface Props {
  devisId: string
  canValidate: boolean
  canSend: boolean
  canCancel: boolean
  ownerEmail: string | null
}

export function DevisActions({ devisId, canValidate, canSend, canCancel, ownerEmail }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function run(action: () => Promise<{ success?: boolean; error?: string }>, key: string) {
    setLoading(key)
    const result = await action()
    setLoading(null)
    if (result.error) toast.error(result.error)
    else toast.success(key === "send" ? "Devis envoyé au propriétaire" : key === "validate" ? "Devis validé" : "Devis annulé")
  }

  return (
    <>
      {canSend && ownerEmail && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={loading === "send"}
          onClick={() => run(() => sendDevisToOwnerAction(devisId), "send")}
        >
          <Send className="w-4 h-4" />
          {loading === "send" ? "Envoi…" : "Envoyer au propriétaire"}
        </Button>
      )}
      {canValidate && (
        <Button
          size="sm"
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          disabled={loading === "validate"}
          onClick={() => run(() => validateDevisAction(devisId), "validate")}
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading === "validate" ? "…" : "Valider"}
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          disabled={loading === "cancel"}
          onClick={() => run(() => cancelDevisAction(devisId), "cancel")}
        >
          <X className="w-4 h-4" />
          {loading === "cancel" ? "…" : "Annuler"}
        </Button>
      )}
    </>
  )
}
