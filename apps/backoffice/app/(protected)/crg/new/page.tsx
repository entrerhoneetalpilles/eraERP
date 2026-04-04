import { db } from "@conciergerie/db"
import { CrgForm } from "./crg-form"

export default async function NewCrgPage() {
  const owners = await db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Générer un CRG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calcule automatiquement revenus, honoraires et charges sur la période.
        </p>
      </div>
      <CrgForm owners={owners} />
    </div>
  )
}
