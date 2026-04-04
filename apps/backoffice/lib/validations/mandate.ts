import { z } from "zod"

export const mandateSchema = z.object({
  owner_id: z.string().min(1, "Propriétaire requis"),
  property_id: z.string().min(1, "Bien requis"),
  numero_mandat: z.string().min(1, "Numéro de mandat requis"),
  date_debut: z.string().min(1, "Date de début requise"),
  date_fin: z.string().optional(),
  taux_honoraires: z.coerce
    .number()
    .min(0, "Taux invalide")
    .max(100, "Taux maximum 100%"),
  honoraires_location: z.coerce.number().min(0).optional(),
  taux_horaire_ht: z.coerce.number().min(0).optional(),
  seuil_validation_devis: z.coerce.number().min(0).default(500),
  reconduction_tacite: z.coerce.boolean().default(true),
  prestations_incluses: z.array(z.string()).optional().default([]),
})

export type MandateFormData = z.infer<typeof mandateSchema>
