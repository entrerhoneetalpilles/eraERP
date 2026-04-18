"use client"

import { useTransition } from "react"
import { CheckCircle2, PenLine, Loader2, User } from "lucide-react"
import { signInventoryAction } from "../actions"

export function SignaturePanel({
  inventoryId,
  signeAgent,
  signeVoyageur,
}: {
  inventoryId: string
  signeAgent: boolean
  signeVoyageur: boolean
}) {
  const [pending, startTransition] = useTransition()

  function sign(role: "agent" | "voyageur") {
    startTransition(() => { void signInventoryAction(inventoryId, role) })
  }

  return (
    <div className="flex items-center gap-4 pt-2 border-t border-border flex-wrap">
      <p className="text-xs text-muted-foreground shrink-0">Signatures :</p>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Agent */}
        {signeAgent ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <User className="w-3 h-3" />Agent — signé
          </span>
        ) : (
          <button
            onClick={() => sign("agent")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
            Signer (agent)
          </button>
        )}

        {/* Voyageur */}
        {signeVoyageur ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <User className="w-3 h-3" />Voyageur — signé
          </span>
        ) : (
          <button
            onClick={() => sign("voyageur")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
            Signer (voyageur)
          </button>
        )}
      </div>
    </div>
  )
}
