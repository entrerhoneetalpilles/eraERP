"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { generateCrgAction } from "./actions"

export default function NewCrgPage() {
  const [state, formAction] = useActionState(generateCrgAction, null)
  const [owners, setOwners] = useState<Array<{ id: string; nom: string }>>([])

  useEffect(() => {
    fetch("/api/owners")
      .then((r) => r.json())
      .then((data: Array<{ id: string; nom: string }>) => setOwners(data))
      .catch(() => {})
  }, [])

  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const lastOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastOfMonthStr = `${lastOfMonthDate.getFullYear()}-${String(lastOfMonthDate.getMonth() + 1).padStart(2, "0")}-${String(lastOfMonthDate.getDate()).padStart(2, "0")}`

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Générer un CRG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calcule automatiquement revenus, honoraires et charges sur la période.
        </p>
      </div>

      <form action={formAction} className="bg-card border rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="owner_id" className="block text-sm font-medium text-foreground mb-1">
            Propriétaire <span className="text-destructive">*</span>
          </label>
          <select
            id="owner_id"
            name="owner_id"
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Sélectionner…</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="periode_debut" className="block text-sm font-medium text-foreground mb-1">
            Début de période <span className="text-destructive">*</span>
          </label>
          <input
            id="periode_debut"
            type="date"
            name="periode_debut"
            defaultValue={firstOfMonth}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="periode_fin" className="block text-sm font-medium text-foreground mb-1">
            Fin de période <span className="text-destructive">*</span>
          </label>
          <input
            id="periode_fin"
            type="date"
            name="periode_fin"
            defaultValue={lastOfMonthStr}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Générer le CRG
          </button>
          <Link
            href="/crg"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
