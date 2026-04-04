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
            <Link href={`/biens/${property.id}/acces`}>
              <Button size="sm" variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Accès
              </Button>
            </Link>
            <Link href={`/biens/${property.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Informations</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-garrigue-500">Type</span>
              <StatusBadge status={property.type} />
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Statut</span>
              <StatusBadge status={property.statut} />
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Superficie</span>
              <span>{property.superficie} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Chambres</span>
              <span>{property.nb_chambres}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Capacité</span>
              <span>{property.capacite_voyageurs} voyageurs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-garrigue-500">Adresse</span>
              <span className="text-right">
                {adresse?.rue}<br />
                {adresse?.code_postal} {adresse?.ville}
              </span>
            </div>
          </div>
        </div>

        {property.mandate && (
          <div className="bg-white rounded-xl border border-garrigue-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide">Mandat</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-garrigue-500">Propriétaire</span>
                <Link href={`/proprietaires/${property.mandate.owner.id}`} className="text-olivier-600 hover:underline">
                  {property.mandate.owner.nom}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">N° mandat</span>
                <span>{property.mandate.numero_mandat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">Honoraires</span>
                <span>{property.mandate.taux_honoraires}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-garrigue-500">Statut</span>
                <StatusBadge status={property.mandate.statut} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-garrigue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-garrigue-700 uppercase tracking-wide flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Réservations récentes
          </h2>
          <Link href={`/reservations?property=${property.id}`}>
            <Button size="sm" variant="outline">Toutes</Button>
          </Link>
        </div>
        {property.bookings.length === 0 ? (
          <p className="text-sm text-garrigue-400 text-center py-6">Aucune réservation</p>
        ) : (
          <div className="space-y-2">
            {property.bookings.map((booking) => (
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
                    {new Date(booking.check_in).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits} nuits)
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.statut} />
                  <p className="text-xs text-garrigue-500 mt-1">
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
