"use client"

import { useActionState } from "react"
import { saveDevisAction } from "./devis-actions"

export function DevisForm({
  workOrderId,
  montantDevisActuel,
  notesDevisActuel,
  seuil,
}: {
  workOrderId: string
  montantDevisActuel: number | null
  notesDevisActuel: string | null
  seuil: number
}) {
  const [state, formAction] = useActionState(
    saveDevisAction.bind(null, workOrderId),
    null
  )

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Devis prestataire
      </h2>
      <p className="text-xs text-muted-foreground">
        Seuil de validation automatique :{" "}
        {seuil.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="montant_devis" className="block text-sm font-medium text-foreground mb-1">
            Montant HT (€) <span className="text-destructive">*</span>
          </label>
          <input
            id="montant_devis"
            type="number"
            name="montant_devis"
            step="0.01"
            min="0.01"
            defaultValue={montantDevisActuel ?? ""}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="notes_devis" className="block text-sm font-medium text-foreground mb-1">
            Notes
          </label>
          <textarea
            id="notes_devis"
            name="notes_devis"
            rows={3}
            defaultValue={notesDevisActuel ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Enregistrer le devis
        </button>
      </form>
    </div>
  )
}
