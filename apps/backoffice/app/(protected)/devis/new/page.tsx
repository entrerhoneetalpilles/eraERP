import { db } from "@conciergerie/db"
import { PageHeader } from "@/components/ui/page-header"
import { NewDevisForm } from "./form"

export default async function NewDevisPage() {
  const [properties, contractors] = await Promise.all([
    db.property.findMany({
      where: { statut: "ACTIF", mandate: { isNot: null } },
      select: {
        id: true,
        nom: true,
        mandate: {
          select: {
            seuil_validation_devis: true,
            owner: { select: { nom: true } },
          },
        },
      },
      orderBy: { nom: "asc" },
    }),
    db.contractor.findMany({
      where: { actif: true },
      select: { id: true, nom: true, metier: true },
      orderBy: { nom: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nouveau devis" description="Établir un devis pour un propriétaire" />
      <NewDevisForm properties={properties} contractors={contractors} />
    </div>
  )
}
