import Link from "next/link"
import { getFeeInvoices, getInvoiceStats } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import {
  Plus, TrendingUp, Clock, CheckCircle, AlertCircle,
  AlertTriangle, TrendingDown,
} from "lucide-react"
import { FacturationTable } from "./facturation-table"

function KpiCard({
  label, value, sub, icon: Icon, variant = "default",
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  variant?: "default" | "warning" | "danger" | "success"
}) {
  const colors = {
    default: "border-border bg-card",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-red-500/30 bg-red-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  }
  const iconColors = {
    default: "text-muted-foreground",
    warning: "text-amber-500",
    danger: "text-red-500",
    success: "text-emerald-500",
  }
  const valueColors = {
    default: "text-foreground",
    warning: "text-amber-600",
    danger: "text-red-600",
    success: "text-emerald-600",
  }
  return (
    <div className={`rounded-lg border p-4 space-y-1.5 ${colors[variant]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <Icon className={`w-4 h-4 ${iconColors[variant]}`} />
      </div>
      <p className={`text-xl font-semibold tabular-nums ${valueColors[variant]}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export default async function FacturationPage() {
  const [invoices, stats] = await Promise.all([getFeeInvoices(), getInvoiceStats()])

  const kpis = [
    {
      label: "Total TTC facturé",
      value: stats.totalTTC.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${stats.totalHT.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} HT`,
      icon: TrendingUp,
      variant: "default" as const,
    },
    {
      label: "En attente de paiement",
      value: stats.totalEmis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${stats.countEmis} facture${stats.countEmis !== 1 ? "s" : ""} émise${stats.countEmis !== 1 ? "s" : ""}`,
      icon: Clock,
      variant: stats.countEmis > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "En retard",
      value: stats.overdueAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${stats.countOverdue} facture${stats.countOverdue !== 1 ? "s" : ""} en souffrance`,
      icon: AlertTriangle,
      variant: stats.countOverdue > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Encaissé",
      value: stats.totalPaye.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${stats.countPaye} facture${stats.countPaye !== 1 ? "s" : ""} payée${stats.countPaye !== 1 ? "s" : ""}`,
      icon: CheckCircle,
      variant: "success" as const,
    },
    {
      label: "Brouillons",
      value: String(stats.countBrouillon),
      sub: "à émettre",
      icon: AlertCircle,
      variant: stats.countBrouillon > 0 ? ("warning" as const) : ("default" as const),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturation honoraires"
        description={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/facturation/new">
            <Button size="sm" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </Link>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Aging panel — only if there are overdue */}
      {(stats.aging.warning > 0 || stats.aging.critical > 0) && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Analyse des retards</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-muted-foreground">0–30j :</span>
              <span className="font-semibold text-amber-600">{stats.aging.warning} facture{stats.aging.warning !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="text-muted-foreground">&gt; 30j :</span>
              <span className="font-semibold text-red-600">{stats.aging.critical} facture{stats.aging.critical !== 1 ? "s" : ""}</span>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              Montant total en retard : {stats.overdueAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>
        </div>
      )}

      <FacturationTable data={invoices} />
    </div>
  )
}
