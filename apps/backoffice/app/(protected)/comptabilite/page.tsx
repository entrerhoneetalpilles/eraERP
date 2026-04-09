import Link from "next/link"
import { getMandantAccounts } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { ComptesTable } from "./comptes-table"
import { TrendingUp, Wallet, CreditCard, Clock } from "lucide-react"

export default async function ComptabilitePage() {
  const { accounts, totalSolde, totalSequestre } = await getMandantAccounts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptabilité mandant"
        description={`${accounts.length} compte${accounts.length !== 1 ? "s" : ""} mandant`}
      />

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Solde total (tous comptes)", value: totalSolde.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }), icon: Wallet, color: totalSolde >= 0 ? "text-emerald-600" : "text-red-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Séquestre total", value: totalSequestre.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Comptes actifs", value: String(accounts.filter(a => a.solde_courant !== 0 || (a as any)._count.transactions > 0).length), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Comptes positifs", value: String(accounts.filter(a => a.solde_courant > 0).length), icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className={`p-1.5 rounded-md ${bg}`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
            </div>
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <ComptesTable data={accounts} />
    </div>
  )
}
