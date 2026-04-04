import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById } from "@/lib/dal/properties"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit, CalendarDays, Key } from "lucide-react"

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()

  const adresse = property.adresse as any // Prisma Json field

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.nom}
        actions={
          <div className="flex gap-2">
            <Link href={`/biens/${property.id}/acces`} className="cursor-pointer">
              <Button size="sm" variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Accès
              </Button>
            </Link>
            <Link href={`/biens/${property.id}/edit`} className="cursor-pointer">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informations</h2>
          <div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Type</span>
              <StatusBadge status={property.type} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge status={property.statut} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Superficie</span>
              <span className="text-sm text-foreground font-medium">{property.superficie} m²</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Chambres</span>
              <span className="text-sm text-foreground font-medium">{property.nb_chambres}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Capacité</span>
              <span className="text-sm text-foreground font-medium">{property.capacite_voyageurs} voyageurs</span>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm text-muted-foreground">Adresse</span>
              <span className="text-sm text-foreground font-medium text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
          </div>
        </div>

        {property.mandate && (
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mandat</h2>
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Propriétaire</span>
                <Link
                  href={`/proprietaires/${property.mandate.owner.id}`}
                  className="text-sm font-medium text-foreground hover:text-primary cursor-pointer"
                >
                  {property.mandate.owner.nom}
                </Link>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">N° mandat</span>
                <span className="text-sm text-foreground font-medium">{property.mandate.numero_mandat}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Honoraires</span>
                <span className="text-sm text-foreground font-medium">{property.mandate.taux_honoraires}%</span>
              </div>
              <div className="flex items-center justify-between py-2 last:border-0">
                <span className="text-sm text-muted-foreground">Statut</span>
                <StatusBadge status={property.mandate.statut} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-md border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Réservations récentes
          </h2>
          <Link href={`/reservations?property=${property.id}`} className="cursor-pointer">
            <Button size="sm" variant="outline">Toutes</Button>
          </Link>
        </div>
        {property.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune réservation</p>
        ) : (
          <div className="space-y-0.5">
            {property.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/reservations/${booking.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors duration-100 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.guest.prenom} {booking.guest.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.check_in).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits} nuits)
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
