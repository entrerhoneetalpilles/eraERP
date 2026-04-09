import { notFound } from "next/navigation"
import Link from "next/link"
import { getGuestById, getGuestStats } from "@/lib/dal/guests"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@conciergerie/ui"
import { Edit, Star, Flag, Globe, Phone, Mail, TrendingUp, Bed, Clock, Tag, MessageSquare } from "lucide-react"

const TAG_STYLES: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400",
  REGULIER: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400",
  BLACKLIST: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400",
  AVEC_ANIMAL: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400",
  FAMILLE: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400",
  SANS_CONTACT: "bg-slate-100 text-slate-800 border-slate-300",
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}</span>
    </span>
  )
}

export default async function GuestDetailPage({ params }: { params: { id: string } }) {
  const [guest, stats] = await Promise.all([getGuestById(params.id), getGuestStats(params.id)])
  if (!guest) notFound()

  const completedBookings = guest.bookings.filter(b => b.statut === "CHECKEDOUT")
  const activeBookings = guest.bookings.filter(b => ["CONFIRMED", "CHECKEDIN"].includes(b.statut))
  const initials = `${guest.prenom[0] ?? "?"}${guest.nom[0] ?? "?"}`.toUpperCase()
  const tags = (guest as any).tags as string[] ?? []

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">{initials}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{guest.prenom} {guest.nom}</h1>
              {tags.map(tag => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TAG_STYLES[tag] ?? "bg-muted text-muted-foreground border-border"}`}>{tag}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{guest.nb_sejours} séjour{guest.nb_sejours !== 1 ? "s" : ""} · Voyageur depuis {new Date(guest.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <Link href={`/voyageurs/${guest.id}/edit`}>
          <Button size="sm" variant="outline" className="cursor-pointer gap-1.5"><Edit className="w-3.5 h-3.5" />Modifier</Button>
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Revenus générés", value: stats.totalRevenu.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Nuits totales", value: `${stats.totalNuits}`, icon: Bed, color: "text-blue-600" },
          { label: "Durée moyenne", value: `${stats.avgNuits} nuits`, icon: Clock, color: "text-indigo-600" },
          { label: "Annulations", value: `${stats.cancelledCount}`, icon: Flag, color: stats.cancelledCount > 2 ? "text-red-600" : "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground">{label}</span><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Contact & Identité</p>
            <div className="space-y-2.5">
              {guest.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><a href={`mailto:${guest.email}`} className="text-primary hover:underline truncate">{guest.email}</a></div>}
              {guest.telephone && <div className="flex items-center gap-2 text-sm"><Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><a href={`tel:${guest.telephone}`} className="text-foreground hover:text-primary">{guest.telephone}</a></div>}
              {(guest as any).nationalite && <div className="flex items-center gap-2 text-sm"><Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-foreground">{(guest as any).nationalite}</span></div>}
              <div className="flex items-center gap-2 text-sm"><Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-foreground uppercase font-medium">{guest.langue}</span><span className="text-muted-foreground">Langue préférée</span></div>
              {Object.keys(stats.platforms).length > 0 && (
                <div className="flex items-start gap-2 text-sm pt-1 border-t border-border">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-foreground">{Object.entries(stats.platforms).map(([k, v]) => `${k} (${v})`).join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {(guest as any).note_interne != null && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Note interne</p>
              <Stars value={(guest as any).note_interne} />
            </div>
          )}

          {stats.nbAvis > 0 && stats.avgNote != null && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Avis Airbnb ({stats.nbAvis})</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Note globale</span><Stars value={stats.avgNote} /></div>
                {stats.avgProprete != null && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Propreté</span><Stars value={stats.avgProprete} /></div>}
              </div>
            </div>
          )}

          {(guest as any).notes_internes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-2"><MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /><p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">Notes internes</p></div>
              <p className="text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap">{(guest as any).notes_internes}</p>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-4">
          {activeBookings.length > 0 && (
            <div className="bg-card rounded-lg border border-primary/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Séjour actif / à venir</p>
              <div className="space-y-0.5">{activeBookings.map(b => <BookingLine key={b.id} booking={b} />)}</div>
            </div>
          )}
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Historique des séjours</p>
              <span className="text-xs text-muted-foreground">{guest.bookings.length} total</span>
            </div>
            {guest.bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun séjour enregistré</p>
            ) : (
              <div className="space-y-0.5">{guest.bookings.map(b => <BookingLine key={b.id} booking={b} showReview />)}</div>
            )}
          </div>
          {guest.serviceOrders.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Services commandés</p>
              <div className="divide-y divide-border">
                {guest.serviceOrders.map(so => (
                  <div key={so.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div><p className="font-medium text-foreground">{so.service.nom}</p><p className="text-xs text-muted-foreground">{so.service.categorie}</p></div>
                    <div className="text-right"><p className="font-semibold">{so.montant_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p><StatusBadge status={so.statut} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingLine({ booking, showReview }: { booking: any; showReview?: boolean }) {
  return (
    <Link href={`/reservations/${booking.id}`} className="flex items-start justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{booking.property.nom}</p>
        <p className="text-xs text-muted-foreground">{new Date(booking.check_in).toLocaleDateString("fr-FR")} → {new Date(booking.check_out).toLocaleDateString("fr-FR")} ({booking.nb_nuits}n)</p>
        {showReview && booking.review?.commentaire_voyageur && (
          <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">&ldquo;{booking.review.commentaire_voyageur}&rdquo;</p>
        )}
      </div>
      <div className="text-right shrink-0 ml-3 space-y-0.5">
        <StatusBadge status={booking.statut} />
        <p className="text-xs text-muted-foreground">{booking.revenu_net_proprietaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p>
        {showReview && booking.review?.note_globale != null && (
          <div className="flex items-center gap-0.5 justify-end">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{booking.review.note_globale.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
