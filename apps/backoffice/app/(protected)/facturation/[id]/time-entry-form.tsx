"use client"

import { useState, useTransition } from "react"
import { Button } from "@conciergerie/ui"
import { Clock, Plus, Trash2 } from "lucide-react"
import { createTimeEntryAction, deleteTimeEntryAction } from "./actions"

type TimeEntry = {
  id: string
  date: Date | string
  description: string
  nb_heures: number
  taux_horaire: number
  montant_ht: number
}

export function TimeEntryForm({
  invoiceId,
  entries,
  readOnly,
}: {
  invoiceId: string
  entries: TimeEntry[]
  readOnly?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    nb_heures: "",
    taux_horaire: "",
  })

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  const fmtShort = (d: Date | string) => new Date(d).toLocaleDateString("fr-FR")

  function handleCreate() {
    if (!formData.description || !formData.nb_heures || !formData.taux_horaire) return
    startTransition(async () => {
      await createTimeEntryAction(invoiceId, {
        date: formData.date,
        description: formData.description,
        nb_heures: parseFloat(formData.nb_heures),
        taux_horaire: parseFloat(formData.taux_horaire),
      })
      setShowForm(false)
      setFormData({ date: new Date().toISOString().split("T")[0], description: "", nb_heures: "", taux_horaire: "" })
    })
  }

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <div className="px-8 py-5 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Temps passé
        </p>
        {!readOnly && (
          <Button size="sm" variant="outline" className="gap-2 h-7 px-2 text-xs" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3" />
            Ajouter
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted rounded-md p-3 mb-4 border border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <input className={inputCls} placeholder="ex: Gestion administrative" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input className={inputCls} type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Heures</label>
              <input className={inputCls} type="number" min="0.25" step="0.25" placeholder="1.5" value={formData.nb_heures} onChange={e => setFormData(p => ({ ...p, nb_heures: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Taux horaire HT (€/h)</label>
              <input className={inputCls} type="number" min="0" step="1" placeholder="75" value={formData.taux_horaire} onChange={e => setFormData(p => ({ ...p, taux_horaire: e.target.value }))} />
            </div>
            {formData.nb_heures && formData.taux_horaire && (
              <div className="flex items-end pb-1">
                <span className="text-sm font-semibold text-foreground">
                  = {fmt(parseFloat(formData.nb_heures) * parseFloat(formData.taux_horaire))} HT
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button size="sm" disabled={isPending || !formData.description || !formData.nb_heures || !formData.taux_horaire} onClick={handleCreate}>
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucune saisie de temps</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Description", "Temps", "Taux HT", "Total HT", ""].map((h, i) => (
                <th key={i} className={`pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i <= 1 ? "text-left" : "text-right"} ${i === 5 ? "w-8" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="py-2.5 pr-4 text-muted-foreground w-24">{fmtShort(entry.date)}</td>
                <td className="py-2.5 pr-4 text-foreground">{entry.description}</td>
                <td className="py-2.5 text-right text-muted-foreground">{entry.nb_heures}h</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">{entry.taux_horaire} €/h</td>
                <td className="py-2.5 text-right font-mono font-medium">{fmt(entry.montant_ht)}</td>
                <td className="py-2.5 text-right pl-2">
                  {!readOnly && (
                    <button
                      type="button"
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => startTransition(() => deleteTimeEntryAction(entry.id, invoiceId))}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={4} className="pt-2 text-xs text-muted-foreground">Total temps passé</td>
              <td className="pt-2 text-right font-mono font-semibold">
                {fmt(entries.reduce((s, e) => s + e.montant_ht, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}
