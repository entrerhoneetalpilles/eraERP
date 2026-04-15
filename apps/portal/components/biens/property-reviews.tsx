import { Star } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Review {
  id: string
  note_globale: number
  note_proprete: number | null
  note_communication: number | null
  commentaire_voyageur: string | null
  date_avis: Date
  booking: {
    check_in: Date
    check_out: Date
    guest: { prenom: string }
  }
}

interface PropertyReviewsProps {
  reviews: Review[]
}

function StarRating({ note }: { note: number }) {
  const stars = Math.round(note)
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= stars ? "fill-or-400 text-or-400" : "text-argile-300"}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-garrigue-500 ml-1 tabular-nums">{note.toFixed(1)}</span>
    </div>
  )
}

export function PropertyReviews({ reviews }: PropertyReviewsProps) {
  if (reviews.length === 0) return null

  const avgNote = reviews.reduce((s, r) => s + r.note_globale, 0) / reviews.length

  return (
    <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-argile-200/40 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
          Avis voyageurs
        </h2>
        <div className="flex items-center gap-1.5">
          <Star size={13} className="fill-or-400 text-or-400" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-garrigue-900 tabular-nums">
            {avgNote.toFixed(1)}
          </span>
          <span className="text-xs text-garrigue-400">
            ({reviews.length} avis)
          </span>
        </div>
      </div>
      <div className="divide-y divide-argile-100">
        {reviews.map((r) => (
          <div key={r.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-garrigue-900">
                  {r.booking.guest.prenom}
                </p>
                <p className="text-xs text-garrigue-400">
                  {format(r.booking.check_in, "d MMM", { locale: fr })} →{" "}
                  {format(r.booking.check_out, "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <StarRating note={r.note_globale} />
            </div>
            {r.commentaire_voyageur && (
              <p className="text-sm text-garrigue-600 leading-relaxed italic">
                &ldquo;{r.commentaire_voyageur}&rdquo;
              </p>
            )}
            {(r.note_proprete !== null || r.note_communication !== null) && (
              <div className="flex gap-4 mt-2">
                {r.note_proprete !== null && (
                  <div>
                    <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Propreté</p>
                    <StarRating note={r.note_proprete} />
                  </div>
                )}
                {r.note_communication !== null && (
                  <div>
                    <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Communication</p>
                    <StarRating note={r.note_communication} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
