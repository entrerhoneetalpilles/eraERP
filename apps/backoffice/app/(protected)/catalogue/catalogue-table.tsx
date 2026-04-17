"use client"

import { useState, useTransition } from "react"
import { Button } from "@conciergerie/ui"
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil, Check, X } from "lucide-react"
import { createServiceAction, updateServiceAction, deleteServiceAction } from "./actions"

type Service = {
  id: string
  nom: string
  description: string | null
  categorie: string
  tarif: number
  unite: "ACTE" | "HEURE" | "NUIT" | "MOIS"
  tva_rate: number
  actif: boolean
  _count: { orders: number }
}

const UNITE_LABELS: Record<string, string> = {
  ACTE: "Acte", HEURE: "Heure", NUIT: "Nuit", MOIS: "Mois",
}

const INITIAL_FORM = { nom: "", description: "", categorie: "", tarif: "", unite: "ACTE" as const, tva_rate: "20" }

export function CatalogueTable({ services }: { services: Service[] }) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [editForm, setEditForm] = useState<Partial<typeof INITIAL_FORM>>({})

  const categories = [...new Set(services.map(s => s.categorie))].sort()

  function handleCreate() {
    if (!form.nom || !form.categorie || !form.tarif) return
    startTransition(async () => {
      await createServiceAction({
        nom: form.nom,
        description: form.description || undefined,
        categorie: form.categorie,
        tarif: parseFloat(form.tarif),
        unite: form.unite,
        tva_rate: parseFloat(form.tva_rate) / 100,
      })
      setShowForm(false)
      setForm(INITIAL_FORM)
    })
  }

  function startEdit(s: Service) {
    setEditId(s.id)
    setEditForm({ nom: s.nom, description: s.description ?? "", categorie: s.categorie, tarif: String(s.tarif), unite: s.unite, tva_rate: String(Math.round(s.tva_rate * 100)) })
  }

  function handleSaveEdit(id: string) {
    if (!editForm.nom || !editForm.categorie || !editForm.tarif) return
    startTransition(async () => {
      await updateServiceAction(id, {
        nom: editForm.nom!,
        description: editForm.description || null,
        categorie: editForm.categorie!,
        tarif: parseFloat(editForm.tarif!),
        unite: editForm.unite as any,
        tva_rate: parseFloat(editForm.tva_rate!) / 100,
      })
      setEditId(null)
    })
  }

  const inputCls = "rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  const groupedByCategory = categories.map(cat => ({
    cat,
    items: services.filter(s => s.categorie === cat),
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          Nouveau service
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4">Nouveau service</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nom *</label>
              <input className={inputCls + " w-full"} placeholder="Ex: Ménage fin de séjour" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Catégorie *</label>
              <input className={inputCls + " w-full"} placeholder="Ex: Ménage" list="categories-list" value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} />
              <datalist id="categories-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Description</label>
              <input className={inputCls + " w-full"} placeholder="Description optionnelle" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tarif HT (€) *</label>
              <input className={inputCls + " w-full"} type="number" min="0" step="0.01" value={form.tarif} onChange={e => setForm(p => ({ ...p, tarif: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Unité</label>
              <select className={inputCls + " w-full"} value={form.unite} onChange={e => setForm(p => ({ ...p, unite: e.target.value as any }))}>
                {Object.entries(UNITE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">TVA (%)</label>
              <input className={inputCls + " w-full"} type="number" min="0" max="100" step="1" value={form.tva_rate} onChange={e => setForm(p => ({ ...p, tva_rate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button size="sm" disabled={isPending || !form.nom || !form.categorie || !form.tarif} onClick={handleCreate}>Créer</Button>
          </div>
        </div>
      )}

      {groupedByCategory.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Aucun service dans le catalogue</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByCategory.map(({ cat, items }) => (
            <div key={cat} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat}</h3>
              </div>
              <div className="divide-y divide-border">
                {items.map(s => (
                  <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${!s.actif ? "opacity-50" : ""}`}>
                    {editId === s.id ? (
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input className={inputCls + " col-span-2"} value={editForm.nom ?? ""} onChange={e => setEditForm(p => ({ ...p, nom: e.target.value }))} />
                        <input className={inputCls} type="number" value={editForm.tarif ?? ""} onChange={e => setEditForm(p => ({ ...p, tarif: e.target.value }))} />
                        <input className={inputCls + " col-span-2"} placeholder="Description" value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                        <select className={inputCls} value={editForm.unite ?? "ACTE"} onChange={e => setEditForm(p => ({ ...p, unite: e.target.value as any }))}>
                          {Object.entries(UNITE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.nom}</p>
                        {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-3 shrink-0">
                      {editId !== s.id && (
                        <>
                          <span className="text-sm font-semibold tabular-nums">
                            {s.tarif.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/{UNITE_LABELS[s.unite]}
                          </span>
                          <span className="text-xs text-muted-foreground">{(s.tva_rate * 100).toFixed(0)}% TVA</span>
                          <span className="text-xs text-muted-foreground">{s._count.orders} cmd</span>
                        </>
                      )}
                      {editId === s.id ? (
                        <>
                          <button type="button" disabled={isPending} onClick={() => handleSaveEdit(s.id)} className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(s)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" disabled={isPending} onClick={() => startTransition(() => { void updateServiceAction(s.id, { actif: !s.actif }) })} className="text-muted-foreground hover:text-foreground transition-colors">
                            {s.actif ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          {s._count.orders === 0 && (
                            <button type="button" disabled={isPending} onClick={() => startTransition(() => { void deleteServiceAction(s.id) })} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
