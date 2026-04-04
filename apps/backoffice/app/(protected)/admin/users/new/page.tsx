"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { createUserAction } from "./actions"
import { ArrowLeft } from "lucide-react"

const initialState = { error: null as any }

export default function NewUserPage() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState)

  return (
    <div>
      <PageHeader
        title="Nouvel utilisateur"
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
          <Input id="nom" name="nom" placeholder="Jean Dupont" />
          {state?.error?.nom && (
            <p className="text-sm text-destructive">{state.error.nom[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jean@conciergerie.fr" />
          {state?.error?.email && (
            <p className="text-sm text-destructive">{state.error.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="GESTIONNAIRE"
          >
            <option value="ADMIN">Administrateur SI</option>
            <option value="DIRECTION">Direction</option>
            <option value="GESTIONNAIRE">Gestionnaire locatif</option>
            <option value="COMPTABLE">Comptable</option>
            <option value="TRAVAUX">Responsable travaux</option>
            <option value="SERVICES">Chargé de services</option>
          </select>
          {state?.error?.role && (
            <p className="text-sm text-destructive">{state.error.role[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe provisoire</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="minimum 8 caractères"
          />
          {state?.error?.password && (
            <p className="text-sm text-destructive">{state.error.password[0]}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer l'utilisateur"}
        </Button>
      </form>
    </div>
  )
}
