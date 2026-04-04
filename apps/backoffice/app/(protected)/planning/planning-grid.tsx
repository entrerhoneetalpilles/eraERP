"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@conciergerie/ui"

type BookingSlot = {
  id: string
  property_id: string
  property_nom: string
  guest_nom: string
  check_in: string   // ISO date string
  check_out: string  // ISO date string
  statut: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  CHECKEDIN: "bg-green-100 text-green-800 border-green-200",
  CHECKEDOUT: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function PlanningGrid({
  bookings,
  properties,
  year,
  month,
}: {
  bookings: BookingSlot[]
  properties: { id: string; nom: string }[]
  year: number
  month: number
}) {
  const router = useRouter()
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    router.push(`/planning?year=${y}&month=${m}`)
  }

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  const monthLabel = new Date(year, month, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="cursor-pointer"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground capitalize min-w-[160px] text-center">
          {monthLabel}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(1)}
          className="cursor-pointer"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="sticky left-0 bg-muted px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground w-40 min-w-[10rem]">
                Bien
              </th>
              {days.map((d) => {
                const isToday = todayYear === year && todayMonth === month && todayDate === d
                return (
                  <th
                    key={d}
                    className={`px-1 py-2 text-center text-xs font-medium w-8 min-w-[2rem] ${
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 1} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Aucun bien actif</p>
                </td>
              </tr>
            ) : (
              properties.map((prop) => {
                const propBookings = bookings.filter((b) => b.property_id === prop.id)
                return (
                  <tr key={prop.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors duration-100">
                    <td className="sticky left-0 bg-card hover:bg-accent border-r border-border px-3 py-2 text-sm truncate max-w-[10rem]">
                      <Link href={`/biens/${prop.id}`} className="font-medium text-foreground hover:text-primary cursor-pointer">
                        {prop.nom}
                      </Link>
                    </td>
                    {days.map((d) => {
                      const cellDate = new Date(year, month, d)
                      const booking = propBookings.find((b) => {
                        const ci = new Date(b.check_in)
                        const co = new Date(b.check_out)
                        return cellDate >= ci && cellDate < co
                      })
                      // Show guest name on first VISIBLE day (either check-in day or day 1 if carry-over)
                      const firstVisibleDay = booking
                        ? Math.max(1, new Date(booking.check_in).getMonth() === month && new Date(booking.check_in).getFullYear() === year
                            ? new Date(booking.check_in).getDate()
                            : 1)
                        : null
                      const showName = booking ? d === firstVisibleDay : false
                      return (
                        <td key={d} className="px-0.5 py-1 text-center align-middle">
                          {booking ? (
                            <Link href={`/reservations/${booking.id}`} className="cursor-pointer">
                              <span
                                className={`block rounded-sm px-0.5 py-0.5 border text-[10px] leading-tight truncate ${
                                  STATUS_COLORS[booking.statut] ?? "bg-gray-100"
                                }`}
                                title={`${booking.guest_nom} — ${booking.statut}`}
                              >
                                {showName ? booking.guest_nom.split(" ")[0] : "·"}
                              </span>
                            </Link>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
