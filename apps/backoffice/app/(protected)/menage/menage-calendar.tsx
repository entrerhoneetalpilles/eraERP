"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useRouter } from "next/navigation"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
})

const STATUS_COLORS: Record<string, string> = {
  PLANIFIEE: "#7dd3fc",
  EN_COURS: "#fb923c",
  TERMINEE: "#4ade80",
  PROBLEME: "#f87171",
}

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
  noEventsInRange: "Aucune tâche sur cette période",
}

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  url: string
}

interface Task {
  id: string
  date_prevue: Date | string
  statut: string
  property: { nom: string }
}

export function MenageCalendar({ tasks }: { tasks: Task[] }) {
  const router = useRouter()

  const events = useMemo<CalEvent[]>(
    () =>
      tasks.map((t) => {
        const start = new Date(t.date_prevue as string)
        const end = new Date(start)
        // Default 3h duration — actual duration not stored on CleaningTask
        end.setHours(end.getHours() + 3)
        return {
          id: t.id,
          title: `Ménage — ${t.property.nom}`,
          start,
          end,
          color: STATUS_COLORS[t.statut] ?? "#7dd3fc",
          url: `/menage/${t.id}`,
        }
      }),
    [tasks]
  )

  return (
    <div className="h-[600px] bg-card rounded-lg border border-border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK]}
        culture="fr"
        messages={MESSAGES}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: (event as unknown as CalEvent).color,
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            padding: "2px 4px",
          },
        })}
        onSelectEvent={(event) => router.push((event as unknown as CalEvent).url)}
      />
    </div>
  )
}
