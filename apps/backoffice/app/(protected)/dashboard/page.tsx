import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Users,
  Building2,
  CalendarDays,
  TrendingUp,
  LogIn,
  LogOut,
  SprayCan,
  ArrowUpRight,
} from "lucide-react"

const KPI_CONFIG = [
  {
    key: "totalOwners" as const,
    label: "Propriétaires",
    icon: Users,
    href: "/proprietaires",
    colorClass: "bg-violet-50 text-violet-600",
  },
  {
    key: "totalProperties" as const,
    label: "Biens actifs",
    icon: Building2,
    href: "/biens",
    colorClass: "bg-blue-50 text-blue-600",
  },
  {
    key: "activeBookings" as const,
    label: "Réservations actives",
    icon: CalendarDays,
    href: "/reservations",
    colorClass: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "revenuMoisCourant" as const,
    label: "Revenus ce mois",
    icon: TrendingUp,
    href: "/comptabilite",
    colorClass: "bg-emerald-50 text-emerald-600",
    format: (v: number) =>
      v.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
  },
]

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, href, colorClass, format }) => {
          const raw = stats[key] as number
          const value = format ? format(raw) : raw
          return (
            <Link
              key={label}
              href={href}
              className="group bg-card rounded-md border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2 tabular-nums">
                    {value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>Voir détails</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Opérations du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Arrivées */}
        <OpsCard
          title="Arrivées aujourd'hui"
          count={stats.todayArrivals.length}
          icon={<LogIn className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          empty="Aucune arrivée"
        >
          {stats.todayArrivals.map((b: any) => (
            <BookingRow
              key={b.id}
              href={`/reservations/${b.id}`}
              name={`${b.guest.prenom} ${b.guest.nom}`}
              sub={b.property.nom}
              statut={b.statut}
            />
          ))}
        </OpsCard>

        {/* Départs */}
        <OpsCard
          title="Départs aujourd'hui"
          count={stats.todayDepartures.length}
          icon={<LogOut className="w-4 h-4 text-orange-500" />}
          iconBg="bg-orange-50"
          empty="Aucun départ"
        >
          {stats.todayDepartures.map((b: any) => (
            <BookingRow
              key={b.id}
              href={`/reservations/${b.id}`}
              name={`${b.guest.prenom} ${b.guest.nom}`}
              sub={b.property.nom}
              statut={b.statut}
            />
          ))}
        </OpsCard>

        {/* Ménages */}
        <OpsCard
          title="Ménages en attente"
          count={stats.pendingCleanings.length}
          icon={<SprayCan className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
          empty="Aucun ménage en attente"
          viewAllHref={stats.pendingCleanings.length > 5 ? "/menage" : undefined}
          viewAllCount={stats.pendingCleanings.length}
        >
          {stats.pendingCleanings.slice(0, 5).map((ct) => (
            <BookingRow
              key={ct.id}
              href={`/menage/${ct.id}`}
              name={ct.property.nom}
              sub={`${ct.contractor ? ct.contractor.nom : "Non assigné"} — ${new Date(ct.date_prevue).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
              statut={ct.statut}
            />
          ))}
        </OpsCard>
      </div>

      {/* Check-ins à venir */}
      {stats.upcomingCheckIns.length > 0 && (
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-md">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Check-ins à venir
              </h2>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              7 prochains jours
            </span>
          </div>
          <div className="divide-y divide-border">
            {stats.upcomingCheckIns.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent transition-colors duration-100 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.property.nom} — {booking.nb_nuits} nuit
                    {booking.nb_nuits > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <StatusBadge status={booking.statut} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function OpsCard({
  title,
  count,
  icon,
  iconBg,
  empty,
  children,
  viewAllHref,
  viewAllCount,
}: {
  title: string
  count: number
  icon: React.ReactNode
  iconBg: string
  empty: string
  children: React.ReactNode
  viewAllHref?: string
  viewAllCount?: number
}) {
  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className={`p-1.5 rounded-md ${iconBg}`}>{icon}</div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
          {count}
        </span>
      </div>
      <div className="px-2 py-1.5">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{empty}</p>
        ) : (
          <>
            {children}
            {viewAllHref && viewAllCount && viewAllCount > 5 && (
              <Link
                href={viewAllHref}
                className="block text-xs text-primary hover:underline px-3 pt-2 pb-1 cursor-pointer"
              >
                Voir tout ({viewAllCount})
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BookingRow({
  href,
  name,
  sub,
  statut,
}: {
  href: string
  name: string
  sub: string
  statut: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer"
    >
      <div className="min-w-0 mr-3">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <StatusBadge status={statut} />
    </Link>
  )
}

