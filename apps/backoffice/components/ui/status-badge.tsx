import { cn } from "@conciergerie/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIF: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIF: { label: "Inactif", className: "bg-gray-100 text-gray-600" },
  TRAVAUX: { label: "Travaux", className: "bg-orange-100 text-orange-800" },
  SUSPENDU: { label: "Suspendu", className: "bg-yellow-100 text-yellow-800" },
  RESILIE: { label: "Résilié", className: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "Confirmée", className: "bg-green-100 text-green-800" },
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CHECKEDIN: { label: "Check-in", className: "bg-blue-100 text-blue-800" },
  CHECKEDOUT: { label: "Check-out", className: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-800" },
  INDIVIDUAL: { label: "Particulier", className: "bg-garrigue-100 text-garrigue-800" },
  SCI: { label: "SCI", className: "bg-lavande-100 text-lavande-800" },
  INDIVISION: { label: "Indivision", className: "bg-argile-100 text-argile-800" },
}

export function getStatusConfig(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-gray-100 text-gray-600" }
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
