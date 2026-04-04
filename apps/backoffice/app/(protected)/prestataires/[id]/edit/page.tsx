import { notFound } from "next/navigation"
import { getPrestataireById } from "@/lib/dal/prestataires"
import { EditPrestataireForm } from "./edit-form"

export default async function EditPrestatairePage({ params }: { params: { id: string } }) {
  const prestataire = await getPrestataireById(params.id)
  if (!prestataire) notFound()
  return <EditPrestataireForm prestataire={prestataire} />
}
