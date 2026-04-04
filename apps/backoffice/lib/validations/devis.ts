import { z } from "zod"

export const devisSchema = z.object({
  montant_devis: z.number({ required_error: "Montant requis" }).positive("Montant doit être positif"),
  notes_devis: z.string().optional(),
})

export type DevisFormData = z.infer<typeof devisSchema>

/**
 * Returns the next WorkOrder statut after a devis is recorded.
 * If montant > seuil_validation_devis on the mandate, the owner must validate.
 */
export function validateDevisAgainstSeuil(
  montant: number,
  seuil: number
): "VALIDE" | "EN_ATTENTE_VALIDATION" {
  return montant <= seuil ? "VALIDE" : "EN_ATTENTE_VALIDATION"
}
