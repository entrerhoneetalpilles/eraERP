import Link from "next/link"
import { getDashboardStats } from "@/lib/dal/stats"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, Building2, CalendarDays, TrendingUp } from "lucide-react"

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
        <h1 className="text-2xl font-semibold text-garrigue-900">Tableau de bord</h1>
        <p className="text-sm text-garrigue-500 mt-1">
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
            className="bg-white rounded-xl border border-garrigue-100 p-5 hover:shadow-soft transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-garrigue-500">{label}</p>
                <p className="text-2xl font-semibold text-garrigue-900 mt-1">{value}</p>
              </div>
              <div className="p-2 bg-calcaire-100 rounded-lg">
                <Icon className="w-5 h-5 text-garrigue-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Check-ins à venir */}
      {stats.upcomingCheckIns.length > 0 && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Check-ins à venir (7 jours)
          </h2>
          <div className="space-y-2">
            {stats.upcomingCheckIns.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-garrigue-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-garrigue-500">
                    {booking.property.nom} — {booking.nb_nuits} nuit{booking.nb_nuits > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-garrigue-700">
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
