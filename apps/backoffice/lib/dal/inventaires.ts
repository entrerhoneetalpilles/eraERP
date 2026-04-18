import { db } from "@conciergerie/db"

export async function getPropertyInventories() {
  return db.propertyInventory.findMany({
    include: {
      property: { select: { id: true, nom: true } },
      booking: {
        select: {
          id: true,
          check_in: true,
          check_out: true,
          guest: { select: { prenom: true, nom: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  })
}

export async function createPropertyInventory(data: {
  property_id: string
  booking_id?: string
  type: "ENTREE" | "SORTIE"
  date: Date
  realise_par: string
}) {
  return db.propertyInventory.create({
    data: {
      property_id: data.property_id,
      booking_id: data.booking_id,
      type: data.type,
      date: data.date,
      realise_par: data.realise_par,
      pieces: [],
    },
  })
}

export async function updateInventorySignatures(
  id: string,
  { signe_voyageur, signe_agent }: { signe_voyageur?: boolean; signe_agent?: boolean }
) {
  return db.propertyInventory.update({
    where: { id },
    data: {
      ...(signe_voyageur !== undefined ? { signe_voyageur } : {}),
      ...(signe_agent !== undefined ? { signe_agent } : {}),
    },
  })
}

export async function getInventoryStats() {
  const [total, signedBoth, pendingSignature] = await Promise.all([
    db.propertyInventory.count(),
    db.propertyInventory.count({ where: { signe_voyageur: true, signe_agent: true } }),
    db.propertyInventory.count({ where: { OR: [{ signe_voyageur: false }, { signe_agent: false }] } }),
  ])
  return { total, signedBoth, pendingSignature }
}
