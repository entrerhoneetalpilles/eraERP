"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createWorkOrderAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewTravauxPage() {
  const [state, formAction, isPending] = useActionState(
    createWorkOrderAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouvel ordre de travaux"
        actions={
          <Link href="/travaux">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="property_id">ID du bien</Label>
          <Input id="property_id" name="property_id" placeholder="cuid du bien" />
          {state?.error?.property_id && (
            <p className="text-sm text-destructive">{state.error.property_id[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titre">Titre</Label>
          <Input id="titre" name="titre" placeholder="Fuite robinet cuisine" />
          {state?.error?.titre && (
            <p className="text-sm text-destructive">{state.error.titre[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Décrivez le problème en détail…"
          />
          {state?.error?.description && (
            <p className="text-sm text-destructive">{state.error.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de travaux</Label>
            <Input id="type" name="type" placeholder="Plomberie, Électricité…" />
            {state?.error?.type && (
              <p className="text-sm text-destructive">{state.error.type[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgence">Urgence</Label>
            <select
              id="urgence"
              name="urgence"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="NORMALE"
            >
              <option value="NORMALE">Normale</option>
              <option value="URGENTE">Urgente</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imputable_a">Imputation</Label>
          <select
            id="imputable_a"
            name="imputable_a"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="PROPRIETAIRE"
          >
            <option value="PROPRIETAIRE">Propriétaire</option>
            <option value="SOCIETE">Société</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor_id">ID Prestataire (optionnel)</Label>
          <Input id="contractor_id" name="contractor_id" placeholder="cuid du prestataire" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer l'ordre de travaux"}
        </Button>
      </form>
    </div>
  )
}
