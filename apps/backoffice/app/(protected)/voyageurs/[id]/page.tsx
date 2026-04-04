import { notFound } from "next/navigation"
import Link from "next/link"
import { getGuestById } from "@/lib/dal/guests"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function GuestDetailPage({ params }: { params: { id: string } }) {
  const guest = await getGuestById(params.id)
  if (!guest) notFound()

  return (
    <div className="space-y-6">
      <PageHeader title={`${guest.prenom} ${guest.nom}`} />
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Informations</h2>
        <div className="space-y-3 text-sm">
          {guest.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{guest.email}</span></div>}
          {guest.telephone && <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{guest.telephone}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Langue</span><span className="uppercase">{guest.langue}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total séjours</span><span className="font-semibold">{guest.nb_sejours}</span></div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Historique des séjours</h2>
        {guest.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun séjour</p>
        ) : (
          <div className="space-y-2">
            {guest.bookings.map((booking) => (
              <Link key={booking.id} href={`/reservations/${booking.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{booking.property.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR")} → {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits} nuits)
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.statut} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
