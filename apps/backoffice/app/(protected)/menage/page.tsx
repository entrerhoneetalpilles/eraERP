import { getCleaningTasks } from "@/lib/dal/menage"
import { getPrestataires } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { MenageTabs } from "./menage-tabs"

export default async function MenagePage() {
  const [tasks, contractors] = await Promise.all([getCleaningTasks(), getPrestataires()])
  const pending = tasks.filter((t) => t.statut !== "TERMINEE" && t.statut !== "PROBLEME").length

  const contractorList = contractors.map((c) => ({ id: c.id, nom: c.nom }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ménage"
        description={`${pending} tâche${pending !== 1 ? "s" : ""} en attente`}
      />
      <MenageTabs tasks={tasks} contractors={contractorList} />
    </div>
  )
}
