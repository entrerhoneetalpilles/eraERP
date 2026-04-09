import { Calendar, ArrowDownToLine, ArrowUpFromLine, Sparkles } from "lucide-react"

interface Props {
  occupancy: number
  arrivals: number
  departures: number
  cleanings: number
}

export function PlanningStats({ occupancy, arrivals, departures, cleanings }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: "Taux d'occupation", value: `${occupancy}%`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Arrivées", value: String(arrivals), icon: ArrowDownToLine, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Départs", value: String(departures), icon: ArrowUpFromLine, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        { label: "Ménages planifiés", value: String(cleanings), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className={`p-1.5 rounded-md ${bg}`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
