// packages/email/src/render.ts
import { render } from "@react-email/render"
import { sendEmail } from "./client"
import { WelcomeOwnerEmail } from "./templates/welcome-owner"
import { BookingConfirmedEmail } from "./templates/booking-confirmed"
import { AccessCodesEmail } from "./templates/access-codes"
import { CrgMensuelEmail } from "./templates/crg-mensuel"
import { FactureEmail } from "./templates/facture"
import { DevisDemandEmail } from "./templates/devis-demande"
import { TravauxNotificationEmail } from "./templates/travaux-notification"
import { VirementEffectueEmail } from "./templates/virement-effectue"
import { ResetPasswordEmail } from "./templates/reset-password"
import { NouveauMessageEmail } from "./templates/nouveau-message"

export async function sendWelcomeEmail(props: {
  to: string
  ownerName: string
  loginUrl: string
  temporaryPassword?: string
}) {
  const html = await render(
    WelcomeOwnerEmail({ ownerName: props.ownerName, loginUrl: props.loginUrl, temporaryPassword: props.temporaryPassword })
  )
  return sendEmail({ to: props.to, subject: "Bienvenue dans votre espace propriétaire", html })
}

export async function sendBookingConfirmedEmail(props: {
  to: string
  ownerName: string
  propertyName: string
  guestName: string
  checkIn: string
  checkOut: string
  nbNuits: number
  revenuNet: string
}) {
  const { to, ...rest } = props
  const html = await render(BookingConfirmedEmail(rest))
  return sendEmail({ to, subject: `Nouvelle réservation — ${props.propertyName}`, html })
}

export async function sendAccessCodesEmail(props: {
  to: string
  guestName: string
  propertyName: string
  checkIn: string
  checkOut: string
  typeAcces: string
  codeAcces: string | null
  instructionsArrivee: string | null
  wifiNom: string | null
  wifiMdp: string | null
}) {
  const { to, ...rest } = props
  const html = await render(AccessCodesEmail(rest))
  return sendEmail({ to, subject: `Informations d'accès — ${props.propertyName}`, html })
}

export async function sendCrgMensuelEmail(props: {
  to: string
  ownerName: string
  periode: string
  revenusBruts: string
  fraisGestion: string
  autresCharges: string
  revenuNet: string
  portalUrl: string
}) {
  const { to, ...rest } = props
  const html = await render(CrgMensuelEmail(rest))
  return sendEmail({ to, subject: `Compte-rendu de gestion — ${props.periode}`, html })
}

export async function sendFactureEmail(props: {
  to: string
  ownerName: string
  numeroFacture: string
  periode: string
  montantHT: string
  montantTTC: string
  portalUrl: string
}) {
  const { to, ...rest } = props
  const html = await render(FactureEmail(rest))
  return sendEmail({ to, subject: `Facture d'honoraires n° ${props.numeroFacture}`, html })
}

export async function sendDevisDemandEmail(props: {
  to: string
  contractorName: string
  propertyName: string
  titreOrdre: string
  description: string
  urgence: string
}) {
  const { to, ...rest } = props
  const html = await render(DevisDemandEmail(rest))
  return sendEmail({ to, subject: `Demande de devis — ${props.titreOrdre}`, html })
}

export async function sendTravauxNotificationEmail(props: {
  to: string
  ownerName: string
  propertyName: string
  titreOrdre: string
  urgence: string
  description: string
}) {
  const { to, ...rest } = props
  const html = await render(TravauxNotificationEmail(rest))
  return sendEmail({ to, subject: `Ordre de travaux — ${props.propertyName}`, html })
}

export async function sendVirementEffectueEmail(props: {
  to: string
  ownerName: string
  montant: string
  periode: string
  iban: string
}) {
  const { to, ...rest } = props
  const html = await render(VirementEffectueEmail(rest))
  return sendEmail({ to, subject: `Virement effectué — ${props.periode}`, html })
}

export async function sendResetPasswordEmail(props: {
  to: string
  name: string
  resetUrl: string
}) {
  const { to, ...rest } = props
  const html = await render(ResetPasswordEmail(rest))
  return sendEmail({ to, subject: "Réinitialisation de votre mot de passe", html })
}

export async function sendNouveauMessageEmail(props: {
  to: string
  recipientName: string
  senderName: string
  preview: string
  mailboxUrl: string
}) {
  const { to, ...rest } = props
  const html = await render(NouveauMessageEmail(rest))
  return sendEmail({ to, subject: `Nouveau message de ${props.senderName}`, html })
}
