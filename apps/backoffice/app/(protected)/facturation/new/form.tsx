"use client"

import { useFormState } from "react-dom"
import { useState, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createFactureAction } from "./actions"
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react"
import { computeLineItemHT, computeTotalsFromLineItems } from "@/lib/validations/facture"

interface LineItem {
  id: string
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  tva_rate: number
}

interface Props {
  owners: { id: string; nom: string; email: string }[]
  nextNumber: string
}

const TVA_OPTIONS = [
  { label: "0% (exonéré)", value: 0 },
  { label: "10%", value: 0.1 },
  { label: "20%", value: 0.2 },
]

const UNITE_OPTIONS = ["forfait", "heure", "jour", "nuit", "prestation", "m²", "unité"]

const initialState = { error: null as any }

let nextId = 1
function newLine(): LineItem {
  return { id: String(nextId++), description: "", quantite: 1, unite: "forfait", prix_unitaire: 0, tva_rate: 0.2 }
}

export function NewFactureForm({ owners, nextNumber }: Props) {
  const [state, formAction, isPending] = useFormState(createFactureAction, initialState)
  const [lines, setLines] = useState<LineItem[]>([newLine()])
  const [remise, setRemise] = useState("")
  const [globalHT, setGlobalHT] = useState("")
  const [globalTVA, setGlobalTVA] = useState(0.2)
  const [useLineItems, setUseLineItems] = useState(true)

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        if (field === "quantite" || field === "prix_unitaire") {
          // auto-compute will happen in render
        }
        return updated
      })
    )
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev))
  }, [])

  const addLine = useCallback(() => setLines((prev) => [...prev, newLine()]), [])

  const linesWithHT = lines.map((l) => ({
    ...l,
    montant_ht: computeLineItemHT(l.quantite, l.prix_unitaire),
  }))

  const remisePct = parseFloat(remise) || 0

  const totals = useLineItems
    ? computeTotalsFromLineItems(linesWithHT, remisePct || undefined)
    : {
        montant_ht: parseFloat(globalHT) || 0,
        tva_amount: (parseFloat(globalHT) || 0) * globalTVA,
        montant_ttc: Math.round((parseFloat(globalHT) || 0) * (1 + globalTVA) * 100) / 100,
      }

  const lineItemsPayload = useLineItems
    ? linesWithHT.map((l, i) => ({
        description: l.description,
        quantite: l.quantite,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
        montant_ht: l.montant_ht,
        tva_rate: l.tva_rate,
        ordre: i,
      }))
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Nouvelle facture ${nextNumber}`}
        actions={
          <Link href="/facturation">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-4xl bg-card rounded-md border border-border overflow-hidden">
        {/* Hidden fields */}
        <input type="hidden" name="montant_ht" value={totals.montant_ht} />
        <input type="hidden" name="tva_rate" value={useLineItems ? (linesWithHT[0]?.tva_rate ?? 0.2) : globalTVA} />
        <input type="hidden" name="line_items_json" value={JSON.stringify(lineItemsPayload)} />

        {/* Section — Destinataire */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Destinataire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_id" className="text-sm font-medium">Propriétaire *</Label>
              <select
                id="owner_id" name="owner_id" defaultValue=""
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="" disabled>Sélectionner un propriétaire…</option>
                {owners.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
              </select>
              {state?.error?.owner_id && <p className="text-xs text-destructive">{state.error.owner_id[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="objet" className="text-sm font-medium">Objet de la facture</Label>
              <Input id="objet" name="objet" placeholder="Honoraires de gestion – Avril 2026" className="h-10" />
            </div>
          </div>
        </div>

        {/* Section — Période & Échéance */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Période & Conditions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode_debut" className="text-sm font-medium">Début *</Label>
              <Input id="periode_debut" name="periode_debut" type="date" className="h-10" />
              {state?.error?.periode_debut && <p className="text-xs text-destructive">{state.error.periode_debut[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode_fin" className="text-sm font-medium">Fin *</Label>
              <Input id="periode_fin" name="periode_fin" type="date" className="h-10" />
              {state?.error?.periode_fin && <p className="text-xs text-destructive">{state.error.periode_fin[0]}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="date_echeance" className="text-sm font-medium">Date d'échéance</Label>
              <Input id="date_echeance" name="date_echeance" type="date" className="h-10" />
              <p className="text-xs text-muted-foreground">Laissez vide pour 30 jours nets par défaut</p>
            </div>
          </div>
        </div>

        {/* Section — Lignes de prestation */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Prestations</h2>
            <button
              type="button"
              onClick={() => setUseLineItems((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              {useLineItems ? "Montant global" : "Lignes détaillées"}
            </button>
          </div>

          {useLineItems ? (
            <div className="space-y-2">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_80px_100px_120px_100px_36px] gap-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Description</span>
                <span>Qté</span>
                <span>Unité</span>
                <span>PU HT (€)</span>
                <span>Total HT</span>
                <span />
              </div>

              {lines.map((line, idx) => {
                const lineHT = computeLineItemHT(line.quantite, line.prix_unitaire)
                return (
                  <div key={line.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_120px_100px_36px] gap-2 items-center group">
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, "description", e.target.value)}
                      placeholder="Description de la prestation"
                      className="h-9 text-sm"
                    />
                    <Input
                      type="number" min="0.01" step="0.01"
                      value={line.quantite}
                      onChange={(e) => updateLine(line.id, "quantite", parseFloat(e.target.value) || 0)}
                      className="h-9 text-sm"
                    />
                    <select
                      value={line.unite}
                      onChange={(e) => updateLine(line.id, "unite", e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                    >
                      {UNITE_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <Input
                      type="number" min="0" step="0.01"
                      value={line.prix_unitaire}
                      onChange={(e) => updateLine(line.id, "prix_unitaire", parseFloat(e.target.value) || 0)}
                      className="h-9 text-sm"
                    />
                    <div className="h-9 flex items-center px-3 rounded-md bg-muted/40 text-sm font-medium text-foreground border border-border/50">
                      {lineHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}

              <button
                type="button" onClick={addLine}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-1 py-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une ligne
              </button>

              {/* TVA par défaut pour toutes les lignes */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Taux TVA appliqué :</span>
                <div className="flex items-center gap-2">
                  {TVA_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLines((prev) => prev.map((l) => ({ ...l, tva_rate: opt.value })))}
                      className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                        lines.every((l) => l.tva_rate === opt.value)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_ht_global" className="text-sm font-medium">Montant HT (€) *</Label>
                <Input
                  id="montant_ht_global"
                  type="number" step="0.01" placeholder="350.00"
                  className="h-10"
                  value={globalHT}
                  onChange={(e) => setGlobalHT(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Taux TVA</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  value={globalTVA}
                  onChange={(e) => setGlobalTVA(parseFloat(e.target.value))}
                >
                  {TVA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Remise */}
          <div className="flex items-center gap-3 pt-2">
            <Label htmlFor="remise_pourcent" className="text-sm font-medium text-muted-foreground w-32 shrink-0">Remise (%)</Label>
            <Input
              id="remise_pourcent" name="remise_pourcent"
              type="number" min="0" max="100" step="0.5" placeholder="0"
              className="h-9 w-28"
              value={remise}
              onChange={(e) => setRemise(e.target.value)}
            />
          </div>
        </div>

        {/* Récapitulatif */}
        {(totals.montant_ht > 0 || totals.montant_ttc > 0) && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{(useLineItems ? linesWithHT.reduce((s, l) => s + l.montant_ht, 0) : parseFloat(globalHT) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
                {remisePct > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Remise ({remisePct}%)</span>
                    <span>− {(totals.montant_ht - (useLineItems ? linesWithHT.reduce((s, l) => s + l.montant_ht, 0) : parseFloat(globalHT) || 0)).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{totals.montant_ht.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{totals.tva_amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                  <span>Total TTC</span>
                  <span className="text-primary">{totals.montant_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section — Notes */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes_client" className="text-sm font-medium">Notes apparaissant sur la facture</Label>
              <textarea
                id="notes_client" name="notes_client"
                rows={3}
                placeholder="Conditions de règlement, IBAN, informations complémentaires…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes internes (non visibles)</Label>
              <textarea
                id="notes" name="notes"
                rows={3}
                placeholder="Notes privées, suivi interne…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Création…" : "Créer la facture"}
          </Button>
          <Link href="/facturation">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
          <span className="ml-auto text-xs text-muted-foreground">Sera créée en brouillon</span>
        </div>
      </form>
    </div>
  )
}
