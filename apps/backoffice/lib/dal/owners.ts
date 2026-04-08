import { db, Prisma } from "@conciergerie/db"

export async function getOwners() {
  return db.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { mandates: true } },
      mandantAccount: { select: { solde_courant: true } },
    },
  })
}

export async function getOwnerById(id: string) {
  return db.owner.findUnique({
    where: { id },
    include: {
      mandates: {
        include: { property: { select: { id: true, nom: true, statut: true, type: true } } },
        orderBy: { createdAt: "desc" },
      },
      mandantAccount: {
        include: {
          transactions: { orderBy: { date: "desc" }, take: 10 },
          reports: { orderBy: { createdAt: "desc" }, take: 12 },
        },
      },
      feeInvoices: { orderBy: { createdAt: "desc" }, take: 12 },
      ownerUsers: { orderBy: { createdAt: "desc" }, take: 1 },
      documents: { orderBy: { createdAt: "desc" }, take: 20 },
      messageThreads: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  })
}

export async function getOwnerBookings(ownerId: string) {
  return db.booking.findMany({
    where: {
      property: { mandate: { owner_id: ownerId } },
    },
    include: {
      property: { select: { id: true, nom: true } },
      guest: { select: { id: true, prenom: true, nom: true } },
    },
    orderBy: { check_in: "desc" },
    take: 100,
  })
}

export async function getOwnerStats(ownerId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [bookingsThisMonth, totalBookings, activeBookings, nbBiens] = await Promise.all([
    db.booking.findMany({
      where: {
        property: { mandate: { owner_id: ownerId } },
        check_in: { gte: startOfMonth, lte: endOfMonth },
        statut: { not: "CANCELLED" },
      },
      select: { revenu_net_proprietaire: true },
    }),
    db.booking.count({
      where: {
        property: { mandate: { owner_id: ownerId } },
        statut: { not: "CANCELLED" },
      },
    }),
    db.booking.count({
      where: {
        property: { mandate: { owner_id: ownerId } },
        statut: { in: ["CONFIRMED", "CHECKEDIN"] },
      },
    }),
    db.mandate.count({ where: { owner_id: ownerId, statut: "ACTIF" } }),
  ])

  return {
    revenuMoisCourant: bookingsThisMonth.reduce((s, b) => s + b.revenu_net_proprietaire, 0),
    totalBookings,
    activeBookings,
    nbBiens,
  }
}

export async function createOwner(data: {
  type: "INDIVIDUAL" | "SCI" | "INDIVISION"
  nom: string
  email: string
  telephone?: string
  adresse: Prisma.InputJsonValue
  rib_iban?: string
  nif?: string
  notes?: string
}) {
  const owner = await db.owner.create({ data })
  await db.mandantAccount.create({ data: { owner_id: owner.id } })
  return owner
}

export async function updateOwner(
  id: string,
  data: Partial<{
    type: "INDIVIDUAL" | "SCI" | "INDIVISION"
    nom: string
    email: string
    telephone: string
    adresse: Prisma.InputJsonValue
    rib_iban: string
    nif: string
    notes: string
  }>
) {
  return db.owner.update({ where: { id }, data })
}

export async function deleteOwner(id: string) {
  // Vérifier qu'il n'y a pas de réservations actives
  const activeBookings = await db.booking.count({
    where: {
      property: { mandate: { owner_id: id } },
      statut: { in: ["CONFIRMED", "CHECKEDIN"] },
    },
  })
  if (activeBookings > 0) {
    throw new Error(`Impossible de supprimer : ${activeBookings} réservation(s) active(s) en cours.`)
  }
  return db.owner.delete({ where: { id } })
}

export async function createOrResetOwnerPortalAccess(ownerId: string) {
  const bcrypt = await import("bcryptjs")
  const owner = await db.owner.findUnique({
    where: { id: ownerId },
    select: { email: true, ownerUsers: { take: 1 } },
  })
  if (!owner) throw new Error("Propriétaire introuvable")

  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!"
  const hash = await bcrypt.hash(tempPassword, 12)

  if (owner.ownerUsers.length > 0) {
    await db.ownerUser.update({
      where: { id: owner.ownerUsers[0].id },
      data: { password_hash: hash },
    })
    return { tempPassword, email: owner.email, action: "reset" as const }
  } else {
    await db.ownerUser.create({
      data: { owner_id: ownerId, email: owner.email, password_hash: hash },
    })
    return { tempPassword, email: owner.email, action: "created" as const }
  }
}
