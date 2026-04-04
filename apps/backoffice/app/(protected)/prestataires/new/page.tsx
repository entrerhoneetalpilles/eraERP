"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPrestataireAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPrestatairePage() {
  const [state, formAction, isPending] = useActionState(
    createPrestataireAction,
    initialState
  )

  return (
    <div>
      <PageHeader
        title="Nouveau prestataire"
        actions={
          <Link href="/prestataires">
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
          <Input id="nom" name="nom" placeholder="Dupont Plomberie" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="metier">Métier</Label>
          <Input id="metier" name="metier" placeholder="Plombier, Électricien, Femme de ménage…" />
          {state?.error?.metier && (
            <p className="text-sm text-destructive">{state.error.metier[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contact@prestataire.fr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" name="telephone" placeholder="0612345678" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret">SIRET (14 chiffres)</Label>
          <Input id="siret" name="siret" placeholder="12345678901234" maxLength={14} />
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
            placeholder="Informations complémentaires…"
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Créer le prestataire"}
        </Button>
      </form>
    </div>
  )
}
