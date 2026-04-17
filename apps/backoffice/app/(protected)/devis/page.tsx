import Link from "next/link"
import { getDevis, getDevisStats } from "@/lib/dal/devis"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

export default async function DevisPage({
  searchParams,
}: {
  searchParams: { statut?: string }
}) {
  const statut = (searchParams.statut as any) || "all"
  const [devisList, stats] = await Promise.all([
    getDevis({ statut: statut === "all" ? undefined : statut }),
    getDevisStats(),
  ])

  const STATUT_TABS = [
    { value: "all", label: "Tous", count: stats.total },
    { value: "EN_ATTENTE_VALIDATION", label: "À valider", count: stats.aValider },
    { value: "VALIDE", label: "Validés", count: stats.valides },
    { value: "EN_ATTENTE_DEVIS", label: "En attente", count: stats.enAttente },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devis"
        description="Devis et demandes d'approbation propriétaires"
        actions={
          <Link href="/devis/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Button>
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total actifs</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
        </div>
        <div className="bg-card border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">À valider</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-amber-600">{stats.aValider}</p>
        </div>
        <div className="bg-card border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Validés</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600">{stats.valides}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Montant total</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{fmt(stats.montantTotal)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUT_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/devis?statut=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              statut === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full tabular-nums">{tab.count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {devisList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Aucun devis</p>
        ) : (
          <div className="divide-y divide-border">
            {devisList.map((d) => {
              const owner = d.property.mandate?.owner
              return (
                <Link
                  key={d.id}
                  href={`/devis/${d.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{d.titre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {d.property.nom}
                      {owner ? ` · ${owner.nom}` : ""}
                      {d.contractor ? ` · ${d.contractor.nom}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {d.type} · {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <p className="text-sm font-semibold tabular-nums">
                      {d.montant_devis != null ? fmt(d.montant_devis) : "—"}
                    </p>
                    <StatusBadge status={d.statut} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
