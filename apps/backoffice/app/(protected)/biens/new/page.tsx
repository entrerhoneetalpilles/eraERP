"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPropertyAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPropertyPage() {
  const [state, formAction, isPending] = useFormState(createPropertyAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau bien"
        actions={
          <Link href="/biens">
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
            <Label htmlFor="nom" className="text-sm font-medium">Nom du bien</Label>
            <Input id="nom" name="nom" placeholder="Villa Les Alpilles" className="h-10" />
            {state?.error?.nom && <p className="text-xs text-destructive">{state.error.nom[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Type</Label>
            <select
              id="type" name="type"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="VILLA">Villa</option>
              <option value="APPARTEMENT">Appartement</option>
              <option value="LOFT">Loft</option>
              <option value="CHALET">Chalet</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
        </div>

        {/* Section — Caractéristiques */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Caractéristiques</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="superficie" className="text-sm font-medium">Superficie (m²)</Label>
              <Input id="superficie" name="superficie" type="number" min="0" step="0.5" placeholder="120" className="h-10" />
              {state?.error?.superficie && <p className="text-xs text-destructive">{state.error.superficie[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nb_chambres" className="text-sm font-medium">Chambres</Label>
              <Input id="nb_chambres" name="nb_chambres" type="number" min="0" placeholder="4" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacite_voyageurs" className="text-sm font-medium">Capacité</Label>
              <Input id="capacite_voyageurs" name="capacite_voyageurs" type="number" min="1" placeholder="8" className="h-10" />
              {state?.error?.capacite_voyageurs && <p className="text-xs text-destructive">{state.error.capacite_voyageurs[0]}</p>}
            </div>
          </div>
        </div>

        {/* Section — Adresse */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Adresse</h2>

          <div className="space-y-2">
            <Label htmlFor="adresse.rue" className="text-sm font-medium">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" placeholder="Route des Baux" className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal" className="text-sm font-medium">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" placeholder="13520" maxLength={5} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville" className="text-sm font-medium">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" placeholder="Les Baux-de-Provence" className="h-10" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Créer le bien"}
          </Button>
          <Link href="/biens">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
