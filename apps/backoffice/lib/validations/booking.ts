import { z } from "zod"

export const bookingSchema = z.object({
  property_id: z.string().min(1, "Bien requis"),
  guest_id: z.string().min(1, "Voyageur requis"),
  platform: z.enum(["AIRBNB", "DIRECT", "MANUAL"]).default("DIRECT"),
  platform_booking_id: z.string().optional(),
  check_in: z.string().min(1, "Date d'arrivée requise"),
  check_out: z.string().min(1, "Date de départ requise"),
  nb_nuits: z.coerce.number().int().min(1, "Minimum 1 nuit"),
  nb_voyageurs: z.coerce.number().int().min(1, "Minimum 1 voyageur"),
  montant_total: z.coerce.number().min(0),
  frais_menage: z.coerce.number().min(0).default(0),
  commission_plateforme: z.coerce.number().min(0).default(0),
  revenu_net_proprietaire: z.coerce.number().min(0),
  notes_internes: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export function computeRevenuNet({
  montant_total,
  frais_menage,
  commission_plateforme,
  taux_honoraires,
}: {
  montant_total: number
  frais_menage: number
  commission_plateforme: number
  taux_honoraires: number
}): number {
  const revenu_brut = montant_total - commission_plateforme
  return Math.round((revenu_brut * (1 - taux_honoraires / 100)) * 100) / 100
}
