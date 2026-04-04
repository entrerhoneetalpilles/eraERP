import { z } from "zod"

const adresseSchema = z.object({
  rue: z.string().min(1),
  complement: z.string().optional(),
  code_postal: z.string().min(5).max(5),
  ville: z.string().min(1),
  pays: z.string().default("France"),
})

export const propertySchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.enum(["APPARTEMENT", "VILLA", "LOFT", "CHALET", "AUTRE"]),
  superficie: z.coerce.number().positive("Superficie invalide"),
  nb_chambres: z.coerce.number().int().min(0),
  capacite_voyageurs: z.coerce.number().int().min(1, "Capacité minimum 1"),
  adresse: adresseSchema,
  amenities: z.array(z.string()).optional().default([]),
  statut: z.enum(["ACTIF", "INACTIF", "TRAVAUX"]).default("ACTIF"),
})

export type PropertyFormData = z.infer<typeof propertySchema>
