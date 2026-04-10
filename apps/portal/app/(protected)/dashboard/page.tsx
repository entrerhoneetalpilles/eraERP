import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerWithAccount } from "@/lib/dal/owner"
import { getOwnerProperties } from "@/lib/dal/properties"
import { db } from "@conciergerie/db"
import { SoldeCard } from "@/components/dashboard/solde-card"
import { EventCard } from "@/components/dashboard/event-card"
import { AlertBanner } from "@/components/dashboard/alert-banner"

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const ownerId = session.user.ownerId
  const prenom = session.user.name?.split(" ")[0] ?? "Propriétaire"

  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [owner, properties] = await Promise.all([
    getOwnerWithAccount(ownerId),
    getOwnerProperties(ownerId),
  ])

  const propertyIds = properties.map((p) => p.id)
  const upcomingBookings =
    propertyIds.length > 0
      ? await db.booking.findMany({
          where: {
            property_id: { in: propertyIds },
            statut: { in: ["CONFIRMED", "CHECKEDIN"] },
            OR: [
              { check_in: { gte: now, lte: in7days } },
              { check_out: { gte: now, lte: in7days } },
            ],
          },
          include: { property: { select: { nom: true } } },
          orderBy: { check_in: "asc" },
          take: 5,
        })
      : []

  const account = owner?.mandantAccount
  const lastReport = account?.reports?.[0]
  const dernierVirement = lastReport?.date_virement
    ? { montant: lastReport.montant_reverse, date: lastReport.date_virement }
    : null

  const alerts: { id: string; message: string }[] = []
  for (const doc of owner?.documents ?? []) {
    const daysLeft = doc.date_expiration
      ? Math.round((doc.date_expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null
    if (daysLeft !== null) {
      alerts.push({
        id: doc.id,
        message: `${doc.nom} expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`,
      })
    }
  }
  for (const inv of owner?.feeInvoices ?? []) {
    alerts.push({ id: inv.id, message: `Facture d'honoraires en attente de paiement` })
  }

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-garrigue-900">Bonjour, {prenom}</h1>
        <p className="text-sm text-garrigue-400 capitalize mt-0.5">{today}</p>
      </div>

      <SoldeCard
        solde={account?.solde_courant ?? 0}
        sequestre={account?.solde_sequestre ?? 0}
        dernierVirement={dernierVirement}
      />

      {upcomingBookings.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-garrigue-400 uppercase tracking-wider mb-2">
            Prochains événements
          </h2>
          <div className="space-y-2">
            {(() => {
              const events: { key: string; type: "checkin" | "checkout"; propertyName: string; date: Date }[] = []
              for (const b of upcomingBookings) {
                if (b.check_in >= now && b.check_in <= in7days) {
                  events.push({ key: `${b.id}-in`, type: "checkin", propertyName: b.property.nom, date: b.check_in })
                }
                if (b.check_out >= now && b.check_out <= in7days) {
                  events.push({ key: `${b.id}-out`, type: "checkout", propertyName: b.property.nom, date: b.check_out })
                }
              }
              events.sort((a, b) => a.date.getTime() - b.date.getTime())
              return events.map((e) => (
                <EventCard key={e.key} type={e.type} propertyName={e.propertyName} date={e.date} />
              ))
            })()}
          </div>
        </section>
      )}

      <AlertBanner alerts={alerts} />
    </div>
  )
}
