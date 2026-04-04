import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, Building2, CalendarDays, TrendingUp, LogIn, LogOut, SprayCan } from "lucide-react"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const KPI_CARDS = [
    {
      label: "Propriétaires",
      value: stats.totalOwners,
      icon: Users,
      href: "/proprietaires",
    },
    {
      label: "Biens actifs",
      value: stats.totalProperties,
      icon: Building2,
      href: "/biens",
    },
    {
      label: "Réservations actives",
      value: stats.activeBookings,
      icon: CalendarDays,
      href: "/reservations",
    },
    {
      label: "Revenus ce mois",
      value: stats.revenuMoisCourant.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
      icon: TrendingUp,
      href: "/reservations",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-card rounded-lg border p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Opérations du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Arrivées */}
        <div className="bg-card rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-green-600" />
            Arrivées aujourd'hui ({stats.todayArrivals.length})
          </h2>
          {stats.todayArrivals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune arrivée</p>
          ) : (
            <div className="space-y-2">
              {stats.todayArrivals.map((b) => (
                <Link
                  key={b.id}
                  href={`/reservations/${b.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {b.guest.prenom} {b.guest.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.property.nom}</p>
                  </div>
                  <StatusBadge status={b.statut} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Départs */}
        <div className="bg-card rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-orange-500" />
            Départs aujourd'hui ({stats.todayDepartures.length})
          </h2>
          {stats.todayDepartures.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun départ</p>
          ) : (
            <div className="space-y-2">
              {stats.todayDepartures.map((b) => (
                <Link
                  key={b.id}
                  href={`/reservations/${b.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {b.guest.prenom} {b.guest.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.property.nom}</p>
                  </div>
                  <StatusBadge status={b.statut} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ménages en attente */}
        <div className="bg-card rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <SprayCan className="w-4 h-4 text-blue-500" />
            Ménages en attente ({stats.pendingCleanings.length})
          </h2>
          {stats.pendingCleanings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun ménage en attente</p>
          ) : (
            <div className="space-y-2">
              {stats.pendingCleanings.slice(0, 5).map((ct) => (
                <Link
                  key={ct.id}
                  href={`/menage/${ct.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ct.property.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {ct.contractor ? ct.contractor.nom : "Non assigné"} —{" "}
                      {new Date(ct.date_prevue).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={ct.statut} />
                </Link>
              ))}
              {stats.pendingCleanings.length > 5 && (
                <Link href="/menage" className="text-xs text-primary hover:underline block pt-1">
                  Voir tout ({stats.pendingCleanings.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-ins à venir */}
      {stats.upcomingCheckIns.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Check-ins à venir (7 jours)
          </h2>
          <div className="space-y-2">
            {stats.upcomingCheckIns.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.property.nom} — {booking.nb_nuits} nuit{booking.nb_nuits > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
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
