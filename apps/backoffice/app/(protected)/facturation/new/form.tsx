"use client"

import { useFormState } from "react-dom"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createFactureAction } from "./actions"
import { ArrowLeft } from "lucide-react"
import { computeMontantTTC } from "@/lib/validations/facture"

interface Props {
  owners: { id: string; nom: string; email: string }[]
  nextNumber: string
}

const initialState = { error: null as any }

export function NewFactureForm({ owners, nextNumber }: Props) {
  const [state, formAction, isPending] = useFormState(createFactureAction, initialState)
  const [montantHT, setMontantHT] = useState("")
  const [tvaRate, setTvaRate] = useState("0.20")

  const ttc = montantHT && !isNaN(parseFloat(montantHT))
    ? computeMontantTTC(parseFloat(montantHT), parseFloat(tvaRate))
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle facture d'honoraires"
        actions={
          <Link href="/facturation">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Destinataire */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Destinataire</h2>

          <div className="space-y-2">
            <Label htmlFor="owner_id" className="text-sm font-medium">Propriétaire</Label>
            <select
              id="owner_id"
              name="owner_id"
              defaultValue=""
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="" disabled>Sélectionner un propriétaire…</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.nom}</option>
              ))}
            </select>
            {state?.error?.owner_id && (
              <p className="text-xs text-destructive">{state.error.owner_id[0]}</p>
            )}
          </div>
        </div>

        {/* Section — Période */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Période</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode_debut" className="text-sm font-medium">Début</Label>
              <Input id="periode_debut" name="periode_debut" type="date" className="h-10" />
              {state?.error?.periode_debut && (
                <p className="text-xs text-destructive">{state.error.periode_debut[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode_fin" className="text-sm font-medium">Fin</Label>
              <Input id="periode_fin" name="periode_fin" type="date" className="h-10" />
              {state?.error?.periode_fin && (
                <p className="text-xs text-destructive">{state.error.periode_fin[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section — Montants */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Montants</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montant_ht" className="text-sm font-medium">Montant HT (€)</Label>
              <Input
                id="montant_ht"
                name="montant_ht"
                type="number"
                step="0.01"
                placeholder="350.00"
                className="h-10"
                value={montantHT}
                onChange={(e) => setMontantHT(e.target.value)}
              />
              {state?.error?.montant_ht && (
                <p className="text-xs text-destructive">{state.error.montant_ht[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva_rate" className="text-sm font-medium">Taux TVA</Label>
              <select
                id="tva_rate"
                name="tva_rate"
                defaultValue="0.20"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                onChange={(e) => setTvaRate(e.target.value)}
              >
                <option value="0">0% (exonéré)</option>
                <option value="0.10">10%</option>
                <option value="0.20">20%</option>
              </select>
            </div>
          </div>

          {ttc !== null && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 rounded-md border border-border">
              <span className="text-sm text-muted-foreground">Total TTC estimé</span>
              <span className="text-base font-semibold text-foreground">
                {ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Création…" : "Créer la facture"}
          </Button>
          <Link href="/facturation">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
