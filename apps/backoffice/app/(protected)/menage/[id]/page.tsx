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
                    className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-muted transition-colors"
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
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Détails</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bien</span>
              <Link href={`/biens/${task.property.id}`} className="text-primary hover:underline">
                {task.property.nom}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date prévue</span>
              <span className="text-foreground">
                {new Date(task.date_prevue).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {task.date_realisation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Réalisé le</span>
                <span className="text-foreground">
                  {new Date(task.date_realisation).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <StatusBadge status={task.statut} />
            </div>
            {task.contractor ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <Link href={`/prestataires/${task.contractor.id}`} className="text-primary hover:underline">
                  {task.contractor.nom}
                </Link>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestataire</span>
                <span className="text-muted-foreground text-xs">Non assigné</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Séjour lié</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voyageur</span>
              <span className="text-foreground">
                {task.booking.guest.prenom} {task.booking.guest.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="text-foreground">
                {new Date(task.booking.check_in).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="text-foreground">
                {new Date(task.booking.check_out).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <Link
              href={`/reservations/${task.booking.id}`}
              className="inline-block text-xs text-primary hover:underline pt-1"
            >
              Voir la réservation
            </Link>
          </div>
        </div>
      </div>

      {task.notes && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Notes</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}
    </div>
  )
}
