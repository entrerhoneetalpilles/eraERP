import { notFound } from "next/navigation"
import { getPropertyById } from "@/lib/dal/properties"
import { PropertyAccessForm } from "./access-form"

export default async function PropertyAccessPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()
  return <PropertyAccessForm id={params.id} access={property.access} />
}
