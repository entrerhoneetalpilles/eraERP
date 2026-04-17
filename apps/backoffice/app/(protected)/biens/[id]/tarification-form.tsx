"use client"

import { useState, useTransition } from "react"
import { Button } from "@conciergerie/ui"
import { Plus, Trash2, ToggleLeft, ToggleRight, Euro, CalendarX } from "lucide-react"
import {
  createPriceRuleAction, deletePriceRuleAction, togglePriceRuleAction,
  createBlockedDateAction, deleteBlockedDateAction,
} from "./actions"

type PriceRule = {
  id: string
  type: string
  nom: string | null
  prix_nuit: number
  sejour_min: number
  date_debut: Date | null
  date_fin: Date | null
  actif: boolean
  priorite: number
}

type BlockedDate = {
  id: string
  date_debut: Date
  date_fin: Date
  motif: string | null
  notes: string | null
}

const PRICE_RULE_TYPES = ["DEFAUT", "SAISON", "WEEKEND", "EVENEMENT"] as const
const BLOCKED_MOTIFS = ["PROPRIETAIRE", "TRAVAUX", "MAINTENANCE"] as const

export function TarificationForm({
  propertyId,
  priceRules,
  blockedDates,
}: {
  propertyId: string
  priceRules: PriceRule[]
  blockedDates: BlockedDate[]
}) {
  const [isPending, startTransition] = useTransition()
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [showBlockForm, setShowBlockForm] = useState(false)

  const [priceData, setPriceData] = useState({
    type: "DEFAUT",
    nom: "",
    date_debut: "",
    date_fin: "",
    prix_nuit: "",
    sejour_min: "1",
    priorite: "1",
  })

  const [blockData, setBlockData] = useState({
    date_debut: "",
    date_fin: "",
    motif: "PROPRIETAIRE",
    notes: "",
  })

  function handleCreatePrice() {
    if (!priceData.prix_nuit) return
    startTransition(async () => {
      await createPriceRuleAction(propertyId, {
        type: priceData.type,
        nom: priceData.nom || undefined,
        date_debut: priceData.date_debut || undefined,
        date_fin: priceData.date_fin || undefined,
        prix_nuit: parseFloat(priceData.prix_nuit),
        sejour_min: parseInt(priceData.sejour_min),
        priorite: parseInt(priceData.priorite),
      })
      setShowPriceForm(false)
      setPriceData({ type: "DEFAUT", nom: "", date_debut: "", date_fin: "", prix_nuit: "", sejour_min: "1", priorite: "1" })
    })
  }

  function handleCreateBlock() {
    if (!blockData.date_debut || !blockData.date_fin) return
    startTransition(async () => {
      await createBlockedDateAction(propertyId, {
        date_debut: blockData.date_debut,
        date_fin: blockData.date_fin,
        motif: blockData.motif,
        notes: blockData.notes || undefined,
      })
      setShowBlockForm(false)
      setBlockData({ date_debut: "", date_fin: "", motif: "PROPRIETAIRE", notes: "" })
    })
  }

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <div className="space-y-4">
      {/* Price Rules */}
      <div className="bg-card rounded-md border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Euro className="w-3.5 h-3.5" />
            Règles tarifaires
          </h2>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowPriceForm(!showPriceForm)}>
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Button>
        </div>

        {showPriceForm && (
          <div className="bg-muted rounded-md p-4 mb-4 space-y-3 border border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={priceData.type} onChange={e => setPriceData(p => ({ ...p, type: e.target.value }))}>
                  {PRICE_RULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nom (optionnel)</label>
                <input className={inputCls} placeholder="ex: Été 2025" value={priceData.nom} onChange={e => setPriceData(p => ({ ...p, nom: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Prix / nuit (€)</label>
                <input className={inputCls} type="number" min="0" step="0.01" placeholder="120" value={priceData.prix_nuit} onChange={e => setPriceData(p => ({ ...p, prix_nuit: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Séjour min (nuits)</label>
                <input className={inputCls} type="number" min="1" value={priceData.sejour_min} onChange={e => setPriceData(p => ({ ...p, sejour_min: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Date début</label>
                <input className={inputCls} type="date" value={priceData.date_debut} onChange={e => setPriceData(p => ({ ...p, date_debut: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Date fin</label>
                <input className={inputCls} type="date" value={priceData.date_fin} onChange={e => setPriceData(p => ({ ...p, date_fin: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Priorité</label>
                <input className={inputCls} type="number" min="1" value={priceData.priorite} onChange={e => setPriceData(p => ({ ...p, priorite: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowPriceForm(false)}>Annuler</Button>
              <Button size="sm" disabled={isPending || !priceData.prix_nuit} onClick={handleCreatePrice}>Créer</Button>
            </div>
          </div>
        )}

        {priceRules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune règle tarifaire</p>
        ) : (
          <div className="divide-y divide-border">
            {priceRules.map((rule) => (
              <div key={rule.id} className={`flex items-center justify-between py-3 ${!rule.actif ? "opacity-50" : ""}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{rule.nom ?? rule.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.date_debut && rule.date_fin
                      ? `${new Date(rule.date_debut).toLocaleDateString("fr-FR")} → ${new Date(rule.date_fin).toLocaleDateString("fr-FR")}`
                      : "Permanente"
                    } · min. {rule.sejour_min} nuit{rule.sejour_min !== 1 ? "s" : ""} · prio. {rule.priorite}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm font-bold tabular-nums">
                    {rule.prix_nuit.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/nuit
                  </span>
                  <button
                    type="button"
                    title={rule.actif ? "Désactiver" : "Activer"}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => startTransition(() => { void togglePriceRuleAction(rule.id, propertyId, !rule.actif) })}
                  >
                    {rule.actif
                      ? <ToggleRight className="w-5 h-5 text-green-600" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => startTransition(() => { void deletePriceRuleAction(rule.id, propertyId) })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocked Dates */}
      <div className="bg-card rounded-md border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CalendarX className="w-3.5 h-3.5" />
            Dates bloquées
          </h2>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowBlockForm(!showBlockForm)}>
            <Plus className="w-3.5 h-3.5" />
            Bloquer
          </Button>
        </div>

        {showBlockForm && (
          <div className="bg-muted rounded-md p-4 mb-4 space-y-3 border border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date début</label>
                <input className={inputCls} type="date" value={blockData.date_debut} onChange={e => setBlockData(p => ({ ...p, date_debut: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Date fin</label>
                <input className={inputCls} type="date" value={blockData.date_fin} onChange={e => setBlockData(p => ({ ...p, date_fin: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Motif</label>
                <select className={inputCls} value={blockData.motif} onChange={e => setBlockData(p => ({ ...p, motif: e.target.value }))}>
                  {BLOCKED_MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes (optionnel)</label>
                <input className={inputCls} placeholder="Raison..." value={blockData.notes} onChange={e => setBlockData(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowBlockForm(false)}>Annuler</Button>
              <Button size="sm" disabled={isPending || !blockData.date_debut || !blockData.date_fin} onClick={handleCreateBlock}>Bloquer</Button>
            </div>
          </div>
        )}

        {blockedDates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune date bloquée</p>
        ) : (
          <div className="divide-y divide-border">
            {blockedDates.map((block) => (
              <div key={block.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-foreground">
                    {new Date(block.date_debut).toLocaleDateString("fr-FR")} → {new Date(block.date_fin).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">{block.motif}{block.notes ? ` — ${block.notes}` : ""}</p>
                </div>
                <button
                  type="button"
                  title="Supprimer"
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-3"
                  onClick={() => startTransition(() => { void deleteBlockedDateAction(block.id, propertyId) })}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
