import { z } from "zod"

export const prestataireSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  metier: z.string().min(1, "Métier requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  siret: z.string().length(14, "SIRET doit faire 14 caractères").optional().or(z.literal("")),
  notes: z.string().optional(),
})

export type PrestataireFormData = z.infer<typeof prestataireSchema>
