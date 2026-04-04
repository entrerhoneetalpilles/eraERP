"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createOwnerAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewOwnerPage() {
  const [state, formAction, isPending] = useActionState(
    createOwnerAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouveau propriétaire"
        actions={
          <Link href="/proprietaires">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl space-y-6">
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type de propriétaire</Label>
          <select
            id="type"
            name="type"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="INDIVIDUAL"
          >
            <option value="INDIVIDUAL">Particulier</option>
            <option value="SCI">SCI</option>
            <option value="INDIVISION">Indivision</option>
          </select>
          {state?.error?.type && (
            <p className="text-sm text-destructive">{state.error.type[0]}</p>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet / Raison sociale</Label>
          <Input id="nom" name="nom" placeholder="Jean Dupont" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jean@exemple.fr" />
          {state?.error?.email && (
            <p className="text-sm text-destructive">{state.error.email[0]}</p>
          )}
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" name="telephone" placeholder="0612345678" />
        </div>

        {/* Adresse */}
        <fieldset className="border border-garrigue-100 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-garrigue-700 px-1">Adresse</legend>
          <div className="space-y-2">
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" placeholder="12 rue de la Paix" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" placeholder="13001" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" placeholder="Marseille" />
            </div>
          </div>
          <input type="hidden" name="adresse.pays" value="France" />
        </fieldset>

        {/* IBAN */}
        <div className="space-y-2">
          <Label htmlFor="rib_iban">IBAN (pour reversements)</Label>
          <Input id="rib_iban" name="rib_iban" placeholder="FR76 xxxx xxxx xxxx xxxx xxxx xxx" />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes internes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Informations complémentaires..."
          />
        </div>

        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement..." : "Créer le propriétaire"}
        </Button>
      </form>
    </div>
  )
}
