"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, FileEdit } from "lucide-react"
import { createAvenantAction, deleteAvenantAction } from "./actions"

interface Avenant {
  id: string
  numero: number
  date: Date
  description: string
  statut_signature: string
  modifications: unknown
}

const SIG_LABELS: Record<string, string> = {
  NONE: "Non signé", PENDING: "En attente", SIGNED: "Signé",
}
const SIG_COLORS: Record<string, string> = {
  NONE: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SIGNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export function AvenantForm({ mandateId, avenants }: { mandateId: string; avenants: Avenant[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), description: "", modifications: "" })
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim()) { setError("Description requise"); return }
    setError(null)
    startTransition(async () => {
      const res = await createAvenantAction(mandateId, form)
      if (res?.error) { setError(res.error); return }
      setForm({ date: new Date().toISOString().slice(0, 10), description: "", modifications: "" })
      setOpen(false)
      router.refresh()
    })
  }

  function handleDelete(avenantId: string) {
    if (!confirm("Supprimer cet avenant ?")) return
    startTransition(async () => {
      await deleteAvenantAction(avenantId, mandateId)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <FileEdit className="w-3.5 h-3.5" />
          Avenants ({avenants.length})
        </p>
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvel avenant
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Modification du taux d'honoraires"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Détail des modifications</label>
            <textarea
              name="modifications"
              value={form.modifications}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez les modifications apportées au mandat..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Créer l'avenant
            </button>
          </div>
        </form>
      )}

      {avenants.length === 0 && !open ? (
        <p className="text-sm text-muted-foreground text-center py-10">Aucun avenant</p>
      ) : (
        <div className="space-y-2">
          {avenants.map(avenant => (
            <div key={avenant.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">Avenant n°{avenant.numero}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SIG_COLORS[avenant.statut_signature] ?? "bg-muted"}`}>
                      {SIG_LABELS[avenant.statut_signature] ?? avenant.statut_signature}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(avenant.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{avenant.description}</p>
                  {avenant.modifications && typeof avenant.modifications === "object" &&
                    "texte" in (avenant.modifications as Record<string, unknown>) &&
                    (avenant.modifications as Record<string, string>).texte && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">
                        {(avenant.modifications as Record<string, string>).texte}
                      </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(avenant.id)}
                  disabled={pending}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
