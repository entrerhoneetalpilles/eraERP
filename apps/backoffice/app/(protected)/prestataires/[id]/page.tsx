import { notFound } from "next/navigation"
import Link from "next/link"
import { getPrestataireById, getPrestataireStats } from "@/lib/dal/prestataires"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import {
  Edit, AlertTriangle, Phone, Mail, Building, Shield, ShieldAlert,
  ShieldCheck, ShieldOff, Star, TrendingUp, Wrench, SprayCan, Euro, MapPin, Timer,
} from "lucide-react"

function fmt(n: number) { return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) }
function fmtDate(d: Date | string | null | undefined) { return d ? new Date(d).toLocaleDateString("fr-FR") : "—" }

function InsuranceBadge({ date, label }: { date: Date | null | undefined; label: string }) {
  const now = new Date()
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  if (!date) return <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><ShieldOff className="w-4 h-4 text-slate-400" /><span>{label} : non renseignée</span></div>
  const d = new Date(date)
  if (d < now) return <div className="flex items-center gap-1.5 text-sm text-red-600"><ShieldAlert className="w-4 h-4" /><span>{label} : {fmtDate(date)} — <strong>EXPIRÉE</strong></span></div>
  if (d <= in60) return <div className="flex items-center gap-1.5 text-sm text-amber-600"><Shield className="w-4 h-4" /><span>{label} : {fmtDate(date)} — <strong>Expire bientôt</strong></span></div>
  return <div className="flex items-center gap-1.5 text-sm text-emerald-600"><ShieldCheck className="w-4 h-4" /><span>{label} : {fmtDate(date)}</span></div>
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}</span>
    </span>
  )
}

export default async function PrestataireDetailPage({ params }: { params: { id: string } }) {
  const [prestataire, stats] = await Promise.all([getPrestataireById(params.id), getPrestataireStats(params.id)])
  if (!prestataire) notFound()

  const now = new Date()
  const hasInsuranceAlert =
    (prestataire.assurance_rc_pro && new Date(prestataire.assurance_rc_pro) < now) ||
    (prestataire.assurance_decennale && new Date(prestataire.assurance_decennale) < now)

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{prestataire.nom[0]}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{prestataire.nom}</h1>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{prestataire.metier}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prestataire.actif ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>{prestataire.actif ? "Actif" : "Inactif"}</span>
              {hasInsuranceAlert && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded-full border border-red-200"><AlertTriangle className="w-3 h-3" />Assurance expirée</span>}
            </div>
          </div>
        </div>
        <Link href={`/prestataires/${prestataire.id}/edit`}>
          <Button size="sm" variant="outline" className="cursor-pointer gap-1.5"><Edit className="w-3.5 h-3.5" />Modifier</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "CA total", value: fmt(stats.totalCA), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Travaux réalisés", value: `${stats.nbTravauxTermines}/${stats.nbTravaux}`, icon: Wrench, color: "text-orange-600" },
          { label: "Ménages réalisés", value: `${stats.nbMenagesTermines}/${stats.nbMenages}`, icon: SprayCan, color: "text-blue-600" },
          { label: "Problèmes", value: `${stats.nbProblemes}`, icon: AlertTriangle, color: stats.nbProblemes > 3 ? "text-red-600" : "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground">{label}</span><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Contact</p>
            <div className="space-y-2.5">
              {prestataire.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><a href={`mailto:${prestataire.email}`} className="text-primary hover:underline truncate">{prestataire.email}</a></div>}
              {prestataire.telephone && <div className="flex items-center gap-2 text-sm"><Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><a href={`tel:${prestataire.telephone}`} className="text-foreground hover:text-primary">{prestataire.telephone}</a></div>}
              {prestataire.siret && <div className="flex items-center gap-2 text-sm"><Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="font-mono text-xs text-foreground">{prestataire.siret}</span></div>}
              {(prestataire as any).zone_intervention && <div className="flex items-center gap-2 text-sm"><MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-foreground">{(prestataire as any).zone_intervention}</span></div>}
              {(prestataire as any).delai_intervention_h && <div className="flex items-center gap-2 text-sm"><Timer className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-foreground">Délai d&apos;intervention : {(prestataire as any).delai_intervention_h}h</span></div>}
            </div>
          </div>

          {((prestataire as any).tarif_horaire || (prestataire as any).tarif_forfait_menage) && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Tarifs</p>
              <div className="space-y-2">
                {(prestataire as any).tarif_horaire != null && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-1"><Euro className="w-3.5 h-3.5" />Horaire</span><span className="font-semibold">{(prestataire as any).tarif_horaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/h</span></div>}
                {(prestataire as any).tarif_forfait_menage != null && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-1"><SprayCan className="w-3.5 h-3.5" />Forfait ménage</span><span className="font-semibold">{(prestataire as any).tarif_forfait_menage.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span></div>}
              </div>
            </div>
          )}

          <div className={`rounded-lg border p-5 ${hasInsuranceAlert ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : "bg-card border-border"}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Assurances</p>
            <div className="space-y-2">
              <InsuranceBadge date={prestataire.assurance_rc_pro} label="RC Pro" />
              <InsuranceBadge date={prestataire.assurance_decennale} label="Décennale" />
            </div>
          </div>

          {(stats.avgNote != null || stats.avgDureeMinutes != null) && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Performance</p>
              <div className="space-y-2">
                {stats.avgNote != null && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Qualité moy.</span><Stars value={stats.avgNote} /></div>}
                {stats.avgDureeMinutes != null && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Durée moy.</span><span className="font-semibold">{Math.round(stats.avgDureeMinutes)} min</span></div>}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border"><span className="text-muted-foreground">CA ménage</span><span className="font-semibold">{fmt(stats.totalCA_menage)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">CA travaux</span><span className="font-semibold">{fmt(stats.totalCA_travaux)}</span></div>
              </div>
            </div>
          )}

          {prestataire.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Notes internes</p>
              <p className="text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap">{prestataire.notes}</p>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-4">
          {prestataire.cleaningTasks.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ménages récents</p>
                <span className="text-xs text-muted-foreground">{prestataire.cleaningTasks.length} total</span>
              </div>
              <div className="space-y-0.5">
                {prestataire.cleaningTasks.slice(0, 12).map(ct => (
                  <Link key={ct.id} href={`/menage/${ct.id}`} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ct.property.nom}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ct.date_prevue).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(ct as any).note_qualite != null && <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs">{(ct as any).note_qualite.toFixed(1)}</span></div>}
                      {(ct as any).montant != null && <span className="text-xs text-muted-foreground">{(ct as any).montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}
                      <StatusBadge status={ct.statut} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {prestataire.workOrders.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ordres de travaux récents</p>
                <span className="text-xs text-muted-foreground">{prestataire.workOrders.length} total</span>
              </div>
              <div className="space-y-0.5">
                {prestataire.workOrders.slice(0, 12).map(wo => (
                  <Link key={wo.id} href={`/travaux/${wo.id}`} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{wo.titre}</p>
                      <p className="text-xs text-muted-foreground">{wo.property.nom} · {new Date(wo.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {wo.montant_devis != null && <span className="text-xs text-muted-foreground">{wo.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}
                      <StatusBadge status={wo.statut} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
