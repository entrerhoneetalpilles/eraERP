"use client"

import { useFormState } from "react-dom"
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
  const [state, formAction, isPending] = useFormState(createMandateAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau mandat"
        actions={
          <Link href="/mandats">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Numérotation */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Numérotation</h2>

          <div className="space-y-2">
            <Label htmlFor="numero_mandat" className="text-sm font-medium">Numéro de mandat</Label>
            <Input id="numero_mandat" name="numero_mandat" defaultValue={nextNumber} className="h-10" />
            {state?.error?.numero_mandat && <p className="text-xs text-destructive">{state.error.numero_mandat[0]}</p>}
          </div>
        </div>

        {/* Section — Parties */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Parties</h2>

          <div className="space-y-2">
            <Label htmlFor="owner_id" className="text-sm font-medium">Propriétaire</Label>
            <select
              id="owner_id" name="owner_id" defaultValue={defaultOwnerId ?? ""}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Sélectionner un propriétaire…</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
            </select>
            {state?.error?.owner_id && <p className="text-xs text-destructive">{state.error.owner_id[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_id" className="text-sm font-medium">Bien</Label>
            <select
              id="property_id" name="property_id"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Sélectionner un bien…</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            {state?.error?.property_id && <p className="text-xs text-destructive">{state.error.property_id[0]}</p>}
          </div>
        </div>

        {/* Section — Période */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Période</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_debut" className="text-sm font-medium">Date de début</Label>
              <Input id="date_debut" name="date_debut" type="date" className="h-10" />
              {state?.error?.date_debut && <p className="text-xs text-destructive">{state.error.date_debut[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_fin" className="text-sm font-medium">Date de fin (optionnel)</Label>
              <Input id="date_fin" name="date_fin" type="date" className="h-10" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              id="reconduction_tacite" name="reconduction_tacite" type="checkbox"
              value="true" defaultChecked className="w-4 h-4 cursor-pointer"
            />
            <Label htmlFor="reconduction_tacite" className="text-sm font-medium cursor-pointer">Reconduction tacite</Label>
          </div>
        </div>

        {/* Section — Conditions financières */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Conditions financières</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taux_honoraires" className="text-sm font-medium">Taux honoraires gestion (%)</Label>
              <Input id="taux_honoraires" name="taux_honoraires" type="number" min="0" max="100" step="0.5" placeholder="15" className="h-10" />
              {state?.error?.taux_honoraires && <p className="text-xs text-destructive">{state.error.taux_honoraires[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="honoraires_location" className="text-sm font-medium">Honoraires location (% — optionnel)</Label>
              <Input id="honoraires_location" name="honoraires_location" type="number" min="0" max="100" step="0.5" placeholder="50" className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taux_horaire_ht" className="text-sm font-medium">Taux horaire HT (€/h — optionnel)</Label>
              <Input id="taux_horaire_ht" name="taux_horaire_ht" type="number" min="0" step="0.5" placeholder="50" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seuil_validation_devis" className="text-sm font-medium">Seuil validation devis (€)</Label>
              <Input id="seuil_validation_devis" name="seuil_validation_devis" type="number" min="0" defaultValue="500" className="h-10" />
            </div>
          </div>
        </div>

        {/* Section — Prestations incluses */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Prestations incluses</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Ménage",
              "Accueil voyageurs",
              "Remise des clés",
              "Gestion des urgences",
              "Maintenance",
              "Communication voyageurs",
              "Gestion plateformes",
              "Conciergerie 24/7",
              "Blanchisserie",
              "Réapprovisionnement",
            ].map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" name="prestations_incluses" value={p} className="w-4 h-4 cursor-pointer" />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Créer le mandat"}
          </Button>
          <Link href="/mandats">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

