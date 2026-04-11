import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerProperties } from "@/lib/dal/properties"
import { PropertyCard } from "@/components/biens/property-card"
import { Building2 } from "lucide-react"

export default async function BienListPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const properties = await getOwnerProperties(session.user.ownerId)

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">
          Mes biens.
        </h1>
        <p className="text-sm text-garrigue-400 mt-1">
          {properties.length} bien{properties.length > 1 ? "s" : ""} en gestion
        </p>
      </div>
      {properties.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <Building2 size={40} />
          <p className="text-sm">Aucun bien actif</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              nom={p.nom}
              adresse={p.adresse}
              tauxOccupation={p.tauxOccupation}
              prochaineresa={p.prochaineresa}
            />
          ))}
        </div>
      )}
    </div>
  )
}
