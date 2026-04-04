"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPropertyAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPropertyPage() {
  const [state, formAction, isPending] = useActionState(createPropertyAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouveau bien"
        actions={
          <Link href="/biens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du bien</Label>
          <Input id="nom" name="nom" placeholder="Villa Les Alpilles" />
          {state?.error?.nom && <p className="text-sm text-destructive">{state.error.nom[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="VILLA">Villa</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="LOFT">Loft</option>
            <option value="CHALET">Chalet</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="superficie">Superficie (m²)</Label>
            <Input id="superficie" name="superficie" type="number" min="0" step="0.5" placeholder="120" />
            {state?.error?.superficie && <p className="text-sm text-destructive">{state.error.superficie[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_chambres">Chambres</Label>
            <Input id="nb_chambres" name="nb_chambres" type="number" min="0" placeholder="4" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacite_voyageurs">Capacité</Label>
            <Input id="capacite_voyageurs" name="capacite_voyageurs" type="number" min="1" placeholder="8" />
            {state?.error?.capacite_voyageurs && <p className="text-sm text-destructive">{state.error.capacite_voyageurs[0]}</p>}
          </div>
        </div>

        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" placeholder="Route des Baux" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" placeholder="13520" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" placeholder="Les Baux-de-Provence" />
            </div>
          </div>
        </fieldset>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer le bien"}
        </Button>
      </form>
    </div>
  )
}
