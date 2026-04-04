"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createUserAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewUserPage() {
  const [state, formAction, isPending] = useFormState(createUserAction, initialState)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel utilisateur"
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
            <Input id="nom" name="nom" placeholder="Jean Dupont" className="h-10" />
            {state?.error?.nom && <p className="text-xs text-destructive">{state.error.nom[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" name="email" type="email" placeholder="jean@conciergerie.fr" className="h-10" />
            {state?.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
          </div>
        </div>

        {/* Section — Accès */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Accès</h2>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">Rôle</Label>
            <select
              id="role" name="role" defaultValue="GESTIONNAIRE"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="ADMIN">Administrateur SI</option>
              <option value="DIRECTION">Direction</option>
              <option value="GESTIONNAIRE">Gestionnaire locatif</option>
              <option value="COMPTABLE">Comptable</option>
              <option value="TRAVAUX">Responsable travaux</option>
              <option value="SERVICES">Chargé de services</option>
            </select>
            {state?.error?.role && <p className="text-xs text-destructive">{state.error.role[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe provisoire</Label>
            <Input id="password" name="password" type="password" placeholder="minimum 8 caractères" className="h-10" />
            {state?.error?.password && <p className="text-xs text-destructive">{state.error.password[0]}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Création…" : "Créer l'utilisateur"}
          </Button>
          <Link href="/admin">
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
