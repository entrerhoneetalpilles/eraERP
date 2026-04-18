import { db } from "@conciergerie/db"
import { CrgForm } from "./crg-form"

export default async function NewCrgPage() {
  const owners = await db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Générer un CRG</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Récapitulatif des séjours, honoraires facturés et charges travaux. Les loyers sont perçus directement par le propriétaire via Airbnb/plateformes.
        </p>
      </div>
      <CrgForm owners={owners} />
    </div>
  )
}

