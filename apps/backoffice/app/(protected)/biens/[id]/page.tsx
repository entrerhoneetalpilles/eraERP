import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById, getPropertyStats } from "@/lib/dal/properties"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import {
  Edit, Key, CalendarDays, TrendingUp, Wrench, Home,
  Wifi, Lock, MapPin, Users, BedDouble, Ruler,
  Euro, ShieldCheck, AlertTriangle,
} from "lucide-react"
import { DeletePropertyButton } from "./delete-button"
import { PropertyStatusButton } from "./status-button"

const TABS = ["resume", "reservations", "acces", "tarification", "travaux"] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  resume: "Résumé",
  reservations: "Réservations",
  acces: "Accès",
  tarification: "Tarification",
  travaux: "Travaux & Ménage",
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const activeTab: Tab = TABS.includes(searchParams.tab as Tab) ? (searchParams.tab as Tab) : "resume"

  const [property, stats] = await Promise.all([
    getPropertyById(params.id),
    getPropertyStats(params.id),
  ])

  if (!property) notFound()

  const adresse = property.adresse as { rue?: string; code_postal?: string; ville?: string }

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.nom}
        description={
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {adresse?.rue && `${adresse.rue}, `}{adresse?.code_postal} {adresse?.ville}
          </span>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PropertyStatusButton propertyId={property.id} currentStatus={property.statut as "ACTIF" | "INACTIF" | "TRAVAUX"} />
            <Link href={`/biens/${property.id}/edit`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            </Link>
            <DeletePropertyButton propertyId={property.id} propertyNom={property.nom} />
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenus ce mois</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {stats.revenuMoisCourant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Réservations actives</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{stats.activeBookings}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total réservations</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{stats.totalReservations}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Travaux ouverts</p>
          <p className={`text-xl font-bold tabular-nums ${stats.openWorkOrders > 0 ? "text-amber-600" : "text-foreground"}`}>
            {stats.openWorkOrders}
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/biens/${property.id}?tab=${tab}`}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Caractéristiques */}
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Caractéristiques
            </h2>
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> Type</span>
                <StatusBadge status={property.type} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Superficie</span>
                <span className="text-sm font-medium">{property.superficie} m²</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> Chambres</span>
                <span className="text-sm font-medium">{property.nb_chambres}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Capacité</span>
                <span className="text-sm font-medium">{property.capacite_voyageurs} voyageurs</span>
              </div>
              {property.amenities.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1.5">Équipements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.amenities.map((a: string) => (
                      <span key={a} className="text-xs bg-muted rounded px-2 py-0.5">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mandat */}
          {property.mandate ? (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mandat
              </h2>
              <div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Propriétaire</span>
                  <Link
                    href={`/proprietaires/${property.mandate.owner.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {property.mandate.owner.nom}
                  </Link>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">N° mandat</span>
                  <span className="text-sm font-medium">{property.mandate.numero_mandat}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Honoraires</span>
                  <span className="text-sm font-medium">{property.mandate.taux_honoraires}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <StatusBadge status={property.mandate.statut} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Début</span>
                  <span className="text-sm font-medium">
                    {new Date(property.mandate.date_debut).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-md border border-border p-5 flex flex-col items-center justify-center text-center gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">Sans mandat</p>
              <p className="text-xs text-muted-foreground">Ce bien n'est rattaché à aucun mandat actif.</p>
            </div>
          )}

          {/* Accès rapide */}
          {property.access && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Accès (résumé)
              </h2>
              <div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <StatusBadge status={property.access.type_acces} />
                </div>
                {property.access.code_acces && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Code</span>
                    <span className="text-sm font-mono font-bold tracking-wider">{property.access.code_acces}</span>
                  </div>
                )}
                {property.access.wifi_nom && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Wifi</span>
                    <span className="text-sm font-medium">{property.access.wifi_nom}</span>
                  </div>
                )}
              </div>
              <Link href={`/biens/${property.id}/acces`}>
                <Button size="sm" variant="outline" className="gap-2 w-full mt-3">
                  <Key className="w-3.5 h-3.5" />
                  Gérer l'accès
                </Button>
              </Link>
            </div>
          )}

          {/* Documents */}
          {property.propertyDocuments.length > 0 && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Documents</h2>
              <div className="space-y-2">
                {property.propertyDocuments.slice(0, 5).map((doc: { id: string; type: string; date_validite: Date | null }) => (
                  <div key={doc.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{doc.type}</span>
                    {doc.date_validite && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.date_validite).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="bg-card rounded-md border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Réservations
            </h2>
            <Link href={`/reservations?property=${property.id}`}>
              <Button size="sm" variant="outline">Toutes</Button>
            </Link>
          </div>
          {property.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Aucune réservation</p>
          ) : (
            <div className="space-y-0.5">
              {property.bookings.map((booking: {
                id: string
                check_in: Date
                check_out: Date
                nb_nuits: number
                nb_voyageurs: number
                statut: string
                montant_total: number
                revenu_net_proprietaire: number
                platform: string
                guest: { prenom: string; nom: string }
              }) => (
                <Link
                  key={booking.id}
                  href={`/reservations/${booking.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {booking.guest.prenom} {booking.guest.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.check_in).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(booking.check_out).toLocaleDateString("fr-FR")} · {booking.nb_nuits} nuits · {booking.nb_voyageurs} voy.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
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
      )}

      {activeTab === "acces" && (
        <div className="bg-card rounded-md border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Informations d'accès
            </h2>
            <Link href={`/biens/${property.id}/acces`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Edit className="w-3.5 h-3.5" />
                Modifier
              </Button>
            </Link>
          </div>
          {!property.access ? (
            <div className="text-center py-10">
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Aucune information d'accès renseignée.</p>
              <Link href={`/biens/${property.id}/acces`}>
                <Button size="sm">Ajouter les accès</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted rounded-md p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Type d'accès</p>
                  <StatusBadge status={property.access.type_acces} />
                </div>
                {property.access.code_acces && (
                  <div className="bg-muted rounded-md p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Code d'accès</p>
                    <p className="text-lg font-mono font-bold tracking-widest">{property.access.code_acces}</p>
                  </div>
                )}
                {property.access.wifi_nom && (
                  <div className="bg-muted rounded-md p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wifi className="w-3 h-3" /> Réseau Wifi</p>
                    <p className="text-sm font-medium">{property.access.wifi_nom}</p>
                    {property.access.wifi_mdp && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{property.access.wifi_mdp}</p>
                    )}
                  </div>
                )}
              </div>
              {property.access.instructions_arrivee && (
                <div className="bg-muted rounded-md p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Instructions d'arrivée</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{property.access.instructions_arrivee}</p>
                </div>
              )}
              {property.access.notes_depart && (
                <div className="bg-muted rounded-md p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes de départ</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{property.access.notes_depart}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "tarification" && (
        <div className="space-y-4">
          <div className="bg-card rounded-md border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Euro className="w-3.5 h-3.5" />
                Règles tarifaires
              </h2>
            </div>
            {property.priceRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune règle tarifaire</p>
            ) : (
              <div className="space-y-0.5">
                {property.priceRules.map((rule: {
                  id: string
                  type: string
                  nom: string | null
                  prix_nuit: number
                  sejour_min: number
                  date_debut: Date | null
                  date_fin: Date | null
                  actif: boolean
                  priorite: number
                }) => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md ${!rule.actif ? "opacity-50" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {rule.nom ?? rule.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rule.date_debut && rule.date_fin
                          ? `${new Date(rule.date_debut).toLocaleDateString("fr-FR")} → ${new Date(rule.date_fin).toLocaleDateString("fr-FR")}`
                          : "Règle permanente"
                        } · Séjour min. {rule.sejour_min} nuit{rule.sejour_min !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">
                        {rule.prix_nuit.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/nuit
                      </p>
                      {!rule.actif && <p className="text-xs text-muted-foreground">Inactif</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates bloquées */}
          {property.blockedDates.length > 0 && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Dates bloquées</h2>
              <div className="space-y-1">
                {property.blockedDates.map((block: { id: string; date_debut: Date; date_fin: Date; motif: string | null }) => (
                  <div key={block.id} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-foreground">
                      {new Date(block.date_debut).toLocaleDateString("fr-FR")} → {new Date(block.date_fin).toLocaleDateString("fr-FR")}
                    </span>
                    {block.motif && <span className="text-xs text-muted-foreground">{block.motif}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "travaux" && (
        <div className="space-y-4">
          {/* Ordres de travaux */}
          <div className="bg-card rounded-md border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />
                Ordres de travaux
              </h2>
              <Link href={`/travaux?property=${property.id}`}>
                <Button size="sm" variant="outline">Tous</Button>
              </Link>
            </div>
            {property.workOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun ordre de travaux</p>
            ) : (
              <div className="space-y-0.5">
                {property.workOrders.map((wo: {
                  id: string
                  titre: string
                  type: string
                  urgence: string
                  statut: string
                  montant_devis: number | null
                  createdAt: Date
                }) => (
                  <Link
                    key={wo.id}
                    href={`/travaux/${wo.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{wo.titre}</p>
                      <p className="text-xs text-muted-foreground">
                        {wo.type} · {new Date(wo.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={wo.statut} />
                      {wo.montant_devis && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {wo.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tâches de ménage */}
          <div className="bg-card rounded-md border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Tâches de ménage récentes
              </h2>
              <Link href={`/menage?property=${property.id}`}>
                <Button size="sm" variant="outline">Toutes</Button>
              </Link>
            </div>
            {property.cleaningTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune tâche de ménage</p>
            ) : (
              <div className="space-y-0.5">
                {property.cleaningTasks.map((task: {
                  id: string
                  date_prevue: Date
                  date_realisation: Date | null
                  statut: string
                  notes: string | null
                }) => (
                  <div key={task.id} className="flex items-center justify-between px-3 py-2.5 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(task.date_prevue).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      {task.notes && <p className="text-xs text-muted-foreground">{task.notes}</p>}
                    </div>
                    <StatusBadge status={task.statut} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
