import { z } from "zod"

export const workorderSchema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  contractor_id: z.string().optional(),
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  type: z.string().min(1, "Type requis"),
  urgence: z.enum(["NORMALE", "URGENTE", "CRITIQUE"]),
  imputable_a: z.enum(["PROPRIETAIRE", "SOCIETE"]),
  notes: z.string().optional(),
})

export type WorkOrderFormData = z.infer<typeof workorderSchema>
