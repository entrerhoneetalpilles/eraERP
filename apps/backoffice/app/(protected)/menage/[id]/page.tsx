import { notFound } from "next/navigation"
import Link from "next/link"
import { getCleaningTaskById } from "@/lib/dal/menage"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateCleaningStatutAction } from "./actions"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "PROBLEME" }>> = {
  PLANIFIEE: [
    { label: "Démarrer", value: "EN_COURS" },
    { label: "Signaler problème", value: "PROBLEME" },
  ],
  EN_COURS: [
    { label: "Terminer", value: "TERMINEE" },
    { label: "Signaler problème", value: "PROBLEME" },
  ],
  TERMINEE: [],
  PROBLEME: [{ label: "Relancer", value: "PLANIFIEE" }],
}

export default async function CleaningTaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const task = await getCleaningTaskById(params.id)
  if (!task) notFound()

  const actions = NEXT_STATUTS[task.statut] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ménage — ${task.property.nom}`}
        actions={
          <div className="flex items-center gap-2">
            {actions.length === 0 ? (
              task.statut === "TERMINEE" ? (
                <span className="text-sm text-muted-foreground">Tâche terminée</span>
              ) : null
            ) : (
              actions.map((action) => (
                <form
                  key={action.value}
                  action={updateCleaningStatutAction.bind(null, task.id, action.value)}
                >
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors duration-100 cursor-pointer"
                  >
                    {action.label}
                  </button>
                </form>
              ))
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Détails</p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Bien</span>
              <Link href={`/biens/${task.property.id}`} className="text-sm font-medium text-foreground hover:text-primary cursor-pointer">
                {task.property.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Date prévue</span>
              <span className="text-sm text-foreground font-medium">
                {new Date(task.date_prevue).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {task.date_realisation && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Réalisé le</span>
                <span className="text-sm text-foreground font-medium">
                  {new Date(task.date_realisation).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={task.statut} />
            </div>
            {task.contractor ? (
              <div className="flex items-center justify-between py-2 last:border-0">
                <span className="text-sm text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${task.contractor.id}`} className="text-sm font-medium text-foreground hover:text-primary cursor-pointer">
                  {task.contractor.nom}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 last:border-0">
                <span className="text-sm text-muted-foreground">Prestataire</span>
                <span className="text-sm text-muted-foreground">Non assigné</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Séjour lié</p>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Voyageur</span>
              <span className="text-sm text-foreground font-medium">
                {task.booking.guest.prenom} {task.booking.guest.nom}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Check-in</span>
              <span className="text-sm text-foreground font-medium">
                {new Date(task.booking.check_in).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Check-out</span>
              <span className="text-sm text-foreground font-medium">
                {new Date(task.booking.check_out).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="py-2">
              <Link
                href={`/reservations/${task.booking.id}`}
                className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
              >
                Voir la réservation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {task.notes && (
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notes</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}
    </div>
  )
}
