import { db } from "@conciergerie/db"

export async function getDashboardStats() {
  const now = new Date()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    recentRevenu,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
    pendingTravaux,
    criticalTravaux,
    overdueInvoices,
    expiredInsurance,
    expiringSoonInsurance,
    expiringMandates,
    missingDocs,
    unrepliedReviews,
    monthlyRevenueTrend,
    occupancyData,
  ] = await Promise.all([
    db.owner.count(),
    db.property.count({ where: { statut: "ACTIF" } }),
    db.booking.count({ where: { statut: { in: ["CONFIRMED", "CHECKEDIN"] } } }),
    db.booking.findMany({
      where: {
        statut: "CONFIRMED",
        check_in: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: { guest: true, property: true },
      orderBy: { check_in: "asc" },
      take: 5,
    }),
    db.booking.aggregate({
      where: {
        statut: { in: ["CONFIRMED", "CHECKEDOUT"] },
        createdAt: { gte: monthStart },
      },
      _sum: { revenu_net_proprietaire: true },
    }),
    db.booking.findMany({
      where: { statut: { in: ["CONFIRMED", "CHECKEDIN"] }, check_in: { gte: todayStart, lte: todayEnd } },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_in: "asc" },
    }),
    db.booking.findMany({
      where: { statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] }, check_out: { gte: todayStart, lte: todayEnd } },
      include: {
        guest: { select: { prenom: true, nom: true } },
        property: { select: { id: true, nom: true } },
      },
      orderBy: { check_out: "asc" },
    }),
    db.cleaningTask.findMany({
      where: { statut: { in: ["PLANIFIEE", "EN_COURS", "PROBLEME"] }, date_prevue: { lte: todayEnd } },
      include: {
        property: { select: { id: true, nom: true } },
        contractor: { select: { id: true, nom: true } },
        booking: { select: { id: true } },
      },
      orderBy: { date_prevue: "asc" },
    }),
    db.workOrder.count({ where: { statut: { notIn: ["TERMINE", "ANNULE"] } } }),
    db.workOrder.findMany({
      where: { urgence: "CRITIQUE", statut: { notIn: ["TERMINE", "ANNULE"] } },
      include: { property: { select: { id: true, nom: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    db.feeInvoice.count({ where: { statut: "EMISE", date_echeance: { lt: now } } }),
    db.contractor.findMany({
      where: {
        actif: true,
        OR: [{ assurance_rc_pro: { lt: now } }, { assurance_decennale: { lt: now } }],
      },
      select: { id: true, nom: true, assurance_rc_pro: true, assurance_decennale: true },
    }),
    db.contractor.findMany({
      where: {
        actif: true,
        OR: [
          { assurance_rc_pro: { gte: now, lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) } },
          { assurance_decennale: { gte: now, lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) } },
        ],
      },
      select: { id: true, nom: true, assurance_rc_pro: true, assurance_decennale: true },
    }),
    db.mandate.findMany({
      where: { statut: "ACTIF", date_fin: { gte: now, lte: in30Days } },
      include: { owner: { select: { nom: true } }, property: { select: { nom: true } } },
    }),
    db.propertyDocument.count({ where: { statut: { in: ["EXPIRE", "MANQUANT"] } } }),
    db.review.count({ where: { reponse_gestionnaire: null } }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        return db.booking.aggregate({
          where: { statut: { in: ["CONFIRMED", "CHECKEDOUT"] }, check_in: { gte: d, lt: dEnd } },
          _sum: { revenu_net_proprietaire: true },
        }).then(r => ({
          month: d.toLocaleDateString("fr-FR", { month: "short" }),
          montant: r._sum.revenu_net_proprietaire ?? 0,
        }))
      })
    ),
    db.property.findMany({
      where: { statut: "ACTIF" },
      select: {
        id: true,
        nom: true,
        bookings: {
          where: { statut: { notIn: ["CANCELLED"] }, check_in: { gte: last30Start, lte: now } },
          select: { nb_nuits: true },
        },
      },
    }),
  ])

  const occupancy = occupancyData.map(p => ({
    id: p.id,
    nom: p.nom,
    nbNuits: p.bookings.reduce((s, b) => s + b.nb_nuits, 0),
    taux: Math.min(100, Math.round((p.bookings.reduce((s, b) => s + b.nb_nuits, 0) / 30) * 100)),
  })).sort((a, b) => b.taux - a.taux)

  const alerts: Array<{ id: string; severity: "critical" | "warning" | "info"; message: string; href?: string }> = []
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  for (const wo of criticalTravaux) {
    alerts.push({ id: `wo-${wo.id}`, severity: "critical", message: `Travaux CRITIQUE : ${wo.titre} — ${wo.property.nom}`, href: `/travaux/${wo.id}` })
  }
  if (overdueInvoices > 0) {
    alerts.push({ id: "inv-overdue", severity: "critical", message: `${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard de paiement`, href: "/facturation" })
  }
  for (const c of expiredInsurance) {
    const expired = []
    if (c.assurance_rc_pro && c.assurance_rc_pro < now) expired.push("RC Pro")
    if (c.assurance_decennale && c.assurance_decennale < now) expired.push("Décennale")
    alerts.push({ id: `ins-exp-${c.id}`, severity: "critical", message: `Assurance expirée (${expired.join(", ")}) — ${c.nom}`, href: `/prestataires/${c.id}` })
  }
  if (missingDocs > 0) {
    alerts.push({ id: "docs-missing", severity: "warning", message: `${missingDocs} document${missingDocs > 1 ? "s" : ""} légal manquant ou expiré`, href: "/biens" })
  }
  for (const c of expiringSoonInsurance) {
    const expiring = []
    if (c.assurance_rc_pro && c.assurance_rc_pro >= now && c.assurance_rc_pro <= in60) expiring.push("RC Pro")
    if (c.assurance_decennale && c.assurance_decennale >= now && c.assurance_decennale <= in60) expiring.push("Décennale")
    if (expiring.length > 0) alerts.push({ id: `ins-soon-${c.id}`, severity: "warning", message: `Assurance expire bientôt (${expiring.join(", ")}) — ${c.nom}`, href: `/prestataires/${c.id}` })
  }
  for (const m of expiringMandates) {
    alerts.push({ id: `mand-${m.id}`, severity: "warning", message: `Mandat expirant : ${m.property.nom} (${m.owner.nom})`, href: `/mandats/${m.id}` })
  }
  if (unrepliedReviews > 0) {
    alerts.push({ id: "reviews", severity: "info", message: `${unrepliedReviews} avis voyageur${unrepliedReviews > 1 ? "s" : ""} sans réponse` })
  }

  return {
    totalOwners,
    totalProperties,
    activeBookings,
    upcomingCheckIns,
    revenuMoisCourant: recentRevenu._sum.revenu_net_proprietaire ?? 0,
    todayArrivals,
    todayDepartures,
    pendingCleanings,
    pendingTravaux,
    alerts,
    monthlyRevenueTrend,
    occupancy,
  }
}
