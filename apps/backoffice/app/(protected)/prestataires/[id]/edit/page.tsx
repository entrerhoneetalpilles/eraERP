"use client"

import { use } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePrestataireAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditPrestatairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updatePrestataireAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier le prestataire"
        actions={
          <Link href={`/prestataires/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom / Raison sociale</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="metier">Métier</Label>
          <Input id="metier" name="metier" />
          {state?.error?.metier && (
            <p className="text-sm text-destructive">{state.error.metier[0]}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" name="telephone" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input id="siret" name="siret" maxLength={14} />
          {state?.error?.siret && (
            <p className="text-sm text-destructive">{state.error.siret[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
