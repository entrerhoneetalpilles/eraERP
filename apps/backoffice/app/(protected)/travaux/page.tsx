import Link from "next/link"
import { getWorkOrders } from "@/lib/dal/travaux"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus, AlertTriangle, Wrench, Clock, CheckCircle2 } from "lucide-react"
import { TravauxTable } from "./travaux-table"

export default async function TravauxPage() {
  const workOrders = await getWorkOrders()

  const stats = {
    total: workOrders.length,
    ouverts: workOrders.filter(w => w.statut === "OUVERT").length,
    enCours: workOrders.filter(w => w.statut === "EN_COURS").length,
    critiques: workOrders.filter(w => w.urgence === "CRITIQUE" && !["TERMINE", "ANNULE"].includes(w.statut)).length,
    termines: workOrders.filter(w => w.statut === "TERMINE").length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travaux & Maintenance"
        description={`${workOrders.length} ordre${workOrders.length !== 1 ? "s" : ""} de service`}
        actions={
          <Link href="/travaux/new">
            <Button size="sm" className="cursor-pointer"><Plus className="w-4 h-4 mr-2" />Nouvel ordre</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Ouverts", value: stats.ouverts, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "En cours", value: stats.enCours, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Critiques", value: stats.critiques, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Terminés", value: stats.termines, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className={`p-1.5 rounded-md ${bg}`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {stats.critiques > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {stats.critiques} ordre{stats.critiques > 1 ? "s" : ""} de travaux CRITIQUE{stats.critiques > 1 ? "s" : ""} en attente d&apos;intervention
        </div>
      )}

      <TravauxTable data={workOrders} />
    </div>
  )
}
