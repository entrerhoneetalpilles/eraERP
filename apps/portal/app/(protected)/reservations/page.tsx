import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerBookings } from "@/lib/dal/reservations"
import { CalendarCheck, Building2, Users, Moon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

const STATUT_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmée", CHECKEDIN: "En cours",
  CHECKEDOUT: "Terminée", CANCELLED: "Annulée", NO_SHOW: "Non présenté",
}
const STATUT_COLORS: Record<string, string> = {
  PENDING: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED: "text-blue-700 bg-blue-50 border-blue-200",
  CHECKEDIN: "text-emerald-700 bg-emerald-50 border-emerald-200",
  CHECKEDOUT: "text-garrigue-500 bg-garrigue-50 border-argile-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
  NO_SHOW: "text-garrigue-400 bg-garrigue-50 border-argile-200",
}

export default async function ReservationsPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const bookings = await getOwnerBookings(session.user.ownerId as string)

  const active = bookings.filter(b => ["CONFIRMED", "CHECKEDIN", "PENDING"].includes(b.statut))
  const past = bookings.filter(b => ["CHECKEDOUT", "CANCELLED", "NO_SHOW"].includes(b.statut))

  const BookingCard = ({ b }: { b: (typeof bookings)[0] }) => (
    <div className="bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/40">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-garrigue-900 font-light leading-tight">
            {b.guest.prenom} {b.guest.nom}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Building2 size={12} className="text-garrigue-400 shrink-0" />
            <p className="text-xs text-garrigue-400 truncate">{b.property.nom}</p>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUT_COLORS[b.statut] ?? "bg-muted"}`}>
          {STATUT_LABELS[b.statut] ?? b.statut}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-garrigue-50/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-garrigue-400 mb-0.5">Arrivée</p>
          <p className="text-xs font-semibold text-garrigue-800">{format(new Date(b.check_in), "d MMM", { locale: fr })}</p>
        </div>
        <div className="bg-garrigue-50/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-garrigue-400 mb-0.5">Départ</p>
          <p className="text-xs font-semibold text-garrigue-800">{format(new Date(b.check_out), "d MMM", { locale: fr })}</p>
        </div>
        <div className="bg-garrigue-50/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-garrigue-400 mb-0.5">Durée</p>
          <p className="text-xs font-semibold text-garrigue-800">{b.nb_nuits} nuit{b.nb_nuits > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-argile-100">
        <div className="flex items-center gap-3 text-xs text-garrigue-400">
          <span className="flex items-center gap-1"><Users size={11} /> {b.nb_voyageurs} voy.</span>
          <span className="flex items-center gap-1"><Moon size={11} /> {b.platform}</span>
        </div>
        <p className="font-serif text-base text-garrigue-900 font-light">{fmt(b.revenu_net_proprietaire)}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl animate-fade-up">
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Réservations.</h1>
        <p className="text-sm text-garrigue-400 mt-1">{bookings.length} réservation{bookings.length !== 1 ? "s" : ""} au total</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <CalendarCheck size={40} strokeWidth={1.2} />
          <p className="text-sm">Aucune réservation</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-garrigue-400">En cours & à venir</h2>
              {active.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-garrigue-400">Historique</h2>
              {past.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
