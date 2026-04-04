import { z } from "zod"

export const guestSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  langue: z.string().default("fr"),
})

export type GuestFormData = z.infer<typeof guestSchema>
