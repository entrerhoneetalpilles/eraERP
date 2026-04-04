"use client"

import { useFormState } from "react-dom"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePropertyAccessAction } from "../actions"
import { ArrowLeft } from "lucide-react"

interface AccessData {
  type_acces: string | null
  code_acces: string | null
  instructions_arrivee: string | null
  wifi_nom: string | null
  wifi_mdp: string | null
  notes_depart: string | null
}

interface Props {
  id: string
  access: AccessData | null
}

export function PropertyAccessForm({ id, access }: Props) {
  const accessAction = updatePropertyAccessAction.bind(null, id)
  const [, formAction, isPending] = useFormState(accessAction, null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Informations d'accès"
        actions={
          <Link href={`/biens/${id}`}>
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <form action={formAction} className="max-w-2xl bg-card rounded-md border border-border overflow-hidden">
        {/* Section — Accès */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Accès</h2>

          <div className="space-y-2">
            <Label htmlFor="type_acces" className="text-sm font-medium">Type d'accès</Label>
            <select
              id="type_acces" name="type_acces" defaultValue={access?.type_acces ?? "CODE"}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="CODE">Code d'accès</option>
              <option value="BOITE_CLES">Boîte à clés</option>
              <option value="SERRURE_CONNECTEE">Serrure connectée</option>
              <option value="AGENT">Agent sur place</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code_acces" className="text-sm font-medium">Code / Combinaison</Label>
            <Input id="code_acces" name="code_acces" placeholder="ex: 1234A" defaultValue={access?.code_acces ?? ""} className="h-10" />
          </div>
        </div>

        {/* Section — Instructions */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Instructions</h2>

          <div className="space-y-2">
            <Label htmlFor="instructions_arrivee" className="text-sm font-medium">Instructions d'arrivée</Label>
            <textarea
              id="instructions_arrivee" name="instructions_arrivee" rows={4}
              placeholder="Envoyées automatiquement au voyageur J-1 avant check-in…"
              defaultValue={access?.instructions_arrivee ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes_depart" className="text-sm font-medium">Instructions de départ</Label>
            <textarea
              id="notes_depart" name="notes_depart" rows={3}
              placeholder="Poubelles, volets, etc."
              defaultValue={access?.notes_depart ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Section — WiFi */}
        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">WiFi</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wifi_nom" className="text-sm font-medium">Réseau WiFi</Label>
              <Input id="wifi_nom" name="wifi_nom" placeholder="NomDuReseau" defaultValue={access?.wifi_nom ?? ""} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi_mdp" className="text-sm font-medium">Mot de passe WiFi</Label>
              <Input id="wifi_mdp" name="wifi_mdp" placeholder="MotDePasse" defaultValue={access?.wifi_mdp ?? ""} className="h-10" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center gap-3">
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Link href={`/biens/${id}`}>
            <Button type="button" variant="ghost" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
