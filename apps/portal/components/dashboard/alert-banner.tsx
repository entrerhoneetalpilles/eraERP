import { AlertTriangle } from "lucide-react"

interface AlertBannerProps {
  alerts: { id: string; message: string }[]
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) return null

  return (
    <div className="bg-or-300/10 border border-or-400/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-or-500 shrink-0" />
        <p className="text-xs font-semibold text-or-600 uppercase tracking-wide">
          {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="space-y-1">
        {alerts.map((a) => (
          <li key={a.id} className="text-sm text-garrigue-700 font-light">
            {a.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
