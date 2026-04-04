"use client"

import { updateMandateStatutAction } from "./actions"
import { Button } from "@conciergerie/ui"

interface Props {
  id: string
  statut: string
}

export function SuspendMandateButton({ id, statut }: Props) {
  if (statut === "RESILIE") return null

  const action = updateMandateStatutAction.bind(null, id)

  return (
    <form action={action}>
      <input type="hidden" name="statut" value={statut === "ACTIF" ? "SUSPENDU" : "ACTIF"} />
      <Button type="submit" variant="outline" size="sm" className="cursor-pointer">
        {statut === "ACTIF" ? "Suspendre" : "Réactiver"}
      </Button>
    </form>
  )
}
