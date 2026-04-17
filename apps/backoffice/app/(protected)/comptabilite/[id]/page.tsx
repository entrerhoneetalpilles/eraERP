import { notFound } from "next/navigation"
import Link from "next/link"
import { getComptabiliteDetail } from "@/lib/dal/comptes"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  ArrowLeft, Receipt, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown, FileText, ArrowUpRight, Download,
} from "lucide-react"
import { ExportCsvButton } from "./export-csv-button"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

const STATUT_COLORS: Record<string, string> = {
  BROUILLON: "text-muted-foreground bg-muted border-border",
  EMISE: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  PAYEE: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  AVOIR: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
}

export default async function ComptabiliteDetailPage({ params }: { params: { id: string } }) {
  const data = await getComptabiliteDetail(params.id)
  if (!data) notFound()
  const { owner, kpis } = data

  const now = new Date()
  const evolution = kpis.honorairesMoisPrec > 0
    ? Math.round(((kpis.honorairesCeMois - kpis.honorairesMoisPrec) / kpis.honorairesMoisPrec) * 100)
    : null

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/comptabilite" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" />Honoraires
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-base font-semibold text-foreground">{owner.nom}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/proprietaires/${owner.id}`} className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />Voir propriétaire
          </Link>
          <Link href={`/facturation?owner=${owner.id}`} className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" />Factures
          </Link>
          <ExportCsvButton accountId={owner.id} ownerNom={owner.nom} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" />Total facturé HT</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(kpis.totalHT)}</p>
        </div>
        <div className={`rounded-lg border p-4 ${kpis.encaisseTTC > 0 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-card border-border"}`}>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Encaissé TTC</p>
          <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(kpis.encaisseTTC)}</p>
        </div>
        <div className={`rounded-lg border p-4 ${kpis.enRetardTTC > 0 ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : kpis.enAttenteTTC > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />En attente TTC</p>
          <p className={`text-2xl font-bold tabular-nums ${kpis.enRetardTTC > 0 ? "text-red-600 dark:text-red-400" : kpis.enAttenteTTC > 0 ? "text-amber-600" : "text-foreground"}`}>{fmt(kpis.enAttenteTTC)}</p>
          {kpis.enRetardTTC > 0 && <p className="text-xs text-red-500 mt-0.5">dont {fmt(kpis.enRetardTTC)} en retard</p>}
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Honoraires ce mois HT</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(kpis.honorairesCeMois)}</p>
          {evolution !== null && (
            <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${evolution >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {evolution >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {evolution >= 0 ? "+" : ""}{evolution}% vs mois préc.
            </p>
          )}
        </div>
      </div>

      {/* Mandats actifs */}
      {owner.mandates.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mandats actifs</p>
          <div className="flex flex-wrap gap-2">
            {owner.mandates.map(m => (
              <Link key={m.id} href={`/mandats/${m.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-accent border border-border text-sm cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground">{m.property.nom}</span>
                <span className="text-muted-foreground text-xs">{m.taux_honoraires}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Factures */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Factures d&apos;honoraires</p>
          <span className="text-xs text-muted-foreground">{owner.feeInvoices.length} facture{owner.feeInvoices.length !== 1 ? "s" : ""}</span>
        </div>
        {owner.feeInvoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Aucune facture</p>
        ) : (
          <div className="divide-y divide-border">
            {owner.feeInvoices.map(inv => {
              const isOverdue = inv.statut === "EMISE" && inv.date_echeance && new Date(inv.date_echeance) < now
              return (
                <Link
                  key={inv.id}
                  href={`/facturation/${inv.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-foreground">{inv.numero_facture}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[inv.statut] ?? ""}`}>{inv.statut}</span>
                      {isOverdue && <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">RETARD</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inv.objet ?? `Période ${fmtDate(inv.periode_debut)} → ${fmtDate(inv.periode_fin)}`}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">HT</p>
                      <p className="text-sm font-semibold tabular-nums">{fmt(inv.montant_ht)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">TTC</p>
                      <p className="text-sm font-semibold tabular-nums">{fmt(inv.montant_ttc)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{inv.date_paiement ? "Payée le" : inv.date_echeance ? "Échéance" : "Émise le"}</p>
                      <p className={`text-sm tabular-nums ${isOverdue ? "text-red-600 font-semibold" : "text-foreground"}`}>
                        {inv.date_paiement
                          ? fmtDate(inv.date_paiement)
                          : inv.date_echeance
                            ? fmtDate(inv.date_echeance)
                            : fmtDate(inv.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Taux de recouvrement */}
      {owner.feeInvoices.filter(i => i.statut !== "BROUILLON").length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Recouvrement</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${kpis.tauxRecouvrement >= 80 ? "bg-emerald-500" : kpis.tauxRecouvrement >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, kpis.tauxRecouvrement)}%` }}
              />
            </div>
            <span className={`text-sm font-bold tabular-nums w-12 text-right ${kpis.tauxRecouvrement >= 80 ? "text-emerald-600" : kpis.tauxRecouvrement >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {kpis.tauxRecouvrement}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {fmt(kpis.encaisseTTC)} encaissé sur {fmt(kpis.totalHT * (1 + (owner.feeInvoices[0]?.tva_rate ?? 0.2)))} facturé TTC
          </p>
        </div>
      )}
    </div>
  )
}
