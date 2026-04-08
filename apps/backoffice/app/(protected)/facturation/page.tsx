import Link from "next/link"
import { getFeeInvoices } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { FacturationTable } from "./facturation-table"

export default async function FacturationPage() {
  const invoices = await getFeeInvoices()

  const totalHT = invoices.reduce((s, i) => s + i.montant_ht, 0)
  const totalTTC = invoices.reduce((s, i) => s + i.montant_ttc, 0)
  const totalPaye = invoices.filter((i) => i.statut === "PAYEE").reduce((s, i) => s + i.montant_ttc, 0)
  const totalEmis = invoices.filter((i) => i.statut === "EMISE").reduce((s, i) => s + i.montant_ttc, 0)
  const countBrouillon = invoices.filter((i) => i.statut === "BROUILLON").length
  const countEmis = invoices.filter((i) => i.statut === "EMISE").length

  const kpis = [
    {
      label: "Total TTC facturé",
      value: totalTTC.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${totalHT.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} HT`,
      icon: TrendingUp,
    },
    {
      label: "En attente de paiement",
      value: totalEmis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${countEmis} facture${countEmis !== 1 ? "s" : ""} émise${countEmis !== 1 ? "s" : ""}`,
      icon: Clock,
      highlight: countEmis > 0,
    },
    {
      label: "Encaissé",
      value: totalPaye.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
      sub: `${invoices.filter((i) => i.statut === "PAYEE").length} facture${invoices.filter((i) => i.statut === "PAYEE").length !== 1 ? "s" : ""} payée${invoices.filter((i) => i.statut === "PAYEE").length !== 1 ? "s" : ""}`,
      icon: CheckCircle,
    },
    {
      label: "Brouillons",
      value: String(countBrouillon),
      sub: "à émettre",
      icon: AlertCircle,
      highlight: countBrouillon > 0,
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

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-card rounded-md border p-4 space-y-1 ${kpi.highlight ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <kpi.icon className={`w-4 h-4 ${kpi.highlight ? "text-amber-500" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-xl font-semibold ${kpi.highlight ? "text-amber-600" : "text-foreground"}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <FacturationTable data={invoices} />
    </div>
  )
}
