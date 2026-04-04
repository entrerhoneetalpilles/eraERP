"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createFactureAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewFacturePage() {
  const [state, formAction, isPending] = useActionState(createFactureAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvelle facture d'honoraires"
        actions={
          <Link href="/facturation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="owner_id">ID Propriétaire</Label>
          <Input id="owner_id" name="owner_id" placeholder="cuid du propriétaire" />
          {state?.error?.owner_id && (
            <p className="text-sm text-destructive">{state.error.owner_id[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="periode_debut">Début de période</Label>
            <Input id="periode_debut" name="periode_debut" type="date" />
            {state?.error?.periode_debut && (
              <p className="text-sm text-destructive">{state.error.periode_debut[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="periode_fin">Fin de période</Label>
            <Input id="periode_fin" name="periode_fin" type="date" />
            {state?.error?.periode_fin && (
              <p className="text-sm text-destructive">{state.error.periode_fin[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="montant_ht">Montant HT (€)</Label>
            <Input id="montant_ht" name="montant_ht" type="number" step="0.01" placeholder="350.00" />
            {state?.error?.montant_ht && (
              <p className="text-sm text-destructive">{state.error.montant_ht[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tva_rate">Taux TVA</Label>
            <select
              id="tva_rate"
              name="tva_rate"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="0.20"
            >
              <option value="0">0% (exonéré)</option>
              <option value="0.10">10%</option>
              <option value="0.20">20%</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer la facture"}
        </Button>
      </form>
    </div>
  )
}
