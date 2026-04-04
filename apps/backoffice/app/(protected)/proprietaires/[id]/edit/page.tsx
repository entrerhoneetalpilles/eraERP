import { notFound } from "next/navigation"
import { getOwnerById } from "@/lib/dal/owners"
import { EditOwnerForm } from "./edit-form"

export default async function EditOwnerPage({ params }: { params: { id: string } }) {
  const owner = await getOwnerById(params.id)
  if (!owner) notFound()
  return <EditOwnerForm owner={owner} />
}
