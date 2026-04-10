import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerPlanningEvents } from "@/lib/dal/planning"
import { CalendarPortal } from "@/components/planning/calendar-portal"

export default async function PlanningPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  const { bookings, cleanings, blockedDates } = await getOwnerPlanningEvents(
    session.user.ownerId,
    from,
    to
  )

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-garrigue-900">Planning</h1>
      <CalendarPortal bookings={bookings} cleanings={cleanings} blockedDates={blockedDates} />
    </div>
  )
}
