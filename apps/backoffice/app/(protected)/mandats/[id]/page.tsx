import { notFound } from "next/navigation"
import Link from "next/link"
import { getMandateById, getMandateStats } from "@/lib/dal/mandates"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import {
  CalendarDays, FileText, Home, Users, Euro,
  ShieldCheck, RefreshCw, Wrench, Key, Wifi,
} from "lucide-react"
import { MandateStatusButton } from "./status-button"
import { DeleteMandateButton } from "./delete-button"
import { MandatePdfButton } from "./pdf-button"

const TABS = ["resume", "reservations", "conditions", "avenants", "documents"] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  resume: "Résumé",
  reservations: "Réservations",
  conditions: "Conditions",
  avenants: "Avenants",
  documents: "Documents",
}

export default async function MandateDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const activeTab: Tab = TABS.includes(searchParams.tab as Tab) ? (searchParams.tab as Tab) : "resume"

  const [mandate, stats] = await Promise.all([
    getMandateById(params.id),
    getMandateStats(params.id),
  ])

  if (!mandate) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Mandat ${mandate.numero_mandat}`}
        description={
          <span className="text-sm text-muted-foreground">
            {mandate.owner.nom} · {mandate.property.nom}
          </span>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <MandatePdfButton mandateId={mandate.id} />
            <MandateStatusButton mandateId={mandate.id} currentStatus={mandate.statut as "ACTIF" | "SUSPENDU" | "RESILIE"} />
            <DeleteMandateButton mandateId={mandate.id} numero={mandate.numero_mandat} />
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenus bruts générés</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {stats.revenusBruts.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Honoraires générés</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {stats.honorairesGeneres.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
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
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/mandats/${mandate.id}?tab=${tab}`}
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

      {/* ── RÉSUMÉ ── */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parties */}
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Parties
            </h2>
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Propriétaire</span>
                <Link href={`/proprietaires/${mandate.owner.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                  {mandate.owner.nom}
                </Link>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Bien</span>
                <Link href={`/biens/${mandate.property.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                  {mandate.property.nom}
                </Link>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Statut</span>
                <StatusBadge status={mandate.statut} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Début</span>
                <span className="text-sm font-medium">{new Date(mandate.date_debut).toLocaleDateString("fr-FR")}</span>
              </div>
              {mandate.date_fin ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Fin</span>
                  <span className="text-sm font-medium">{new Date(mandate.date_fin).toLocaleDateString("fr-FR")}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" />
                    {mandate.reconduction_tacite ? "Reconductible tacitement" : "Durée indéterminée"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financier résumé */}
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Euro className="w-3.5 h-3.5" />
              Conditions financières
            </h2>
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Honoraires gestion</span>
                <span className="text-sm font-semibold">{mandate.taux_honoraires}%</span>
              </div>
              {mandate.honoraires_location != null && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Honoraires location</span>
                  <span className="text-sm font-medium">{mandate.honoraires_location}%</span>
                </div>
              )}
              {mandate.taux_horaire_ht != null && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Taux horaire HT</span>
                  <span className="text-sm font-medium">{mandate.taux_horaire_ht} €/h</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Seuil validation devis</span>
                <span className="text-sm font-medium">
                  {mandate.seuil_validation_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Reconduction tacite</span>
                <span className="text-sm font-medium">{mandate.reconduction_tacite ? "Oui" : "Non"}</span>
              </div>
            </div>
          </div>

          {/* Prestations incluses */}
          {mandate.prestations_incluses.length > 0 && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Prestations incluses
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {mandate.prestations_incluses.map((p: string) => (
                  <span key={p} className="text-xs bg-muted rounded px-2.5 py-1 border border-border">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bien rapide */}
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Bien associé
            </h2>
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Type</span>
                <StatusBadge status={mandate.property.type} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Statut</span>
                <StatusBadge status={mandate.property.statut} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Capacité</span>
                <span className="text-sm font-medium">{mandate.property.capacite_voyageurs} voyageurs</span>
              </div>
              {mandate.property.access?.code_acces && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Code</span>
                  <span className="text-sm font-mono font-bold">{mandate.property.access.code_acces}</span>
                </div>
              )}
              {mandate.property.access?.wifi_nom && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Wifi</span>
                  <span className="text-sm font-medium">{mandate.property.access.wifi_nom}</span>
                </div>
              )}
            </div>
            <Link href={`/biens/${mandate.property.id}`}>
              <Button size="sm" variant="outline" className="w-full mt-3">Voir la fiche du bien</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── RÉSERVATIONS ── */}
      {activeTab === "reservations" && (
        <div className="bg-card rounded-md border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Réservations ({mandate.property.bookings.length})
            </h2>
            <Link href={`/reservations?property=${mandate.property.id}`}>
              <Button size="sm" variant="outline">Toutes</Button>
            </Link>
          </div>
          {mandate.property.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Aucune réservation</p>
          ) : (
            <div className="space-y-0.5">
              {mandate.property.bookings.map((booking: {
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

      {/* ── CONDITIONS ── */}
      {activeTab === "conditions" && (
        <div className="space-y-4">
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Euro className="w-3.5 h-3.5" />
              Conditions financières détaillées
            </h2>
            <div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Taux honoraires gestion</span>
                <span className="text-sm font-bold text-foreground">{mandate.taux_honoraires}%</span>
              </div>
              {mandate.honoraires_location != null && (
                <div className="flex items-center justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Honoraires location</span>
                  <span className="text-sm font-medium">{mandate.honoraires_location}%</span>
                </div>
              )}
              {mandate.taux_horaire_ht != null && (
                <div className="flex items-center justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Taux horaire HT</span>
                  <span className="text-sm font-medium">{mandate.taux_horaire_ht} €/h</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Seuil validation devis</span>
                <span className="text-sm font-medium">
                  {mandate.seuil_validation_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Reconduction tacite</span>
                <span className="text-sm font-medium">{mandate.reconduction_tacite ? "Oui" : "Non"}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Date début</span>
                <span className="text-sm font-medium">{new Date(mandate.date_debut).toLocaleDateString("fr-FR")}</span>
              </div>
              {mandate.date_fin && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">Date fin</span>
                  <span className="text-sm font-medium">{new Date(mandate.date_fin).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
            </div>
          </div>

          {mandate.prestations_incluses.length > 0 && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Prestations incluses
              </h2>
              <div className="flex flex-wrap gap-2">
                {mandate.prestations_incluses.map((p: string) => (
                  <span key={p} className="text-xs bg-muted rounded px-2.5 py-1 border border-border">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Règles tarifaires du bien */}
          {mandate.property.priceRules.length > 0 && (
            <div className="bg-card rounded-md border border-border p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />
                Tarification du bien
              </h2>
              <div className="space-y-0.5">
                {mandate.property.priceRules.map((rule: {
                  id: string
                  type: string
                  nom: string | null
                  prix_nuit: number
                  sejour_min: number
                  date_debut: Date | null
                  date_fin: Date | null
                  actif: boolean
                }) => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md ${!rule.actif ? "opacity-50" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{rule.nom ?? rule.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {rule.date_debut && rule.date_fin
                          ? `${new Date(rule.date_debut).toLocaleDateString("fr-FR")} → ${new Date(rule.date_fin).toLocaleDateString("fr-FR")}`
                          : "Règle permanente"
                        } · min. {rule.sejour_min} nuit{rule.sejour_min !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">
                      {rule.prix_nuit.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/nuit
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AVENANTS ── */}
      {activeTab === "avenants" && (
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Avenants ({mandate.avenants.length})
          </h2>
          {mandate.avenants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Aucun avenant</p>
          ) : (
            <div className="space-y-3">
              {mandate.avenants.map((avenant: {
                id: string
                numero: number
                date: Date
                description: string
                statut_signature: string
              }) => (
                <div
                  key={avenant.id}
                  className="rounded-md border border-border p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">Avenant n°{avenant.numero}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={avenant.statut_signature} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(avenant.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{avenant.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {activeTab === "documents" && (
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Documents ({mandate.documents.length})
          </h2>
          {mandate.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Aucun document</p>
          ) : (
            <div className="space-y-1.5">
              {mandate.documents.map((doc: {
                id: string
                nom: string
                type: string
                statut_signature: string
                createdAt: Date
                url_storage: string
              }) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type} · {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.statut_signature} />
                    <a
                      href={doc.url_storage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ouvrir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
