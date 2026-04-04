"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createWorkOrderAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewTravauxPage() {
  const [state, formAction, isPending] = useFormState(createWorkOrderAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel ordre de travaux"
        actions={
          <Link href="/travaux">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Identification */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identification</h2>

          <div className="space-y-2">
            <Label htmlFor="property_id" className="text-sm font-medium">ID du bien</Label>
            <Input id="property_id" name="property_id" placeholder="cuid du bien" className="h-10" />
            {state?.error?.property_id && <p className="text-xs text-destructive">{state.error.property_id[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="titre" className="text-sm font-medium">Titre</Label>
            <Input id="titre" name="titre" placeholder="Fuite robinet cuisine" className="h-10" />
            {state?.error?.titre && <p className="text-xs text-destructive">{state.error.titre[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <textarea
              id="description" name="description" rows={4}
              placeholder="Décrivez le problème en détail…"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {state?.error?.description && <p className="text-xs text-destructive">{state.error.description[0]}</p>}
          </div>
        </div>

        {/* Section — Qualification */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Qualification</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Type de travaux</Label>
              <Input id="type" name="type" placeholder="Plomberie, Électricité…" className="h-10" />
              {state?.error?.type && <p className="text-xs text-destructive">{state.error.type[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgence" className="text-sm font-medium">Urgence</Label>
              <select
                id="urgence" name="urgence" defaultValue="NORMALE"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="NORMALE">Normale</option>
                <option value="URGENTE">Urgente</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imputable_a" className="text-sm font-medium">Imputation</Label>
            <select
              id="imputable_a" name="imputable_a" defaultValue="PROPRIETAIRE"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="PROPRIETAIRE">Propriétaire</option>
              <option value="SOCIETE">Société</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractor_id" className="text-sm font-medium">ID Prestataire (optionnel)</Label>
            <Input id="contractor_id" name="contractor_id" placeholder="cuid du prestataire" className="h-10" />
          </div>
        </div>

        {/* Section — Notes */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes internes</Label>
            <textarea
              id="notes" name="notes" rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Création…" : "Créer l'ordre de travaux"}
          </Button>
          <Link href="/travaux">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
