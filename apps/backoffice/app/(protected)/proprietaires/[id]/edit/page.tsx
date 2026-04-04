"use client"

import { useActionState } from "react"
import { use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateOwnerAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updateOwnerAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le propriétaire"
        actions={
          <Link href={`/proprietaires/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="INDIVIDUAL">Particulier</option>
            <option value="SCI">SCI</option>
            <option value="INDIVISION">Indivision</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet / Raison sociale</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && <p className="text-sm text-destructive">{state.error.nom[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
          {state?.error?.email && <p className="text-sm text-destructive">{state.error.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" name="telephone" />
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
          <input type="hidden" name="adresse.pays" value="France" />
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="rib_iban">IBAN</Label>
          <Input id="rib_iban" name="rib_iban" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes internes</Label>
          <textarea id="notes" name="notes" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <Button type="submit" disabled={isPending} className="">
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
