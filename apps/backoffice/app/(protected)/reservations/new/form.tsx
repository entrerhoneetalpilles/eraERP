"use client"

import { useActionState } from "react"
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
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvelle réservation"
        actions={
          <Link href="/reservations">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="property_id">Bien</Label>
          <select id="property_id" name="property_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un bien…</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {state?.error?.property_id && <p className="text-sm text-destructive">{state.error.property_id[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest_id">Voyageur</Label>
          <select id="guest_id" name="guest_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un voyageur…</option>
            {guests.map((g) => <option key={g.id} value={g.id}>{g.prenom} {g.nom}</option>)}
          </select>
          {state?.error?.guest_id && <p className="text-sm text-destructive">{state.error.guest_id[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Canal</Label>
          <select id="platform" name="platform" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="AIRBNB">Airbnb</option>
            <option value="DIRECT">Direct</option>
            <option value="MANUAL">Manuel</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check_in">Arrivée</Label>
            <Input id="check_in" name="check_in" type="date" />
            {state?.error?.check_in && <p className="text-sm text-destructive">{state.error.check_in[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out">Départ</Label>
            <Input id="check_out" name="check_out" type="date" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nb_nuits">Nuits</Label>
            <Input id="nb_nuits" name="nb_nuits" type="number" min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb_voyageurs">Voyageurs</Label>
            <Input id="nb_voyageurs" name="nb_voyageurs" type="number" min="1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="montant_total">Montant total (€)</Label>
            <Input id="montant_total" name="montant_total" type="number" min="0" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frais_menage">Frais ménage (€)</Label>
            <Input id="frais_menage" name="frais_menage" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission_plateforme">Commission (€)</Label>
            <Input id="commission_plateforme" name="commission_plateforme" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="revenu_net_proprietaire">Revenu net propriétaire (€)</Label>
          <Input id="revenu_net_proprietaire" name="revenu_net_proprietaire" type="number" min="0" step="0.01" />
          {state?.error?.revenu_net_proprietaire && <p className="text-sm text-destructive">{state.error.revenu_net_proprietaire[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes_internes">Notes internes</Label>
          <textarea id="notes_internes" name="notes_internes" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Créer la réservation"}
        </Button>
      </form>
    </div>
  )
}
