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
    <Link
      href={`/biens/${id}`}
      className="group block bg-white rounded-2xl p-6 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury-hover hover:-translate-y-0.5 transition-smooth cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-serif text-xl text-garrigue-900 font-light leading-tight">
            {nom}
          </h3>
          {ville && (
            <div className="flex items-center gap-1 text-xs text-garrigue-400 mt-1">
              <MapPin size={11} strokeWidth={1.8} />
              <span>{ville}</span>
            </div>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-or-600 bg-or-300/15 border border-or-300/30 px-2.5 py-1 rounded-full shrink-0">
          Actif
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wider mb-1">
            Occupation ce mois
          </p>
          <p className="font-serif text-3xl text-garrigue-900 font-light leading-none">
            {tauxOccupation}
            <span className="text-lg text-garrigue-400 ml-0.5">%</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wider mb-1">
            Prochaine résa
          </p>
          <p className="text-sm text-garrigue-700 font-medium">
            {prochaineresa
              ? `${format(prochaineresa.check_in, "d MMM", { locale: fr })} – ${format(prochaineresa.check_out, "d MMM", { locale: fr })}`
              : "—"}
          </p>
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-between pt-4 border-t border-argile-200/60">
        <span className="text-sm text-olivier-600 font-medium group-hover:text-olivier-500 transition-fast flex items-center gap-1.5">
          Voir le détail
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-fast" />
        </span>
      </div>
    </Link>
  )
}
