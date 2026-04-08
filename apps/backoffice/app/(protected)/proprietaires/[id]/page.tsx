import { notFound } from "next/navigation"
import Link from "next/link"
import { getOwnerById, getOwnerStats, getOwnerBookings } from "@/lib/dal/owners"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import {
  Edit, Building2, FileText, TrendingUp, CalendarDays,
  Mail, Receipt, BarChart3, Users, CreditCard, ExternalLink,
} from "lucide-react"
import { DeleteOwnerButton } from "./delete-button"
import { PortalAccessButton } from "./portal-access-button"

type Tab = "resume" | "biens" | "reservations" | "comptabilite" | "messages"

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "resume", label: "Résumé", icon: Users },
  { key: "biens", label: "Biens", icon: Building2 },
  { key: "reservations", label: "Réservations", icon: CalendarDays },
  { key: "comptabilite", label: "Comptabilité", icon: BarChart3 },
  { key: "messages", label: "Messages", icon: Mail },
]

export default async function OwnerDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const tab = (searchParams.tab ?? "resume") as Tab
  const owner = await getOwnerById(params.id)
  if (!owner) notFound()

  const adresse = owner.adresse as any

  // Charger les données selon l'onglet actif
  const [stats, bookings] = await Promise.all([
    getOwnerStats(params.id),
    tab === "reservations" ? getOwnerBookings(params.id) : Promise.resolve([]),
  ])

  const portalUser = owner.ownerUsers[0] ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title={owner.nom}
        description={
          <span className="flex items-center gap-2">
            <StatusBadge status={owner.type} />
            <span className="text-xs text-muted-foreground">
              Client depuis {new Date(owner.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/proprietaires/${owner.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Revenus ce mois"
          value={stats.revenuMoisCourant.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          icon={TrendingUp}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Réservations actives"
          value={String(stats.activeBookings)}
          icon={CalendarDays}
          colorClass="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Biens en gestion"
          value={String(stats.nbBiens)}
          icon={Building2}
          colorClass="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Solde mandant"
          value={owner.mandantAccount
            ? owner.mandantAccount.solde_courant.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
            : "—"
          }
          icon={CreditCard}
          colorClass={owner.mandantAccount && owner.mandantAccount.solde_courant < 0
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-600"
          }
        />
      </div>

      {/* Onglets */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/proprietaires/${owner.id}?tab=${key}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenu onglets */}
      {tab === "resume" && (
        <ResumeTab owner={owner} adresse={adresse} portalUser={portalUser} />
      )}
      {tab === "biens" && (
        <BiensTab owner={owner} />
      )}
      {tab === "reservations" && (
        <ReservationsTab bookings={bookings} totalBookings={stats.totalBookings} />
      )}
      {tab === "comptabilite" && (
        <ComptabiliteTab owner={owner} />
      )}
      {tab === "messages" && (
        <MessagesTab owner={owner} />
      )}
    </div>
  )
}

/* ── KPI Card ────────────────────────────────────────────────────── */

function KpiCard({ label, value, icon: Icon, colorClass }: {
  label: string
  value: string
  icon: React.ElementType
  colorClass: string
}) {
  return (
    <div className="bg-card rounded-md border border-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{value}</p>
        </div>
        <div className={`p-2 rounded-md shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

/* ── Onglet Résumé ────────────────────────────────────────────────── */

function ResumeTab({ owner, adresse, portalUser }: { owner: any; adresse: any; portalUser: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Informations personnelles */}
      <div className="bg-card rounded-md border border-border p-5 space-y-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Informations
        </h2>
        <InfoRow label="Type"><StatusBadge status={owner.type} /></InfoRow>
        <InfoRow label="Email">
          <a href={`mailto:${owner.email}`} className="text-sm text-primary hover:underline">
            {owner.email}
          </a>
        </InfoRow>
        {owner.telephone && (
          <InfoRow label="Téléphone">
            <a href={`tel:${owner.telephone}`} className="text-sm text-foreground font-medium">
              {owner.telephone}
            </a>
          </InfoRow>
        )}
        <InfoRow label="Adresse">
          <span className="text-sm text-foreground font-medium text-right">
            {adresse?.rue}<br />{adresse?.code_postal} {adresse?.ville}
          </span>
        </InfoRow>
        {owner.rib_iban && (
          <InfoRow label="IBAN">
            <span className="font-mono text-xs text-muted-foreground">{owner.rib_iban}</span>
          </InfoRow>
        )}
        {owner.nif && (
          <InfoRow label="NIF / SIRET">
            <span className="font-mono text-xs text-muted-foreground">{owner.nif}</span>
          </InfoRow>
        )}
      </div>

      {/* Compte mandant + portail */}
      <div className="space-y-4">
        {owner.mandantAccount && (
          <div className="bg-card rounded-md border border-border p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Compte mandant
            </h2>
            <InfoRow label="Solde courant">
              <span className={`text-sm font-bold tabular-nums ${owner.mandantAccount.solde_courant < 0 ? "text-destructive" : "text-foreground"}`}>
                {owner.mandantAccount.solde_courant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </InfoRow>
            {owner.mandantAccount.solde_sequestre > 0 && (
              <InfoRow label="En séquestre">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {owner.mandantAccount.solde_sequestre.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </InfoRow>
            )}
            {owner.mandantAccount.transactions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Dernières transactions</p>
                <div className="space-y-1">
                  {owner.mandantAccount.transactions.slice(0, 4).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate flex-1 mr-2">{t.libelle}</span>
                      <span className={t.montant > 0 ? "text-emerald-600 font-medium tabular-nums" : "text-destructive font-medium tabular-nums"}>
                        {t.montant > 0 ? "+" : ""}{t.montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3">
              <Link href="/comptabilite">
                <Button size="sm" variant="ghost" className="w-full text-xs gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Voir la comptabilité
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Accès portail propriétaire */}
        <div className="bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Accès portail
          </h2>
          {portalUser ? (
            <div className="space-y-3">
              <InfoRow label="Email portail">
                <span className="text-xs text-muted-foreground">{portalUser.email}</span>
              </InfoRow>
              <InfoRow label="Dernière connexion">
                <span className="text-xs text-muted-foreground">
                  {portalUser.derniere_connexion
                    ? new Date(portalUser.derniere_connexion).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                    : "Jamais connecté"}
                </span>
              </InfoRow>
              <PortalAccessButton ownerId={owner.id} mode="reset" />
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-3">Le propriétaire n'a pas encore accès au portail</p>
              <PortalAccessButton ownerId={owner.id} mode="create" />
            </div>
          )}
        </div>
      </div>

      {/* Notes internes */}
      {owner.notes && (
        <div className="md:col-span-2 bg-card rounded-md border border-border p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Notes internes
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{owner.notes}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="md:col-span-2 bg-card rounded-md border border-border p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/crg/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Générer un CRG
            </Button>
          </Link>
          <Link href={`/facturation/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline" className="gap-2">
              <Receipt className="w-4 h-4" />
              Créer une facture
            </Button>
          </Link>
          <Link href={`/mails?owner=${owner.id}`} target="_blank">
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Envoyer un message
            </Button>
          </Link>
          <Link href={`/mandats/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline" className="gap-2">
              <Building2 className="w-4 h-4" />
              Nouveau mandat
            </Button>
          </Link>
          <DeleteOwnerButton ownerId={owner.id} ownerNom={owner.nom} />
        </div>
      </div>
    </div>
  )
}

/* ── Onglet Biens ────────────────────────────────────────────────── */

function BiensTab({ owner }: { owner: any }) {
  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Biens & Mandats ({owner.mandates.length})
        </h2>
        <Link href={`/mandats/new?owner=${owner.id}`}>
          <Button size="sm" variant="outline">Nouveau mandat</Button>
        </Link>
      </div>
      {owner.mandates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Aucun bien en gestion
        </p>
      ) : (
        <div className="divide-y divide-border">
          {owner.mandates.map((mandate: any) => (
            <Link
              key={mandate.id}
              href={`/biens/${mandate.property.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{mandate.property.nom}</p>
                  <StatusBadge status={mandate.property.type} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mandat n° {mandate.numero_mandat} · {mandate.taux_honoraires}% honoraires
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={mandate.statut} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Onglet Réservations ─────────────────────────────────────────── */

function ReservationsTab({ bookings, totalBookings }: { bookings: any[]; totalBookings: number }) {
  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Réservations ({totalBookings})
        </h2>
      </div>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Aucune réservation</p>
      ) : (
        <div className="divide-y divide-border">
          {bookings.map((b: any) => (
            <Link
              key={b.id}
              href={`/reservations/${b.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {b.guest.prenom} {b.guest.nom}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.property.nom} · {new Date(b.check_in).toLocaleDateString("fr-FR")} → {new Date(b.check_out).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {b.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
                <StatusBadge status={b.statut} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Onglet Comptabilité ─────────────────────────────────────────── */

function ComptabiliteTab({ owner }: { owner: any }) {
  const reports = owner.mandantAccount?.reports ?? []
  const invoices = owner.feeInvoices ?? []

  return (
    <div className="space-y-6">
      {/* CRG */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Comptes rendus de gestion ({reports.length})
          </h2>
          <Link href={`/crg/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline">Nouveau CRG</Button>
          </Link>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun CRG</p>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(r.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Revenus {r.revenus_sejours.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} · Reversé {r.montant_reverse.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {r.montant_reverse.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Factures honoraires */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Factures honoraires ({invoices.length})
          </h2>
          <Link href={`/facturation/new?owner=${owner.id}`}>
            <Button size="sm" variant="outline">Nouvelle facture</Button>
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune facture</p>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/facturation/${inv.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.numero_facture}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.periode_debut).toLocaleDateString("fr-FR", { month: "short" })} → {new Date(inv.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium tabular-nums">
                    {inv.montant_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} TTC
                  </span>
                  <StatusBadge status={inv.statut} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Onglet Messages ─────────────────────────────────────────────── */

function MessagesTab({ owner }: { owner: any }) {
  const threads = owner.messageThreads ?? []

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Messages ({threads.length})
        </h2>
        <Link href="/mails" target="_blank">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Ouvrir la messagerie
          </Button>
        </Link>
      </div>
      {threads.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Aucun message</p>
      ) : (
        <div className="divide-y divide-border">
          {threads.map((t: any) => {
            const lastMsg = t.messages[0]
            return (
              <div key={t.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{t.subject}</p>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {new Date(t.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {lastMsg && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lastMsg.contenu}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Sub-composants utilitaires ──────────────────────────────────── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 mr-4">{label}</span>
      <div className="flex justify-end">{children}</div>
    </div>
  )
}
