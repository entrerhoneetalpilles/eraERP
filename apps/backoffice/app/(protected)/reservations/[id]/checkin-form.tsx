"use client"

import { useState } from "react"
import { startCheckinAction } from "./actions"
import { CheckCircle2, Circle } from "lucide-react"

const ITEMS = [
  "Remise des clés / codes d'accès confirmée",
  "Caution encaissée",
  "État général du logement vérifié",
  "Voyageur informé des règles maison",
]

export function CheckinForm({ bookingId }: { bookingId: string }) {
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false))
  const [open, setOpen] = useState(false)

  const allChecked = checked.every(Boolean)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        Check-in
      </button>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 space-y-4 max-w-md">
      <p className="text-sm font-semibold text-foreground">Checklist check-in</p>
      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="hidden"
              checked={checked[i]}
              onChange={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
            />
            {checked[i]
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
            <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{item}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <form action={startCheckinAction.bind(null, bookingId)}>
          {ITEMS.map((_, i) => (
            <input key={i} type="hidden" name={`item_${i}`} value={checked[i] ? "on" : "off"} />
          ))}
          <button
            type="submit"
            disabled={!allChecked}
            className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Valider le check-in
          </button>
        </form>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
