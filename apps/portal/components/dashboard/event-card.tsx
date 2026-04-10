import { ArrowDown, ArrowUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface EventCardProps {
  type: "checkin" | "checkout"
  propertyName: string
  date: Date
}

export function EventCard({ type, propertyName, date }: EventCardProps) {
  const isCheckin = type === "checkin"
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: fr })

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-soft flex items-center gap-3">
      <div
        className={`p-2 rounded-full ${
          isCheckin ? "bg-olivier-50 text-olivier-600" : "bg-garrigue-50 text-garrigue-500"
        }`}
      >
        {isCheckin ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-garrigue-900 truncate">
          {isCheckin ? "Arrivée" : "Départ"} — {propertyName}
        </p>
        <p className="text-xs text-garrigue-400 capitalize">{relative}</p>
      </div>
    </div>
  )
}
