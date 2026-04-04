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

      <div className="bg-card rounded-md border border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informations</p>
        <div>
          {guest.email && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground font-medium">{guest.email}</span>
            </div>
          )}
          {guest.telephone && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Téléphone</span>
              <span className="text-sm text-foreground font-medium">{guest.telephone}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Langue</span>
            <span className="text-sm text-foreground font-medium uppercase">{guest.langue}</span>
          </div>
          <div className="flex items-center justify-between py-2 last:border-0">
            <span className="text-sm text-muted-foreground">Total séjours</span>
            <span className="text-sm text-foreground font-semibold">{guest.nb_sejours}</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-md border border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Historique des séjours</p>
        {guest.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun séjour</p>
        ) : (
          <div className="space-y-0.5">
            {guest.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer"
              >
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
