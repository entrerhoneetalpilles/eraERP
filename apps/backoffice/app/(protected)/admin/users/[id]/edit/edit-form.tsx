"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updateUserAction } from "../actions"
import { ArrowLeft } from "lucide-react"

interface Props {
  user: {
    id: string
    nom: string
    actif: boolean
  }
}

export function EditUserForm({ user }: Props) {
  const updateAction = updateUserAction.bind(null, user.id)
  const [state, formAction, isPending] = useFormState(updateAction, null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier l'utilisateur"
        actions={
          <Link href="/admin">
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
            <Label htmlFor="nom" className="text-sm font-medium">Nom complet</Label>
            <Input id="nom" name="nom" defaultValue={user.nom} className="h-10" />
            {state?.error?.nom && <p className="text-xs text-destructive">{state.error.nom[0]}</p>}
          </div>
        </div>

        {/* Section — Statut */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Statut du compte</h2>

          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="true" defaultChecked={user.actif} className="cursor-pointer" />
              <span className="text-foreground">Actif</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="actif" value="false" defaultChecked={!user.actif} className="cursor-pointer" />
              <span className="text-foreground">Inactif</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Link href="/admin">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
