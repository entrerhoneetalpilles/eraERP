"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Star, MessageSquare, Building2 } from "lucide-react"
import { Button } from "@conciergerie/ui"
import { upsertReviewResponseAction } from "./actions"

type Review = {
  id: string
  booking_id: string
  note_globale: number
  note_proprete: number | null
  note_communication: number | null
  commentaire_voyageur: string | null
  reponse_gestionnaire: string | null
  date_avis: Date | string
  booking: {
    property: { id: string; nom: string }
    guest: { id: string; prenom: string; nom: string }
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
      ))}
      <span className="ml-1 text-sm font-semibold tabular-nums">{value.toFixed(1)}</span>
    </span>
  )
}

export function ReviewCard({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [reponse, setReponse] = useState(review.reponse_gestionnaire ?? "")

  function handleSave() {
    startTransition(async () => {
      await upsertReviewResponseAction(review.booking_id, reponse)
      setEditing(false)
    })
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-medium text-foreground">
              {review.booking.guest.prenom} {review.booking.guest.nom}
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(review.date_avis).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" />
            <Link href={`/biens/${review.booking.property.id}`} className="hover:text-primary">
              {review.booking.property.nom}
            </Link>
          </div>
        </div>
        <Stars value={review.note_globale} />
      </div>

      {(review.note_proprete != null || review.note_communication != null) && (
        <div className="flex items-center gap-4 text-xs">
          {review.note_proprete != null && (
            <span className="text-muted-foreground">Propreté : <strong>{review.note_proprete.toFixed(1)}</strong></span>
          )}
          {review.note_communication != null && (
            <span className="text-muted-foreground">Communication : <strong>{review.note_communication.toFixed(1)}</strong></span>
          )}
        </div>
      )}

      {review.commentaire_voyageur && (
        <blockquote className="border-l-2 border-muted-foreground/20 pl-3">
          <p className="text-sm text-foreground italic leading-relaxed">&ldquo;{review.commentaire_voyageur}&rdquo;</p>
        </blockquote>
      )}

      {/* Réponse gestionnaire */}
      {!editing && review.reponse_gestionnaire && (
        <div className="bg-muted rounded-md px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />Réponse
            </p>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(true)}>Modifier</Button>
          </div>
          <p className="text-sm text-foreground">{review.reponse_gestionnaire}</p>
        </div>
      )}

      {!editing && !review.reponse_gestionnaire && (
        <Button size="sm" variant="outline" className="gap-2 text-xs h-7" onClick={() => setEditing(true)}>
          <MessageSquare className="w-3 h-3" />
          Répondre
        </Button>
      )}

      {editing && (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            placeholder="Votre réponse publique..."
            value={reponse}
            onChange={e => setReponse(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" disabled={isPending || !reponse.trim()} onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      )}
    </div>
  )
}
