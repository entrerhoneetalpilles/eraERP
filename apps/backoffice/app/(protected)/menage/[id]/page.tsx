import { notFound } from "next/navigation"
import Link from "next/link"
import { getCleaningTaskById } from "@/lib/dal/menage"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateCleaningStatutAction } from "./actions"
import { CheckCircle2, Circle, AlertTriangle, Clock, User, Building2, Calendar, Euro, Star, MessageSquare, Image as ImageIcon, Timer } from "lucide-react"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME" }>> = {
  PLANIFIEE: [{ label: "Démarrer le ménage", value: "EN_COURS" }, { label: "Signaler un problème", value: "PROBLEME" }],
  EN_COURS: [{ label: "Terminer le ménage", value: "TERMINEE" }, { label: "Signaler un problème", value: "PROBLEME" }],
  TERMINEE: [],
  PROBLEME: [{ label: "Relancer", value: "PLANIFIEE" }],
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}/5</span>
    </span>
  )
}

export default async function CleaningTaskDetailPage({ params }: { params: { id: string } }) {
  const task = await getCleaningTaskById(params.id)
  if (!task) notFound()

  const actions = NEXT_STATUTS[task.statut] ?? []
  const checklist = task.checklist as Array<{ label: string; done?: boolean; section?: string }> ?? []
  const photos = task.photos as string[] ?? []
  const noteQualite = (task as any).note_qualite as number | null
  const montant = (task as any).montant as number | null
  const dureeEstimee = (task as any).duree_estimee as number | null
  const dureeReelle = (task as any).duree_reelle as number | null
  const noteAgent = (task as any).note_agent as string | null

  const checklistDone = checklist.filter(i => i.done).length
  const checklistTotal = checklist.length
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : null

  const overdue = task.statut === "PLANIFIEE" && new Date(task.date_prevue) < new Date()

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">Ménage — {task.property.nom}</h1>
            <StatusBadge status={task.statut} />
            {overdue && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800"><AlertTriangle className="w-3 h-3" />En retard</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Prévu le {new Date(task.date_prevue).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions.map(action => (
            <form key={action.value} action={updateCleaningStatutAction.bind(null, task.id, action.value)}>
              <button type="submit" className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer">{action.label}</button>
            </form>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Info */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informations</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Bien</span>
                <Link href={`/biens/${task.property.id}`} className="font-medium text-primary hover:underline cursor-pointer">{task.property.nom}</Link>
              </div>
              {task.contractor ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Prestataire</span>
                  <div className="text-right">
                    <Link href={`/prestataires/${task.contractor.id}`} className="font-medium text-primary hover:underline cursor-pointer block">{task.contractor.nom}</Link>
                    {task.contractor.telephone && <a href={`tel:${task.contractor.telephone}`} className="text-xs text-muted-foreground hover:text-primary">{task.contractor.telephone}</a>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Prestataire</span>
                  <span className="text-xs text-amber-600 font-medium">Non assigné</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date prévue</span>
                <span className={`font-medium ${overdue ? "text-red-600" : "text-foreground"}`}>{new Date(task.date_prevue).toLocaleDateString("fr-FR")}</span>
              </div>
              {task.date_realisation && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Réalisé le</span>
                  <span className="font-medium text-emerald-600">{new Date(task.date_realisation).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {task.booking && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Réservation</span>
                    <Link href={`/reservations/${task.booking.id}`} className="text-xs font-medium text-primary hover:underline cursor-pointer">Voir la réservation</Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.booking.guest.prenom} {task.booking.guest.nom}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Durées & coût */}
          {(dureeEstimee != null || dureeReelle != null || montant != null) && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Temps & Coût</p>
              <div className="space-y-2 text-sm">
                {dureeEstimee != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" />Durée estimée</span>
                    <span className="font-medium">{dureeEstimee}min</span>
                  </div>
                )}
                {dureeReelle != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Durée réelle</span>
                    <span className={`font-medium ${dureeEstimee && dureeReelle > dureeEstimee ? "text-amber-600" : "text-emerald-600"}`}>{dureeReelle}min</span>
                  </div>
                )}
                {montant != null && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" />Coût</span>
                    <span className="font-semibold">{montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Qualité */}
          {noteQualite != null && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Qualité</p>
              <Stars value={noteQualite} />
            </div>
          )}

          {/* Notes agent */}
          {(task.notes || noteAgent) && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Notes</p>
              {task.notes && <p className="text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap">{task.notes}</p>}
              {noteAgent && <p className="text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap mt-1">{noteAgent}</p>}
            </div>
          )}
        </div>

        {/* Right: Checklist + Photos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Checklist */}
          {checklist.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Checklist</p>
                {checklistPct != null && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${checklistPct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${checklistPct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{checklistDone}/{checklistTotal}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {checklist.map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 px-2 py-1.5 rounded-md ${item.done ? "bg-emerald-50/50 dark:bg-emerald-900/5" : ""}`}>
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Photos ({photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {checklist.length === 0 && photos.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Aucune checklist ni photo pour cette tâche.</p>
              <p className="text-xs text-muted-foreground mt-1">Les checklists et photos peuvent être ajoutées via l&apos;application mobile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
