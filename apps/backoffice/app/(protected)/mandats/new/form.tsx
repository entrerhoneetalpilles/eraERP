"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createMandateAction } from "./actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  owners: { id: string; nom: string }[]
  properties: { id: string; nom: string }[]
  nextNumber: string
  defaultOwnerId?: string
}

const initialState = { error: null as any }

export function NewMandateForm({ owners, properties, nextNumber, defaultOwnerId }: Props) {
  const [state, formAction, isPending] = useActionState(createMandateAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouveau mandat"
        actions={
          <Link href="/mandats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="numero_mandat">Numéro de mandat</Label>
          <Input id="numero_mandat" name="numero_mandat" defaultValue={nextNumber} />
          {state?.error?.numero_mandat && (
            <p className="text-sm text-destructive">{state.error.numero_mandat[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_id">Propriétaire</Label>
          <select
            id="owner_id"
            name="owner_id"
            defaultValue={defaultOwnerId ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sélectionner un propriétaire…</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom}
              </option>
            ))}
          </select>
          {state?.error?.owner_id && (
            <p className="text-sm text-destructive">{state.error.owner_id[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">Bien</Label>
          <select
            id="property_id"
            name="property_id"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sélectionner un bien…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
          {state?.error?.property_id && (
            <p className="text-sm text-destructive">{state.error.property_id[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_debut">Date de début</Label>
            <Input id="date_debut" name="date_debut" type="date" />
            {state?.error?.date_debut && (
              <p className="text-sm text-destructive">{state.error.date_debut[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_fin">Date de fin (optionnel)</Label>
            <Input id="date_fin" name="date_fin" type="date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taux_honoraires">Taux honoraires gestion (%)</Label>
            <Input
              id="taux_honoraires"
              name="taux_honoraires"
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="15"
            />
            {state?.error?.taux_honoraires && (
              <p className="text-sm text-destructive">{state.error.taux_honoraires[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="seuil_validation_devis">Seuil validation devis (€)</Label>
            <Input
              id="seuil_validation_devis"
              name="seuil_validation_devis"
              type="number"
              min="0"
              defaultValue="500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taux_horaire_ht">Taux horaire HT (€/h — optionnel)</Label>
          <Input
            id="taux_horaire_ht"
            name="taux_horaire_ht"
            type="number"
            min="0"
            step="0.5"
            placeholder="50"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="reconduction_tacite"
            name="reconduction_tacite"
            type="checkbox"
            value="true"
            defaultChecked
            className="w-4 h-4"
          />
          <Label htmlFor="reconduction_tacite">Reconduction tacite</Label>
        </div>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer le mandat"}
        </Button>
      </form>
    </div>
  )
}
