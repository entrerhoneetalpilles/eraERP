"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useRouter } from "next/navigation"
import "react-big-calendar/lib/css/react-big-calendar.css"
import type { PlanningEvent } from "@/lib/dal/planning"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const MESSAGES = {
  today: "Aujourd'hui",
  previous: "Précédent",
  next: "Suivant",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement sur cette période",
}

export function PlanningCalendar({ events }: { events: PlanningEvent[] }) {
  const router = useRouter()

  const calEvents = useMemo(
    () => events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) })),
    [events]
  )

  return (
    <div className="h-[640px] bg-card rounded-lg border border-border p-4">
      <Calendar
        localizer={localizer}
        events={calEvents}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        culture="fr"
        messages={MESSAGES}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: (event as unknown as PlanningEvent).color,
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            padding: "2px 4px",
          },
        })}
        onSelectEvent={(event) => {
          const url = (event as unknown as PlanningEvent).url
          if (url) router.push(url)
        }}
      />
    </div>
  )
}
