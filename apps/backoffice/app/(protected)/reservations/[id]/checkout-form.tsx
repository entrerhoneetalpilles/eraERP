"use client"

import { useState } from "react"
import { completeCheckoutAction } from "./actions"
import { CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

const ITEMS = [
  "Clés récupérées",
  "État des lieux effectué",
  "Ménage planifié",
  "Inventaire vérifié",
]

export function CheckoutForm({ bookingId, guestId }: { bookingId: string; guestId: string }) {
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false))
  const [caution, setCaution] = useState<"liberee" | "retenue_partielle" | "retenue_totale">("liberee")
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [observations, setObservations] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const allChecked = checked.every(Boolean)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        Check-out
      </button>
    )
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Check-out validé</p>
        <Link
          href={`/voyageurs/${guestId}/edit${observations ? `?observations=${encodeURIComponent(observations)}` : ""}`}
          className="text-xs text-primary hover:underline"
        >
          Mettre à jour la fiche voyageur →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 space-y-4 max-w-md">
      <p className="text-sm font-semibold text-foreground">Checklist check-out</p>

      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={checked[i]}
              onChange={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
            />
            {checked[i]
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
              : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" aria-hidden="true" />}
            <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{item}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caution</p>
        <div role="group" aria-label="Caution" className="flex gap-2 flex-wrap">
          {(["liberee", "retenue_partielle", "retenue_totale"] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setCaution(v)}
              aria-pressed={caution === v}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${caution === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              {v === "liberee" ? "Libérée" : v === "retenue_partielle" ? "Retenue partielle" : "Retenue totale"}
            </button>
          ))}
        </div>
        {caution !== "liberee" && (
          <div className="flex gap-2">
            <input
              type="number"
              name="montant_retenu"
              placeholder="Montant (€)"
              className="text-sm border border-border rounded-md px-2 py-1 w-32 bg-background"
            />
            <input
              type="text"
              name="motif"
              placeholder="Motif"
              className="text-sm border border-border rounded-md px-2 py-1 flex-1 bg-background"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Observations</p>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="État du logement, dégradations, remarques…"
          rows={3}
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none"
        />
      </div>

      <form
        action={async (fd) => {
          setSubmitting(true)
          fd.set("observations", observations)
          fd.set("caution", caution)
          ITEMS.forEach((_, i) => fd.set(`item_${i}`, checked[i] ? "on" : "off"))
          await completeCheckoutAction(bookingId, fd)
          setSubmitting(false)
          setSubmitted(true)
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          disabled={!allChecked || submitting}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting ? "Validation…" : "Valider le check-out"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </form>
    </div>
  )
}
