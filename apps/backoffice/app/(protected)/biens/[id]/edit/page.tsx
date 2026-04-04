"use client"

import { useActionState, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePropertyAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const updateAction = updatePropertyAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le bien"
        actions={
          <Link href={`/biens/${id}`}>
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
          <Input id="nom" name="nom" />
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
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <select id="statut" name="statut" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="TRAVAUX">Travaux</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="superficie">Superficie (m²)</Label>
            <Input id="superficie" name="superficie" type="number" min="0" step="0.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_chambres">Chambres</Label>
            <Input id="nb_chambres" name="nb_chambres" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacite_voyageurs">Capacité</Label>
            <Input id="capacite_voyageurs" name="capacite_voyageurs" type="number" min="1" />
          </div>
        </div>
        <fieldset className="border rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-foreground px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" />
            </div>
          </div>
        </fieldset>
        <Button type="submit" disabled={isPending} className="">
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
