import { getOwners } from "@/lib/dal/owners"
import { getProperties } from "@/lib/dal/properties"
import { getNextMandateNumber } from "@/lib/dal/mandates"
import { NewMandateForm } from "./form"

export default async function NewMandatePage({
  searchParams,
}: {
  searchParams: { owner?: string }
}) {
  const [owners, properties, nextNumber] = await Promise.all([
    getOwners(),
    getProperties(),
    getNextMandateNumber(),
  ])

  // Filtrer les biens sans mandat actif
  const availableProperties = properties.filter((p) => !p.mandate)

  return (
    <NewMandateForm
      owners={owners}
      properties={availableProperties}
      nextNumber={nextNumber}
      defaultOwnerId={searchParams.owner}
    />
  )
}
