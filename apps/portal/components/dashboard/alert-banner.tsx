import { AlertTriangle } from "lucide-react"

interface Alert {
  id: string
  message: string
}

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          {alerts.map((a) => (
            <p key={a.id} className="text-sm text-amber-800">
              {a.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
