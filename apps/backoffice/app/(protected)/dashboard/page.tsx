import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Users, Building2, CalendarDays, TrendingUp, LogIn, LogOut,
  SprayCan, ArrowUpRight, AlertTriangle, AlertCircle, Info,
  Wrench, Star, BarChart2, Activity, Receipt, Clock,
} from "lucide-react"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

const KPI_CONFIG = [
  { key: "totalOwners" as const, label: "Propriétaires", icon: Users, href: "/proprietaires", colorClass: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" },
  { key: "totalProperties" as const, label: "Biens actifs", icon: Building2, href: "/biens", colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  { key: "activeBookings" as const, label: "Réservations actives", icon: CalendarDays, href: "/reservations", colorClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
  { key: "honorairesMoisCourant" as const, label: "Honoraires ce mois", icon: TrendingUp, href: "/facturation", colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400", format: (v: number) => fmt(v) },
  { key: "pendingTravaux" as const, label: "Travaux ouverts", icon: Wrench, href: "/travaux", colorClass: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
]

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-1.5">
          {stats.alerts.map((alert: any) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {KPI_CONFIG.map(({ key, label, icon: Icon, href, colorClass, format }) => {
          const raw = stats[key] as number
          const value = format ? format(raw) : raw
          return (
            <Link key={label} href={href} className="group bg-card rounded-lg border border-border p-4 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{value}</p>
                </div>
                <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}><Icon className="w-4 h-4" /></div>
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>Voir détails</span><ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Facturation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/facturation" className="group bg-card rounded-lg border border-border p-4 hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Honoraires ce mois HT</p>
              <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{fmt(stats.honorairesMoisCourant)}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">Facturés (émis + payés) <ArrowUpRight className="w-3 h-3" /></p>
        </Link>
        <Link href="/facturation?statut=EMISE" className="group bg-card rounded-lg border border-border p-4 hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">En attente de règlement</p>
              <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{fmt(stats.honorairesEnAttente)}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">Factures émises TTC <ArrowUpRight className="w-3 h-3" /></p>
        </Link>
        <Link href="/facturation" className={`group bg-card rounded-lg border p-4 hover:border-primary/40 transition-colors cursor-pointer ${stats.honorairesEnRetard > 0 ? "border-red-200 dark:border-red-800" : "border-border"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">En retard de paiement</p>
              <p className={`text-2xl font-bold mt-1.5 tabular-nums ${stats.honorairesEnRetard > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>{fmt(stats.honorairesEnRetard)}</p>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${stats.honorairesEnRetard > 0 ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">Échéance dépassée TTC <ArrowUpRight className="w-3 h-3" /></p>
        </Link>
      </div>

      {/* Revenue trend + Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Honoraires HT — 6 derniers mois</h2>
            </div>
          </div>
          <div className="flex items-end gap-2 h-28">
            {stats.monthlyHonorairesTrend.map((m: any, i: number) => {
              const maxH = Math.max(...stats.monthlyHonorairesTrend.map((x: any) => x.montant), 1)
              const height = maxH > 0 ? Math.max(4, Math.round((m.montant / maxH) * 100)) : 4
              const isLast = i === stats.monthlyHonorairesTrend.length - 1
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group" title={fmt(m.montant)}>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{fmt(m.montant)}</span>
                  <div className={`w-full rounded-t-md ${isLast ? "bg-emerald-500" : "bg-emerald-500/30"}`} style={{ height: `${height}%` }} />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Taux d&apos;occupation — 30 jours</h2>
          </div>
          {stats.occupancy.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun bien actif</p>
          ) : (
            <div className="space-y-2.5">
              {stats.occupancy.slice(0, 6).map((p: any) => (
                <Link key={p.id} href={`/biens/${p.id}`} className="block group">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-foreground truncate max-w-[60%] group-hover:text-primary transition-colors">{p.nom}</span>
                    <span className="text-xs font-semibold tabular-nums">{p.taux}% <span className="text-muted-foreground font-normal">({p.nbNuits}j)</span></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${p.taux >= 70 ? "bg-emerald-500" : p.taux >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${p.taux}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opérations du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OpsCard title="Arrivées aujourd'hui" count={stats.todayArrivals.length} icon={<LogIn className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" empty="Aucune arrivée">
          {stats.todayArrivals.map((b: any) => <BookingRow key={b.id} href={`/reservations/${b.id}`} name={`${b.guest.prenom} ${b.guest.nom}`} sub={b.property.nom} statut={b.statut} />)}
        </OpsCard>
        <OpsCard title="Départs aujourd'hui" count={stats.todayDepartures.length} icon={<LogOut className="w-4 h-4 text-orange-500" />} iconBg="bg-orange-50 dark:bg-orange-900/20" empty="Aucun départ">
          {stats.todayDepartures.map((b: any) => <BookingRow key={b.id} href={`/reservations/${b.id}`} name={`${b.guest.prenom} ${b.guest.nom}`} sub={b.property.nom} statut={b.statut} />)}
        </OpsCard>
        <OpsCard title="Ménages en attente" count={stats.pendingCleanings.length} icon={<SprayCan className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-50 dark:bg-blue-900/20" empty="Aucun ménage en attente" viewAllHref={stats.pendingCleanings.length > 5 ? "/menage" : undefined} viewAllCount={stats.pendingCleanings.length}>
          {stats.pendingCleanings.slice(0, 5).map((ct: any) => (
            <BookingRow key={ct.id} href={`/menage/${ct.id}`} name={ct.property.nom} sub={`${ct.contractor ? ct.contractor.nom : "Non assigné"} — ${new Date(ct.date_prevue).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`} statut={ct.statut} />
          ))}
        </OpsCard>
      </div>

      {/* Upcoming + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stats.upcomingCheckIns.length > 0 && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md"><CalendarDays className="w-4 h-4 text-indigo-600" /></div>
                <h2 className="text-sm font-semibold text-foreground">Check-ins à venir</h2>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">7 jours</span>
            </div>
            <div className="divide-y divide-border">
              {stats.upcomingCheckIns.map((booking: any) => (
                <Link key={booking.id} href={`/reservations/${booking.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-accent transition-colors duration-100 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.guest.prenom} {booking.guest.nom}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{booking.property.nom} — {booking.nb_nuits} nuit{booking.nb_nuits > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground tabular-nums">{new Date(booking.check_in).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</p>
                    <StatusBadge status={booking.statut} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Accès rapides</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/reservations/new", label: "Nouvelle réservation", icon: CalendarDays, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" },
              { href: "/facturation/new", label: "Nouvelle facture", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
              { href: "/travaux/new", label: "Ordre de travaux", icon: Wrench, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
              { href: "/planning", label: "Planning mensuel", icon: CalendarDays, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-colors cursor-pointer">
                <div className={`p-1.5 rounded-md ${color}`}><Icon className="w-3.5 h-3.5" /></div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertBanner({ alert }: { alert: { id: string; severity: "critical" | "warning" | "info"; message: string; href?: string } }) {
  const styles = {
    critical: { container: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400", icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> },
    warning: { container: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400", icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" /> },
    info: { container: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400", icon: <Info className="w-3.5 h-3.5 shrink-0" /> },
  }
  const s = styles[alert.severity]
  const content = (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${s.container}`}>
      {s.icon}
      <span>{alert.message}</span>
      {alert.href && <ArrowUpRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />}
    </div>
  )
  return alert.href ? <Link href={alert.href} className="block">{content}</Link> : content
}

function OpsCard({ title, count, icon, iconBg, empty, children, viewAllHref, viewAllCount }: {
  title: string; count: number; icon: React.ReactNode; iconBg: string; empty: string; children: React.ReactNode; viewAllHref?: string; viewAllCount?: number
}) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className={`p-1.5 rounded-md ${iconBg}`}>{icon}</div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">{count}</span>
      </div>
      <div className="px-2 py-1.5">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{empty}</p>
        ) : (
          <>
            {children}
            {viewAllHref && viewAllCount && viewAllCount > 5 && (
              <Link href={viewAllHref} className="block text-xs text-primary hover:underline px-3 pt-2 pb-1 cursor-pointer">Voir tout ({viewAllCount})</Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BookingRow({ href, name, sub, statut }: { href: string; name: string; sub: string; statut: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer">
      <div className="min-w-0 mr-3">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <StatusBadge status={statut} />
    </Link>
  )
}
