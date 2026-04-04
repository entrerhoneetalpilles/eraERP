import { notFound } from "next/navigation"
import { getPropertyById } from "@/lib/dal/properties"
import { EditPropertyForm } from "./edit-form"

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()
  return <EditPropertyForm property={property} />
}
