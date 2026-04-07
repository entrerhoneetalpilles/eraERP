export { sendEmail, buildEmailPayload } from "./client"
export { WelcomeOwnerEmail } from "./templates/welcome-owner"
export { BookingConfirmedEmail } from "./templates/booking-confirmed"
export { AccessCodesEmail } from "./templates/access-codes"
export { CrgMensuelEmail } from "./templates/crg-mensuel"
export { FactureEmail } from "./templates/facture"
export { DevisDemandEmail } from "./templates/devis-demande"
export { TravauxNotificationEmail } from "./templates/travaux-notification"
export { VirementEffectueEmail } from "./templates/virement-effectue"
export { ResetPasswordEmail } from "./templates/reset-password"
export { NouveauMessageEmail } from "./templates/nouveau-message"
export {
  sendWelcomeEmail,
  sendBookingConfirmedEmail,
  sendAccessCodesEmail,
  sendCrgMensuelEmail,
  sendFactureEmail,
  sendDevisDemandEmail,
  sendTravauxNotificationEmail,
  sendVirementEffectueEmail,
  sendResetPasswordEmail,
  sendNouveauMessageEmail,
} from "./render"
