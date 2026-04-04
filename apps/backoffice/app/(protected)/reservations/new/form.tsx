"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createBookingAction } from "./actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  properties: { id: string; nom: string; mandate: { taux_honoraires: number } | null }[]
  guests: { id: string; prenom: string; nom: string }[]
}

const initialState = { error: null as any }

export function NewBookingForm({ properties, guests }: Props) {
  const [state, formAction, isPending] = useFormState(createBookingAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle réservation"
        actions={
          <Link href="/reservations">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Bien & voyageur */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Bien & voyageur</h2>

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

          <div className="space-y-2">
            <Label htmlFor="guest_id" className="text-sm font-medium">Voyageur</Label>
            <select
              id="guest_id" name="guest_id"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Sélectionner un voyageur…</option>
              {guests.map((g) => <option key={g.id} value={g.id}>{g.prenom} {g.nom}</option>)}
            </select>
            {state?.error?.guest_id && <p className="text-xs text-destructive">{state.error.guest_id[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium">Canal</Label>
            <select
              id="platform" name="platform"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="AIRBNB">Airbnb</option>
              <option value="DIRECT">Direct</option>
              <option value="MANUAL">Manuel</option>
            </select>
          </div>
        </div>

        {/* Section — Séjour */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Séjour</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in" className="text-sm font-medium">Arrivée</Label>
              <Input id="check_in" name="check_in" type="date" className="h-10" />
              {state?.error?.check_in && <p className="text-xs text-destructive">{state.error.check_in[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out" className="text-sm font-medium">Départ</Label>
              <Input id="check_out" name="check_out" type="date" className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nb_nuits" className="text-sm font-medium">Nuits</Label>
              <Input id="nb_nuits" name="nb_nuits" type="number" min="1" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nb_voyageurs" className="text-sm font-medium">Voyageurs</Label>
              <Input id="nb_voyageurs" name="nb_voyageurs" type="number" min="1" className="h-10" />
            </div>
          </div>
        </div>

        {/* Section — Finances */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Finances</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montant_total" className="text-sm font-medium">Montant total (€)</Label>
              <Input id="montant_total" name="montant_total" type="number" min="0" step="0.01" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frais_menage" className="text-sm font-medium">Frais ménage (€)</Label>
              <Input id="frais_menage" name="frais_menage" type="number" min="0" step="0.01" defaultValue="0" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_plateforme" className="text-sm font-medium">Commission (€)</Label>
              <Input id="commission_plateforme" name="commission_plateforme" type="number" min="0" step="0.01" defaultValue="0" className="h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenu_net_proprietaire" className="text-sm font-medium">Revenu net propriétaire (€)</Label>
            <Input id="revenu_net_proprietaire" name="revenu_net_proprietaire" type="number" min="0" step="0.01" className="h-10" />
            {state?.error?.revenu_net_proprietaire && <p className="text-xs text-destructive">{state.error.revenu_net_proprietaire[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes_internes" className="text-sm font-medium">Notes internes</Label>
            <textarea
              id="notes_internes" name="notes_internes" rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Créer la réservation"}
          </Button>
          <Link href="/reservations">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
