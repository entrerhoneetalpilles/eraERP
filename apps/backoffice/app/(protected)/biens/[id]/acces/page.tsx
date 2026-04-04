"use client"

import { useActionState, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { updatePropertyAccessAction } from "../actions"
import { ArrowLeft } from "lucide-react"

export default function PropertyAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const accessAction = updatePropertyAccessAction.bind(null, id)
  const [, formAction, isPending] = useActionState(accessAction, null)

  return (
    <div>
      <PageHeader
        title="Informations d'accès"
        actions={
          <Link href={`/biens/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />
      <form action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type_acces">Type d'accès</Label>
          <select id="type_acces" name="type_acces" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="CODE">Code d'accès</option>
            <option value="BOITE_CLES">Boîte à clés</option>
            <option value="SERRURE_CONNECTEE">Serrure connectée</option>
            <option value="AGENT">Agent sur place</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="code_acces">Code / Combinaison</Label>
          <Input id="code_acces" name="code_acces" placeholder="ex: 1234A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructions_arrivee">Instructions d'arrivée</Label>
          <textarea
            id="instructions_arrivee"
            name="instructions_arrivee"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Envoyées automatiquement au voyageur J-1 avant check-in…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wifi_nom">Réseau WiFi</Label>
            <Input id="wifi_nom" name="wifi_nom" placeholder="NomDuReseau" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wifi_mdp">Mot de passe WiFi</Label>
            <Input id="wifi_mdp" name="wifi_mdp" placeholder="MotDePasse" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes_depart">Instructions de départ</Label>
          <textarea
            id="notes_depart"
            name="notes_depart"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Poubelles, volets, etc."
          />
        </div>
        <Button type="submit" disabled={isPending} className="bg-olivier-500 hover:bg-olivier-600">
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
