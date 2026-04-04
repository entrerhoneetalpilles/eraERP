import { cn } from "@conciergerie/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIF: { label: "Actif", className: "bg-emerald-50 text-emerald-700" },
  INACTIF: { label: "Inactif", className: "bg-zinc-100 text-zinc-600" },
  TRAVAUX: { label: "Travaux", className: "bg-zinc-100 text-zinc-600" },
  SUSPENDU: { label: "Suspendu", className: "bg-amber-50 text-amber-700" },
  RESILIE: { label: "Résilié", className: "bg-red-50 text-red-700" },
  CONFIRMED: { label: "Confirmée", className: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  CHECKEDIN: { label: "Check-in", className: "bg-blue-50 text-blue-700" },
  CHECKEDOUT: { label: "Check-out", className: "bg-zinc-100 text-zinc-600" },
  CANCELLED: { label: "Annulée", className: "bg-red-50 text-red-700" },
  INDIVIDUAL: { label: "Particulier", className: "bg-zinc-100 text-zinc-600" },
  SCI: { label: "SCI", className: "bg-violet-50 text-violet-700" },
  INDIVISION: { label: "Indivision", className: "bg-orange-50 text-orange-700" },
  BROUILLON: { label: "Brouillon", className: "bg-amber-50 text-amber-700" },
  EMISE: { label: "Émise", className: "bg-amber-50 text-amber-700" },
  PAYEE: { label: "Payée", className: "bg-emerald-50 text-emerald-700" },
  AVOIR: { label: "Avoir", className: "bg-zinc-100 text-zinc-600" },
  OUVERT: { label: "Ouvert", className: "bg-amber-50 text-amber-700" },
  PLANIFIEE: { label: "Planifiée", className: "bg-amber-50 text-amber-700" },
  TERMINEE: { label: "Terminée", className: "bg-emerald-50 text-emerald-700" },
  PROBLEME: { label: "Problème", className: "bg-red-50 text-red-700" },
  EN_COURS: { label: "En cours", className: "bg-amber-50 text-amber-700" },
  EN_ATTENTE_DEVIS: { label: "Attente devis", className: "bg-amber-50 text-amber-700" },
  EN_ATTENTE_VALIDATION: { label: "Attente valid.", className: "bg-amber-50 text-amber-700" },
  VALIDE: { label: "Validé", className: "bg-emerald-50 text-emerald-700" },
  TERMINE: { label: "Terminé", className: "bg-zinc-100 text-zinc-600" },
  ANNULE: { label: "Annulé", className: "bg-red-50 text-red-700" },
  NORMALE: { label: "Normale", className: "bg-zinc-100 text-zinc-600" },
  URGENTE: { label: "Urgente", className: "bg-orange-50 text-orange-700" },
  CRITIQUE: { label: "Critique", className: "bg-red-50 text-red-700" },
  APPARTEMENT: { label: "Appartement", className: "bg-sky-50 text-sky-700" },
  VILLA: { label: "Villa", className: "bg-purple-50 text-purple-700" },
  LOFT: { label: "Loft", className: "bg-cyan-50 text-cyan-700" },
  CHALET: { label: "Chalet", className: "bg-amber-50 text-amber-700" },
  AUTRE: { label: "Autre", className: "bg-zinc-100 text-zinc-600" },
  VALIDATED: { label: "Validé", className: "bg-emerald-50 text-emerald-700" },
  RECONCILED: { label: "Rapproché", className: "bg-emerald-50 text-emerald-700" },
}

export function getStatusConfig(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-zinc-100 text-zinc-600" }
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
        "inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium whitespace-nowrap",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
