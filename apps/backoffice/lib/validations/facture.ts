import { z } from "zod"

export const factureSchema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  periode_debut: z.string().min(1, "Date de début requise"),
  periode_fin: z.string().min(1, "Date de fin requise"),
  montant_ht: z.coerce.number().min(0, "Montant doit être positif"),
  tva_rate: z.coerce.number().min(0).max(1).default(0.20),
})

export type FactureFormData = z.infer<typeof factureSchema>

export function computeMontantTTC(montant_ht: number, tva_rate: number): number {
  return Math.round(montant_ht * (1 + tva_rate) * 100) / 100
}
