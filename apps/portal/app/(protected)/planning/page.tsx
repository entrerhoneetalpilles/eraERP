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
      <div className="mb-6">
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Planning.</h1>
        <p className="text-sm text-garrigue-400 mt-1">Calendrier de vos biens</p>
      </div>
      <div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-4 overflow-hidden">
        <CalendarPortal bookings={bookings} cleanings={cleanings} blockedDates={blockedDates} />
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {[
          { color: "bg-blue-500", label: "Réservation confirmée" },
          { color: "bg-amber-400", label: "En attente" },
          { color: "bg-sky-300", label: "Ménage" },
          { color: "bg-gray-400", label: "Période bloquée" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-garrigue-500">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
