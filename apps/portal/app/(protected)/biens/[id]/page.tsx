import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOwnerPropertyById } from "@/lib/dal/properties"
import { PropertyAccessCard } from "@/components/biens/property-access-card"
import { PropertyReviews } from "@/components/biens/property-reviews"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { STATUT_LABELS, STATUT_STYLES } from "@/lib/booking-statuts"

function extractVille(adresse: unknown): string | null {
  if (adresse && typeof adresse === "object") {
    const addr = adresse as Record<string, unknown>
    if (typeof addr.ville === "string") return addr.ville
    if (typeof addr.city === "string") return addr.city
  }
  return null
}


export default async function BienDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const property = await getOwnerPropertyById(session.user.ownerId, params.id)
  if (!property) notFound()

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const recentBookings = property.bookings.slice(0, 3)
  const ville = extractVille(property.adresse)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/biens"
          className="text-garrigue-400 hover:text-garrigue-700 transition-colors"
          aria-label="Retour aux biens"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-serif text-3xl text-garrigue-900 font-light italic">
          {property.nom}
        </h1>
      </div>

      {/* Property info + monthly revenue */}
      <div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-calcaire-100 rounded-lg">
            <Home size={20} className="text-garrigue-500" />
          </div>
          <div>
            <p className="font-medium text-garrigue-900">{property.nom}</p>
            {ville && <p className="text-sm text-garrigue-400">{ville}</p>}
            {property.superficie && (
              <p className="text-sm text-garrigue-400">{property.superficie} m²</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-argile-200/40">
          <p className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-1">
            Revenus du mois
          </p>
          <p className="font-serif text-xl text-garrigue-900">{fmt(property.revenusThisMonth)}</p>
        </div>
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-3">
            Réservations récentes
          </h2>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl px-4 py-3 shadow-luxury-card border border-argile-200/40 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-garrigue-900">
                    {b.guest.prenom} {b.guest.nom}
                  </p>
                  <p className="text-xs text-garrigue-400">
                    {format(b.check_in, "d MMM", { locale: fr })} →{" "}
                    {format(b.check_out, "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    STATUT_STYLES[String(b.statut)] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUT_LABELS[String(b.statut)] ?? String(b.statut)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Access info */}
      {property.access && (
        <PropertyAccessCard
          wifi_nom={property.access.wifi_nom}
          wifi_mdp={property.access.wifi_mdp}
          code_acces={property.access.code_acces}
          instructions_arrivee={property.access.instructions_arrivee}
          notes_depart={property.access.notes_depart}
        />
      )}

      {/* Guest reviews */}
      <PropertyReviews reviews={property.reviews} />
    </div>
  )
}
