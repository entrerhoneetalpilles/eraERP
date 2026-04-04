"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateOwnerAction } from "../actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  owner: {
    id: string
    nom: string
    email: string
    telephone: string | null
    type: string
    adresse: unknown
    rib_iban: string | null
    notes: string | null
  }
}

export function EditOwnerForm({ owner }: Props) {
  const updateAction = updateOwnerAction.bind(null, owner.id)
  const [state, formAction, isPending] = useFormState(updateAction, null)
  const adresse = owner.adresse as Record<string, string> | null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier le propriétaire"
        actions={
          <Link href={`/proprietaires/${owner.id}`}>
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Identité */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identité</h2>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Type de propriétaire</Label>
            <select
              id="type" name="type" defaultValue={owner.type}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="INDIVIDUAL">Particulier</option>
              <option value="SCI">SCI</option>
              <option value="INDIVISION">Indivision</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">Nom complet / Raison sociale</Label>
            <Input id="nom" name="nom" defaultValue={owner.nom} className="h-10" />
            {state?.error?.nom && <p className="text-xs text-destructive">{state.error.nom[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={owner.email} className="h-10" />
              {state?.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
              <Input id="telephone" name="telephone" defaultValue={owner.telephone ?? ""} className="h-10" />
            </div>
          </div>
        </div>

        {/* Section — Adresse */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Adresse</h2>

          <div className="space-y-2">
            <Label htmlFor="adresse.rue" className="text-sm font-medium">Rue</Label>
            <Input id="adresse.rue" name="adresse.rue" defaultValue={adresse?.rue ?? ""} className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse.code_postal" className="text-sm font-medium">Code postal</Label>
              <Input id="adresse.code_postal" name="adresse.code_postal" defaultValue={adresse?.code_postal ?? ""} maxLength={5} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse.ville" className="text-sm font-medium">Ville</Label>
              <Input id="adresse.ville" name="adresse.ville" defaultValue={adresse?.ville ?? ""} className="h-10" />
            </div>
          </div>
          <input type="hidden" name="adresse.pays" value="France" />
        </div>

        {/* Section — Financier */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Informations financières</h2>

          <div className="space-y-2">
            <Label htmlFor="rib_iban" className="text-sm font-medium">IBAN (pour reversements)</Label>
            <Input id="rib_iban" name="rib_iban" defaultValue={owner.rib_iban ?? ""} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes internes</Label>
            <textarea
              id="notes" name="notes" rows={3}
              defaultValue={owner.notes ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Link href={`/proprietaires/${owner.id}`}>
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
