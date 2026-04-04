import { getCleaningTasks } from "@/lib/dal/menage"
import { PageHeader } from "@/components/ui/page-header"
import { MenageTable } from "./menage-table"

export default async function MenagePage() {
  const tasks = await getCleaningTasks()
  const pending = tasks.filter((t) => t.statut !== "TERMINEE" && t.statut !== "PROBLEME").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ménage"
        description={`${pending} tâche${pending !== 1 ? "s" : ""} en attente`}
      />
      <MenageTable data={tasks} />
    </div>
  )
}
