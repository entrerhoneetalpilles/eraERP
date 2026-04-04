"use client"

import { use } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateUserAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const updateAction = updateUserAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <div>
      <PageHeader
        title="Modifier l'utilisateur"
        actions={
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet</Label>
          <Input id="nom" name="nom" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Statut du compte</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="true" defaultChecked />
              <span>Actif</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="false" />
              <span>Inactif</span>
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
