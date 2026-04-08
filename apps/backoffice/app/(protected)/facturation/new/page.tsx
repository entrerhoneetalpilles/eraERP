import { getOwners } from "@/lib/dal/owners"
import { NewFactureForm } from "./form"

export default async function NewFacturePage() {
  const owners = await getOwners()
  const ownerList = owners.map((o) => ({ id: o.id, nom: o.nom, email: o.email }))

  return <NewFactureForm owners={ownerList} nextNumber="" />
}
