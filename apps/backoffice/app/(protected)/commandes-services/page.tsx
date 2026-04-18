import { getServiceOrders, getServiceOrderStats } from "@/lib/dal/service-orders"
import { PageHeader } from "@/components/ui/page-header"
import { CommandesList } from "./commandes-list"
import { ShoppingBag, Clock, CheckCircle2, Package } from "lucide-react"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export default async function CommandesServicesPage() {
  const [orders, stats] = await Promise.all([
    getServiceOrders(),
    getServiceOrderStats(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes de services"
        description="Services additionnels commandés par les voyageurs"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`rounded-lg border p-4 ${stats.pending > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className={`w-3.5 h-3.5 ${stats.pending > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${stats.pending > 0 ? "text-amber-600" : "text-foreground"}`}>{stats.pending}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Confirmées</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Réalisées</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">CA réalisé</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(stats.totalRevenue)}</p>
        </div>
      </div>

      <CommandesList orders={orders} />
    </div>
  )
}
