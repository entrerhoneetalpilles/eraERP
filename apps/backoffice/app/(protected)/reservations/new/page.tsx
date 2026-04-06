import { getProperties } from "@/lib/dal/properties"
import { getGuests } from "@/lib/dal/guests"
import { NewBookingForm } from "./form"

export default async function NewReservationPage() {
  const [properties, guests] = await Promise.all([getProperties(), getGuests()])
  const activeProperties = properties.filter((p) => p.statut === "ACTIF")
  return <NewBookingForm properties={activeProperties} guests={guests} />
}

