import { db } from "@conciergerie/db"

export async function getAttestationOverview(annee?: number) {
  const targetAnnee = annee ?? new Date().getFullYear() - 1

  const owners = await db.owner.findMany({
    select: {
      id: true,
      nom: true,
      email: true,
      documents: {
        where: { type: "ATTESTATION_FISCALE" },
        select: { id: true, nom: true, url_storage: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      mandantAccount: {
        select: {
          reports: {
            where: {
              periode_debut: { gte: new Date(targetAnnee, 0, 1) },
              periode_fin: { lte: new Date(targetAnnee, 11, 31, 23, 59, 59) },
            },
            select: {
              revenus_sejours: true,
              honoraires_deduits: true,
              charges_deduites: true,
              montant_reverse: true,
            },
          },
        },
      },
    },
    orderBy: { nom: "asc" },
  })

  return owners.map(owner => {
    const reports = owner.mandantAccount?.reports ?? []
    const attestationThisYear = owner.documents.find(d => d.nom.includes(String(targetAnnee)))
    const hasData = reports.length > 0

    return {
      id: owner.id,
      nom: owner.nom,
      email: owner.email,
      hasData,
      nbCrg: reports.length,
      totalHonoraires: reports.reduce((s, r) => s + r.honoraires_deduits, 0),
      attestationGenerated: !!attestationThisYear,
      attestationDoc: attestationThisYear ?? null,
    }
  })
}
