import { db } from "@conciergerie/db"

export async function getPrestataires() {
  return db.contractor.findMany({
    orderBy: [{ actif: "desc" }, { nom: "asc" }],
    include: { _count: { select: { workOrders: true, cleaningTasks: true } } },
  })
}

export async function getPrestataireById(id: string) {
  return db.contractor.findUnique({
    where: { id },
    include: {
      workOrders: {
        include: { property: { select: { id: true, nom: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      cleaningTasks: {
        include: {
          property: { select: { id: true, nom: true } },
          booking: { select: { check_in: true, check_out: true } },
        },
        orderBy: { date_prevue: "desc" },
        take: 30,
      },
    },
  })
}

export async function getPrestataireStats(id: string) {
  const [workOrders, cleaningTasks] = await Promise.all([
    db.workOrder.findMany({
      where: { contractor_id: id },
      select: { statut: true, montant_devis: true, montant_facture: true, urgence: true },
    }),
    db.cleaningTask.findMany({
      where: { prestataire_id: id },
      select: { statut: true, note_qualite: true, montant: true, duree_estimee: true, duree_reelle: true },
    }),
  ])

  const completedWO = workOrders.filter(w => w.statut === "TERMINE")
  const terminatedCleanings = cleaningTasks.filter(c => c.statut === "TERMINEE")
  const withNote = terminatedCleanings.filter(c => (c as any).note_qualite != null)
  const avgNote = withNote.length > 0
    ? withNote.reduce((s, c) => s + ((c as any).note_qualite ?? 0), 0) / withNote.length
    : null
  const totalCA_travaux = completedWO.reduce((s, w) => s + ((w as any).montant_facture ?? w.montant_devis ?? 0), 0)
  const totalCA_menage = terminatedCleanings.reduce((s, c) => s + ((c as any).montant ?? 0), 0)
  const withDuree = terminatedCleanings.filter(c => (c as any).duree_reelle)
  const avgDuree = withDuree.length > 0 ? withDuree.reduce((s, c) => s + ((c as any).duree_reelle ?? 0), 0) / withDuree.length : null

  return {
    nbTravaux: workOrders.length,
    nbTravauxTermines: completedWO.length,
    nbMenages: cleaningTasks.length,
    nbMenagesTermines: terminatedCleanings.length,
    nbProblemes: cleaningTasks.filter(c => c.statut === "PROBLEME").length,
    avgNote,
    totalCA: totalCA_travaux + totalCA_menage,
    totalCA_travaux,
    totalCA_menage,
    avgDureeMinutes: avgDuree,
  }
}

export async function createPrestataire(data: {
  nom: string; metier: string; email?: string; telephone?: string; siret?: string
  assurance_rc_pro?: string; assurance_decennale?: string; tarif_horaire?: number
  tarif_forfait_menage?: number; zone_intervention?: string; delai_intervention_h?: number; notes?: string
}) {
  return db.contractor.create({
    data: {
      nom: data.nom, metier: data.metier,
      email: data.email || null, telephone: data.telephone || null,
      siret: data.siret || null, notes: data.notes || null,
      assurance_rc_pro: data.assurance_rc_pro ? new Date(data.assurance_rc_pro) : null,
      assurance_decennale: data.assurance_decennale ? new Date(data.assurance_decennale) : null,
      tarif_horaire: data.tarif_horaire || null,
      tarif_forfait_menage: data.tarif_forfait_menage || null,
      zone_intervention: data.zone_intervention || null,
      delai_intervention_h: data.delai_intervention_h || null,
    },
  })
}

export async function updatePrestataire(id: string, data: Partial<{
  nom: string; metier: string; email: string | null; telephone: string | null; siret: string | null
  assurance_rc_pro: Date | null; assurance_decennale: Date | null
  note_qualite: number | null; tarif_horaire: number | null; tarif_forfait_menage: number | null
  zone_intervention: string | null; delai_intervention_h: number | null; notes: string | null; actif: boolean
}>) {
  return db.contractor.update({ where: { id }, data })
}
