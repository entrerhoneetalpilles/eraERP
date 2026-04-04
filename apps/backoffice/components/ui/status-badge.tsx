import { cn } from "@conciergerie/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIF: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIF: { label: "Inactif", className: "bg-slate-100 text-slate-600" },
  TRAVAUX: { label: "Travaux", className: "bg-orange-100 text-orange-800" },
  SUSPENDU: { label: "Suspendu", className: "bg-yellow-100 text-yellow-800" },
  RESILIE: { label: "Résilié", className: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "Confirmée", className: "bg-green-100 text-green-800" },
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CHECKEDIN: { label: "Check-in", className: "bg-blue-100 text-blue-800" },
  CHECKEDOUT: { label: "Check-out", className: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-800" },
  INDIVIDUAL: { label: "Particulier", className: "bg-slate-100 text-slate-700" },
  SCI: { label: "SCI", className: "bg-violet-100 text-violet-800" },
  INDIVISION: { label: "Indivision", className: "bg-amber-100 text-amber-800" },
  BROUILLON: { label: "Brouillon", className: "bg-slate-100 text-slate-600" },
  EMISE: { label: "Émise", className: "bg-blue-100 text-blue-800" },
  PAYEE: { label: "Payée", className: "bg-green-100 text-green-800" },
  AVOIR: { label: "Avoir", className: "bg-orange-100 text-orange-800" },
  OUVERT: { label: "Ouvert", className: "bg-blue-100 text-blue-800" },
  EN_COURS: { label: "En cours", className: "bg-yellow-100 text-yellow-800" },
  EN_ATTENTE_DEVIS: { label: "Attente devis", className: "bg-orange-100 text-orange-800" },
  EN_ATTENTE_VALIDATION: { label: "Attente valid.", className: "bg-orange-100 text-orange-800" },
  VALIDE: { label: "Validé", className: "bg-green-100 text-green-800" },
  TERMINE: { label: "Terminé", className: "bg-slate-100 text-slate-600" },
  ANNULE: { label: "Annulé", className: "bg-red-100 text-red-800" },
  NORMALE: { label: "Normale", className: "bg-slate-100 text-slate-600" },
  URGENTE: { label: "Urgente", className: "bg-orange-100 text-orange-800" },
  CRITIQUE: { label: "Critique", className: "bg-red-100 text-red-800" },
  APPARTEMENT: { label: "Appartement", className: "bg-blue-100 text-blue-800" },
  VILLA: { label: "Villa", className: "bg-violet-100 text-violet-800" },
  LOFT: { label: "Loft", className: "bg-cyan-100 text-cyan-800" },
  CHALET: { label: "Chalet", className: "bg-amber-100 text-amber-800" },
  AUTRE: { label: "Autre", className: "bg-slate-100 text-slate-600" },
  VALIDATED: { label: "Validé", className: "bg-green-100 text-green-800" },
  RECONCILED: { label: "Rapproché", className: "bg-blue-100 text-blue-800" },
}

export function getStatusConfig(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
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
