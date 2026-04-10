import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PropertyCardProps {
  id: string
  nom: string
  adresse: unknown
  tauxOccupation: number
  prochaineresa: { check_in: Date; check_out: Date } | null
}

function extractVille(adresse: unknown): string | null {
  if (adresse && typeof adresse === "object") {
    const addr = adresse as Record<string, unknown>
    if (typeof addr.ville === "string") return addr.ville
    if (typeof addr.city === "string") return addr.city
  }
  return null
}

export function PropertyCard({ id, nom, adresse, tauxOccupation, prochaineresa }: PropertyCardProps) {
  const ville = extractVille(adresse)
  return (
    <div className="bg-white rounded-xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif text-lg text-garrigue-900">{nom}</h3>
          {ville && (
            <div className="flex items-center gap-1 text-xs text-garrigue-400 mt-0.5">
              <MapPin size={12} />
              {ville}
            </div>
          )}
        </div>
        <span className="text-xs bg-olivier-50 text-olivier-600 px-2 py-1 rounded-full font-medium shrink-0">
          Actif
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-garrigue-400">Taux occ. ce mois</p>
          <p className="text-lg font-semibold text-garrigue-900 mt-0.5">{tauxOccupation}%</p>
        </div>
        <div>
          <p className="text-xs text-garrigue-400">Prochaine résa</p>
          <p className="text-sm text-garrigue-700 mt-0.5">
            {prochaineresa
              ? `${format(prochaineresa.check_in, "d MMM", { locale: fr })} – ${format(prochaineresa.check_out, "d MMM", { locale: fr })}`
              : "Aucune"}
          </p>
        </div>
      </div>
      <Link
        href={`/biens/${id}`}
        className="flex items-center gap-1 text-sm text-olivier-600 font-medium hover:text-olivier-500 transition-colors"
      >
        Voir le détail <ArrowRight size={14} />
      </Link>
    </div>
  )
}
