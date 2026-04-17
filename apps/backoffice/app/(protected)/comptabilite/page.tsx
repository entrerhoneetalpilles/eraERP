import Link from "next/link"
import { getComptabiliteList } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Receipt, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from "lucide-react"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export default async function ComptabilitePage() {
  const { rows, totaux } = await getComptabiliteList()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Honoraires"
        description={`Suivi facturation par propriétaire — ${totaux.nbOwners} client${totaux.nbOwners !== 1 ? "s" : ""}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total facturé HT", value: fmt(totaux.totalHT), icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Total encaissé TTC", value: fmt(totaux.encaisseTTC), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "En attente de règlement", value: fmt(totaux.enAttenteTTC), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "En retard", value: fmt(totaux.enRetardTTC), icon: AlertCircle, color: totaux.enRetardTTC > 0 ? "text-red-600" : "text-muted-foreground", bg: totaux.enRetardTTC > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-muted" },
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

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Par propriétaire</p>
          <span className="text-xs text-muted-foreground">{rows.length} entrée{rows.length !== 1 ? "s" : ""}</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Aucune facture émise</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(row => (
              <Link
                key={row.id}
                href={`/comptabilite/${row.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{row.owner.nom}</p>
                  <p className="text-xs text-muted-foreground truncate">{row.owner.email}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Facturé HT</p>
                    <p className="font-semibold tabular-nums">{fmt(row.totalHT)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Encaissé TTC</p>
                    <p className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(row.encaisseTTC)}</p>
                  </div>
                  {row.enAttenteTTC > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">En attente</p>
                      <p className={`font-semibold tabular-nums ${row.enRetardTTC > 0 ? "text-red-600" : "text-amber-600"}`}>{fmt(row.enAttenteTTC)}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{row.nbFactures} facture{row.nbFactures !== 1 ? "s" : ""}</span>
                    {row.nbEnAttente > 0 && (
                      <span className="text-[10px] font-bold text-white bg-amber-500 rounded-full px-1.5 py-0.5">{row.nbEnAttente}</span>
                    )}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
