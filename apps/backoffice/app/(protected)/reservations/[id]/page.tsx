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
        actions={<BookingStatusActions id={booking.id} statut={booking.statut} guestId={booking.guest.id} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Séjour</h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Bien</span>
              <Link
                href={`/biens/${booking.property.id}`}
                className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {booking.property.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Voyageur</span>
              <Link
                href={`/voyageurs/${booking.guest.id}`}
                className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {booking.guest.prenom} {booking.guest.nom}
              </Link>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Arrivée</span>
              <span className="text-sm text-foreground font-medium">{new Date(booking.check_in).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Départ</span>
              <span className="text-sm text-foreground font-medium">{new Date(booking.check_out).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Durée</span>
              <span className="text-sm text-foreground font-medium">
                {booking.nb_nuits} nuits — {booking.nb_voyageurs} voyageur{booking.nb_voyageurs > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Canal</span>
              <span className="text-sm text-foreground font-medium uppercase">{booking.platform}</span>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={booking.statut} />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Finances</h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Montant total</span>
              <span className="text-sm text-foreground font-medium">
                {booking.montant_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Frais ménage</span>
              <span className="text-sm text-foreground font-medium">
                {booking.frais_menage.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Commission plateforme</span>
              <span className="text-sm text-foreground font-medium">
                {booking.commission_plateforme.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0 pt-3 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Revenu net propriétaire</span>
              <span className="text-sm font-semibold text-foreground">
                {booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {access && (
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Key className="w-3.5 h-3.5" />
            Informations d'accès
          </h2>
          <div>
            {access.code_acces && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Code d'accès</span>
                <span className="font-mono text-sm font-semibold text-foreground">{access.code_acces}</span>
              </div>
            )}
            {access.wifi_nom && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">WiFi</span>
                <span className="text-sm text-foreground font-medium">{access.wifi_nom} / {access.wifi_mdp}</span>
              </div>
            )}
            {access.instructions_arrivee && (
              <div className="py-2">
                <p className="text-sm text-muted-foreground mb-2">Instructions d'arrivée</p>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted rounded-md p-3">
                  {access.instructions_arrivee}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {booking.notes_internes && (
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notes internes</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes_internes}</p>
        </div>
      )}
    </div>
  )
}
