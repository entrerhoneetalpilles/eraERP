import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerWorkOrders } from "@/lib/dal/travaux"
import { Wrench, Building2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente", DEVIS_ENVOYE: "Devis envoyé",
  DEVIS_ACCEPTE: "Devis accepté", EN_ATTENTE_VALIDATION: "À valider",
  EN_COURS: "En cours", TERMINE: "Terminé", ANNULE: "Annulé",
}
const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "text-garrigue-500 bg-garrigue-50 border-argile-200",
  DEVIS_ENVOYE: "text-blue-700 bg-blue-50 border-blue-200",
  DEVIS_ACCEPTE: "text-blue-700 bg-blue-50 border-blue-200",
  EN_ATTENTE_VALIDATION: "text-amber-700 bg-amber-50 border-amber-200",
  EN_COURS: "text-emerald-700 bg-emerald-50 border-emerald-200",
  TERMINE: "text-garrigue-400 bg-garrigue-50 border-argile-200",
  ANNULE: "text-red-600 bg-red-50 border-red-200",
}
const URGENCE_COLORS: Record<string, string> = {
  BASSE: "text-garrigue-400", NORMALE: "text-blue-500",
  HAUTE: "text-amber-600", URGENTE: "text-red-600",
}

export default async function TravauxPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const workOrders = await getOwnerWorkOrders(session.user.ownerId as string)

  const active = workOrders.filter(w => !["TERMINE", "ANNULE"].includes(w.statut))
  const done = workOrders.filter(w => ["TERMINE", "ANNULE"].includes(w.statut))

  const Card = ({ wo }: { wo: (typeof workOrders)[0] }) => (
    <div className="bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/40">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-garrigue-900 font-light leading-tight">{wo.titre}</p>
          <div className="flex items-center gap-2 mt-1">
            <Building2 size={12} className="text-garrigue-400 shrink-0" />
            <p className="text-xs text-garrigue-400 truncate">{wo.property.nom}</p>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUT_COLORS[wo.statut] ?? "bg-muted"}`}>
          {STATUT_LABELS[wo.statut] ?? wo.statut}
        </span>
      </div>

      {wo.description && (
        <p className="text-xs text-garrigue-500 mb-3 leading-relaxed">{wo.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-argile-100">
        <div className="flex items-center gap-3 text-xs text-garrigue-400 flex-wrap">
          {wo.urgence && wo.urgence !== "NORMALE" && (
            <span className={`flex items-center gap-1 font-medium ${URGENCE_COLORS[wo.urgence]}`}>
              <AlertTriangle size={10} /> {wo.urgence}
            </span>
          )}
          {wo.contractor && (
            <span className="flex items-center gap-1">
              <Wrench size={10} /> {wo.contractor.nom}
            </span>
          )}
          <span>{format(new Date(wo.createdAt), "d MMM yyyy", { locale: fr })}</span>
        </div>
        {wo.montant_devis !== null && (
          <p className="font-serif text-base text-garrigue-900 font-light">{fmt(wo.montant_devis)}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl animate-fade-up">
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Travaux.</h1>
        <p className="text-sm text-garrigue-400 mt-1">{workOrders.length} ordre{workOrders.length !== 1 ? "s" : ""} de service</p>
      </div>

      {workOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <Wrench size={40} strokeWidth={1.2} />
          <p className="text-sm">Aucun ordre de service</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-garrigue-400">En cours</h2>
              {active.map(wo => <Card key={wo.id} wo={wo} />)}
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-garrigue-400">Terminés</h2>
              {done.map(wo => <Card key={wo.id} wo={wo} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
