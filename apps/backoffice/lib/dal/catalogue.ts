import { db } from "@conciergerie/db"

export async function getServiceCatalog() {
  return db.serviceCatalog.findMany({
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
    include: { _count: { select: { orders: true } } },
  })
}

export async function createService(data: {
  nom: string; description?: string; categorie: string
  tarif: number; unite: "ACTE" | "HEURE" | "NUIT" | "MOIS"; tva_rate?: number
}) {
  return db.serviceCatalog.create({ data: { ...data, tva_rate: data.tva_rate ?? 0.20 } })
}

export async function updateService(id: string, data: Partial<{
  nom: string; description: string | null; categorie: string
  tarif: number; unite: "ACTE" | "HEURE" | "NUIT" | "MOIS"; tva_rate: number; actif: boolean
}>) {
  return db.serviceCatalog.update({ where: { id }, data })
}

export async function deleteService(id: string) {
  return db.serviceCatalog.delete({ where: { id } })
}
