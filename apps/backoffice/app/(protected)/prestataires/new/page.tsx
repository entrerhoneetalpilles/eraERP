"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createPrestataireAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewPrestatairePage() {
  const [state, formAction, isPending] = useFormState(createPrestataireAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau prestataire"
        actions={
          <Link href="/prestataires">
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
            <Label htmlFor="nom" className="text-sm font-medium">Nom / Raison sociale</Label>
            <Input id="nom" name="nom" placeholder="Dupont Plomberie" className="h-10" />
            {state?.error?.nom && <p className="text-xs text-destructive">{state.error.nom[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metier" className="text-sm font-medium">Métier</Label>
            <Input id="metier" name="metier" placeholder="Plombier, Électricien, Femme de ménage…" className="h-10" />
            {state?.error?.metier && <p className="text-xs text-destructive">{state.error.metier[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret" className="text-sm font-medium">SIRET (14 chiffres)</Label>
            <Input id="siret" name="siret" placeholder="12345678901234" maxLength={14} className="h-10" />
            {state?.error?.siret && <p className="text-xs text-destructive">{state.error.siret[0]}</p>}
          </div>
        </div>

        {/* Section — Contact */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" name="email" type="email" placeholder="contact@prestataire.fr" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
              <Input id="telephone" name="telephone" placeholder="0612345678" className="h-10" />
            </div>
          </div>
        </div>

        {/* Section — Notes */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes internes</Label>
            <textarea
              id="notes" name="notes" rows={3}
              placeholder="Informations complémentaires…"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Créer le prestataire"}
          </Button>
          <Link href="/prestataires">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

