"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { Button } from "@conciergerie/ui"
import { generateCrgAction } from "./actions"

function getDefaultDates() {
  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const lastOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastOfMonthStr = `${lastOfMonthDate.getFullYear()}-${String(lastOfMonthDate.getMonth() + 1).padStart(2, "0")}-${String(lastOfMonthDate.getDate()).padStart(2, "0")}`
  return { firstOfMonth, lastOfMonthStr }
}

export function CrgForm({ owners }: { owners: Array<{ id: string; nom: string }> }) {
  const [state, formAction] = useFormState(generateCrgAction, null)
  const { firstOfMonth, lastOfMonthStr } = getDefaultDates()

  return (
    <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
      {/* Section — Propriétaire */}
      <div className="px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Propriétaire</h2>

        <div className="space-y-2">
          <label htmlFor="owner_id" className="text-sm font-medium text-foreground">
            Propriétaire <span className="text-destructive">*</span>
          </label>
          <select
            id="owner_id" name="owner_id" required
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="">Sélectionner…</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Section — Période */}
      <div className="px-6 py-5 border-t border-border space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Période</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="periode_debut" className="text-sm font-medium text-foreground">
              Début <span className="text-destructive">*</span>
            </label>
            <input
              id="periode_debut" type="date" name="periode_debut"
              defaultValue={firstOfMonth} required
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="periode_fin" className="text-sm font-medium text-foreground">
              Fin <span className="text-destructive">*</span>
            </label>
            <input
              id="periode_fin" type="date" name="periode_fin"
              defaultValue={lastOfMonthStr} required
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
        <Button type="submit" className="cursor-pointer">
          Générer le CRG
        </Button>
        <Link href="/crg">
          <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
        </Link>
      </div>
    </form>
  )
}
