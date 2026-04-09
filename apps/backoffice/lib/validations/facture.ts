import { z } from "zod"

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantite: z.coerce.number().min(0.01),
  unite: z.string().default("forfait"),
  prix_unitaire: z.coerce.number().min(0),
  montant_ht: z.coerce.number().min(0),
  tva_rate: z.coerce.number().min(0).max(1).default(0.20),
  ordre: z.coerce.number().int().default(0),
})

export const factureSchema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  objet: z.string().optional(),
  periode_debut: z.string().min(1, "Date de début requise"),
  periode_fin: z.string().min(1, "Date de fin requise"),
  montant_ht: z.coerce.number().min(0, "Montant doit être positif"),
  tva_rate: z.coerce.number().min(0).max(1).default(0.20),
  remise_pourcent: z.coerce.number().min(0).max(100).optional(),
  date_echeance: z.string().optional(),
  notes: z.string().optional(),
  notes_client: z.string().optional(),
  line_items_json: z.string().optional(),
})

export type FactureFormData = z.infer<typeof factureSchema>
export type LineItemData = z.infer<typeof lineItemSchema>

export function computeMontantTTC(montant_ht: number, tva_rate: number): number {
  return Math.round(montant_ht * (1 + tva_rate) * 100) / 100
}

export function computeLineItemHT(quantite: number, prix_unitaire: number): number {
  return Math.round(quantite * prix_unitaire * 100) / 100
}

export function computeTotalsFromLineItems(
  lineItems: { montant_ht: number; tva_rate: number }[],
  remise_pourcent?: number
): { montant_ht: number; tva_amount: number; montant_ttc: number } {
  const subtotal_ht = lineItems.reduce((s, l) => s + l.montant_ht, 0)
  const remise_factor = remise_pourcent ? 1 - remise_pourcent / 100 : 1
  const montant_ht = Math.round(subtotal_ht * remise_factor * 100) / 100
  const tva_amount = lineItems.reduce((s, l) => s + l.montant_ht * remise_factor * l.tva_rate, 0)
  const montant_ttc = Math.round((montant_ht + tva_amount) * 100) / 100
  return { montant_ht, tva_amount: Math.round(tva_amount * 100) / 100, montant_ttc }
}
