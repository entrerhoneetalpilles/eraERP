import { notFound } from "next/navigation"
import { getUserById } from "@/lib/dal/admin"
import { EditUserForm } from "./edit-form"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)
  if (!user) notFound()
  return <EditUserForm user={user} />
}
