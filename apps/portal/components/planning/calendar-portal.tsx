"use client"

import { useMemo, useState, useCallback } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, differenceInCalendarDays } from "date-fns"
import { fr } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { EventDetailModal, type EventMeta } from "./event-detail-modal"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const BOOKING_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  CHECKEDIN: "#3b82f6",
  CHECKEDOUT: "#9ca3af",
}

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  meta: EventMeta
}

interface PortalBooking {
  id: string
  check_in: Date | string
  check_out: Date | string
  nb_nuits: number
  statut: string
  property: { nom: string }
  guest: { prenom: string; nom: string }
}

interface PortalCleaning {
  id: string
  date_prevue: Date | string
  property: { nom: string }
}

interface PortalBlockedDate {
  id: string
  date_debut: Date | string
  date_fin: Date | string
  notes: string | null
  property: { nom: string }
}

interface CalendarPortalProps {
  bookings: PortalBooking[]
  cleanings: PortalCleaning[]
  blockedDates: PortalBlockedDate[]
}

export function CalendarPortal({ bookings, cleanings, blockedDates }: CalendarPortalProps) {
  const [selectedMeta, setSelectedMeta] = useState<EventMeta | null>(null)

  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = []
    for (const b of bookings) {
      const checkIn = new Date(b.check_in)
      const checkOut = new Date(b.check_out)
      result.push({
        id: b.id,
        title: `${b.guest.prenom} ${b.guest.nom} — ${b.property.nom}`,
        start: checkIn,
        end: checkOut,
        color: BOOKING_COLORS[String(b.statut)] ?? "#3b82f6",
        meta: {
          type: "booking",
          guestName: `${b.guest.prenom} ${b.guest.nom}`,
          propertyName: b.property.nom,
          statut: String(b.statut),
          checkIn,
          checkOut,
          nbNuits: b.nb_nuits > 0 ? b.nb_nuits : Math.max(1, differenceInCalendarDays(checkOut, checkIn)),
        },
      })
    }
    for (const c of cleanings) {
      const start = new Date(c.date_prevue)
      const end = new Date(start)
      end.setHours(end.getHours() + 3)
      result.push({
        id: c.id,
        title: `Ménage — ${c.property.nom}`,
        start,
        end,
        color: "#7dd3fc",
        meta: { type: "cleaning", propertyName: c.property.nom, date: start },
      })
    }
    for (const bl of blockedDates) {
      const dateDebut = new Date(bl.date_debut)
      const dateFin = new Date(bl.date_fin)
      result.push({
        id: bl.id,
        title: bl.notes || `Indisponible — ${bl.property.nom}`,
        start: dateDebut,
        end: dateFin,
        color: "#6b7280",
        meta: {
          type: "blocked",
          propertyName: bl.property.nom,
          dateDebut,
          dateFin,
          notes: bl.notes,
        },
      })
    }
    return result
  }, [bookings, cleanings, blockedDates])

  const handleSelectEvent = useCallback((event: object) => {
    setSelectedMeta((event as CalEvent).meta)
  }, [])

  return (
    <>
      <div className="bg-white rounded-xl shadow-soft p-4" style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="month"
          views={["month", "week"]}
          culture="fr"
          messages={{
            month: "Mois",
            week: "Semaine",
            today: "Aujourd'hui",
            previous: "Préc.",
            next: "Suiv.",
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: (event as CalEvent).color,
              borderColor: (event as CalEvent).color,
              color: "#fff",
              cursor: "pointer",
            },
          })}
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%" }}
        />
      </div>
      <EventDetailModal meta={selectedMeta} onClose={() => setSelectedMeta(null)} />
    </>
  )
}
