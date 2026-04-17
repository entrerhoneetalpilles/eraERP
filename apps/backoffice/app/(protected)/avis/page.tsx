import { getReviews } from "@/lib/dal/reviews"
import { PageHeader } from "@/components/ui/page-header"
import { Star } from "lucide-react"
import { ReviewCard } from "./review-card"

export default async function AvisPage() {
  const reviews = await getReviews()

  const avgNote = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.note_globale, 0) / reviews.length
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avis voyageurs"
        description={
          reviews.length > 0 && avgNote != null
            ? `${reviews.length} avis · Note moyenne ${avgNote.toFixed(2)}/5`
            : `${reviews.length} avis`
        }
      />

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
          <Star className="w-10 h-10 opacity-20" />
          <p className="text-sm">Aucun avis enregistré</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review as any} />
          ))}
        </div>
      )}
    </div>
  )
}
