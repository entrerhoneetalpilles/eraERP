"use client"

import { useFormState } from "react-dom"
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
  const [state, formAction] = useFormState(
    saveDevisAction.bind(null, workOrderId),
    null
  )

  return (
    <div className="bg-card rounded-md border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Devis prestataire
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Seuil de validation automatique :{" "}
        {seuil.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </p>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="montant_devis" className="text-sm font-medium text-foreground">
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
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="notes_devis" className="text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            id="notes_devis"
            name="notes_devis"
            rows={3}
            defaultValue={notesDevisActuel ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        {state?.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Enregistrer le devis
        </button>
      </form>
    </div>
  )
}
