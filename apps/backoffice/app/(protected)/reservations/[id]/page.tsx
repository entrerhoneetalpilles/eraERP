import { notFound } from "next/navigation"
import Link from "next/link"
import { getBookingById } from "@/lib/dal/bookings"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { BookingStatusActions } from "./status-actions"
import { Key } from "lucide-react"

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getBookingById(params.id)
  if (!booking) notFound()
  const access = booking.property.access

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${booking.guest.prenom} ${booking.guest.nom} — ${booking.property.nom}`}
        actions={<BookingStatusActions id={booking.id} statut={booking.statut} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Séjour</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-garrigue-500">Bien</span>
              <Link href={`/biens/${booking.property.id}`} className="text-olivier-600 hover:underline">{booking.property.nom}</Link>
            </div>
            <div className="flex justify-between"><span className="text-garrigue-500">Voyageur</span>
              <Link href={`/voyageurs/${booking.guest.id}`} className="text-olivier-600 hover:underline">{booking.guest.prenom} {booking.guest.nom}</Link>
            </div>
            <div className="flex justify-between"><span className="text-garrigue-500">Arrivée</span><span>{new Date(booking.check_in).toLocaleDateString("fr-FR")}</span></div>
            <div className="flex justify-between"><span className="text-garrigue-500">Départ</span><span>{new Date(booking.check_out).toLocaleDateString("fr-FR")}</span></div>
            <div className="flex justify-between"><span className="text-garrigue-500">Durée</span>
              <span>{booking.nb_nuits} nuits — {booking.nb_voyageurs} voyageur{booking.nb_voyageurs > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between"><span className="text-garrigue-500">Canal</span><span className="uppercase text-xs">{booking.platform}</span></div>
            <div className="flex justify-between"><span className="text-garrigue-500">Statut</span><StatusBadge status={booking.statut} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Finances</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-garrigue-500">Montant total</span>
              <span>{booking.montant_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between"><span className="text-garrigue-500">Frais ménage</span>
              <span>{booking.frais_menage.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between"><span className="text-garrigue-500">Commission plateforme</span>
              <span>{booking.commission_plateforme.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-garrigue-100 pt-3">
              <span className="text-garrigue-700">Revenu net propriétaire</span>
              <span className="text-garrigue-900">{booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
          </div>
        </div>
      </div>
      {access && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" />Informations d'accès
          </h2>
          <div className="space-y-3 text-sm">
            {access.code_acces && <div className="flex justify-between"><span className="text-garrigue-500">Code d'accès</span><span className="font-mono font-semibold">{access.code_acces}</span></div>}
            {access.wifi_nom && <div className="flex justify-between"><span className="text-garrigue-500">WiFi</span><span>{access.wifi_nom} / {access.wifi_mdp}</span></div>}
            {access.instructions_arrivee && (
              <div><p className="text-garrigue-500 mb-1">Instructions d'arrivée</p>
                <p className="text-garrigue-700 whitespace-pre-wrap bg-garrigue-50 rounded-lg p-3">{access.instructions_arrivee}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {booking.notes_internes && (
        <div className="bg-white rounded-xl border border-garrigue-100 p-6">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide mb-3">Notes internes</h2>
          <p className="text-sm text-garrigue-700 whitespace-pre-wrap">{booking.notes_internes}</p>
        </div>
      )}
    </div>
  )
}
