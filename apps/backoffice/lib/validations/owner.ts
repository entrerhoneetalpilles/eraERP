import { z } from "zod"

const adresseSchema = z.object({
  rue: z.string().min(1, "Rue requise"),
  complement: z.string().optional(),
  code_postal: z.string().min(5, "Code postal invalide").max(5),
  ville: z.string().min(1, "Ville requise"),
  pays: z.string().default("France"),
})

export const ownerSchema = z.object({
  type: z.enum(["INDIVIDUAL", "SCI", "INDIVISION"]),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  adresse: adresseSchema,
  rib_iban: z.string().optional(),
  nif: z.string().optional(),
  notes: z.string().optional(),
})

export type OwnerFormData = z.infer<typeof ownerSchema>
