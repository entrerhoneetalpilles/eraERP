import { z } from "zod"

export const cleaningTaskSchema = z.object({
  prestataire_id: z.string().optional(),
  date_prevue: z.string().min(1, "Date requise"),
  notes: z.string().optional(),
})

export type CleaningTaskFormData = z.infer<typeof cleaningTaskSchema>
