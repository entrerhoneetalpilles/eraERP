# Emails Module Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre le module emails 100% fonctionnel — templates rendus, envoi transactionnel, webhook sécurisé, logs d'envoi, gestion des réponses.

**Architecture:** Le package `@conciergerie/email` centralise le rendu JSX→HTML et les wrappers d'envoi. Les actions métier (réservation, CRG, facture) appellent ces wrappers. Le webhook Resend est sécurisé par HMAC-SHA256 et classe les emails entrants par type de contact.

**Tech Stack:** React Email (`@react-email/render`), Resend SDK, Prisma, Next.js Server Actions, TypeScript.

---

## Task 1 — packages/email : renderTemplate + wrappers + 8 templates

**Files:**
- Modify: `packages/email/src/client.ts`
- Create: `packages/email/src/render.ts`
- Create: `packages/email/src/templates/access-codes.tsx`
- Create: `packages/email/src/templates/crg-mensuel.tsx`
- Create: `packages/email/src/templates/facture.tsx`
- Create: `packages/email/src/templates/devis-demande.tsx`
- Create: `packages/email/src/templates/travaux-notification.tsx`
- Create: `packages/email/src/templates/virement-effectue.tsx`
- Create: `packages/email/src/templates/reset-password.tsx`
- Create: `packages/email/src/templates/nouveau-message.tsx`
- Modify: `packages/email/src/index.ts`

- [ ] **Créer `packages/email/src/render.ts`** — fonction centrale de rendu JSX→HTML + wrappers typés

```typescript
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

export async function sendDevisDemandeEmail(props: {
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
```

- [ ] **Créer `packages/email/src/templates/access-codes.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  guestName: string
  propertyName: string
  checkIn: string
  checkOut: string
  typeAcces: string
  codeAcces: string | null
  instructionsArrivee: string | null
  wifiNom: string | null
  wifiMdp: string | null
}

export function AccessCodesEmail({ guestName, propertyName, checkIn, checkOut, typeAcces, codeAcces, instructionsArrivee, wifiNom, wifiMdp }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Vos informations d'accès pour {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Informations d'accès
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {guestName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Votre séjour à <strong>{propertyName}</strong> commence le <strong>{checkIn}</strong> et se termine le <strong>{checkOut}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Type d'accès :</strong> {typeAcces}
            </Text>
            {codeAcces && (
              <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
                <strong>Code :</strong> {codeAcces}
              </Text>
            )}
            {wifiNom && (
              <>
                <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
                <Text style={{ margin: "0 0 4px", color: "#8C7566", fontSize: "14px" }}>
                  <strong>WiFi :</strong> {wifiNom}
                </Text>
                {wifiMdp && (
                  <Text style={{ margin: 0, color: "#8C7566", fontSize: "14px" }}>
                    <strong>Mot de passe WiFi :</strong> {wifiMdp}
                  </Text>
                )}
              </>
            )}
          </Section>
          {instructionsArrivee && (
            <>
              <Text style={{ color: "#8C7566", fontWeight: "600", fontSize: "14px", marginTop: "20px" }}>Instructions d'arrivée</Text>
              <Text style={{ color: "#6b5f57", lineHeight: "1.6", whiteSpace: "pre-wrap", fontSize: "14px" }}>{instructionsArrivee}</Text>
            </>
          )}
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/crg-mensuel.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from "@react-email/components"

interface Props {
  ownerName: string
  periode: string
  revenusBruts: string
  fraisGestion: string
  autresCharges: string
  revenuNet: string
  portalUrl: string
}

export function CrgMensuelEmail({ ownerName, periode, revenusBruts, fraisGestion, autresCharges, revenuNet, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre compte-rendu de gestion — {periode}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Compte-rendu de gestion
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Voici votre compte-rendu de gestion pour la période <strong>{periode}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Revenus bruts :</strong> {revenusBruts} €
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Frais de gestion :</strong> -{fraisGestion} €
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Autres charges :</strong> -{autresCharges} €
            </Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#9BA88D", fontSize: "18px", fontWeight: "600" }}>
              Revenu net : {revenuNet} €
            </Text>
          </Section>
          <Button href={portalUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Voir le détail sur mon espace
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/facture.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from "@react-email/components"

interface Props {
  ownerName: string
  numeroFacture: string
  periode: string
  montantHT: string
  montantTTC: string
  portalUrl: string
}

export function FactureEmail({ ownerName, numeroFacture, periode, montantHT, montantTTC, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Facture d'honoraires n° {numeroFacture}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Facture d'honoraires
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Veuillez trouver ci-dessous le détail de votre facture <strong>n° {numeroFacture}</strong> pour la période <strong>{periode}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Montant HT :</strong> {montantHT} €
            </Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#9BA88D", fontSize: "16px", fontWeight: "600" }}>
              Montant TTC : {montantTTC} €
            </Text>
          </Section>
          <Button href={portalUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Télécharger la facture
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/devis-demande.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  contractorName: string
  propertyName: string
  titreOrdre: string
  description: string
  urgence: string
}

export function DevisDemandEmail({ contractorName, propertyName, titreOrdre, description, urgence }: Props) {
  const urgenceLabel: Record<string, string> = { NORMALE: "Normale", URGENTE: "Urgente", CRITIQUE: "Critique" }
  return (
    <Html>
      <Head />
      <Preview>Demande de devis — {titreOrdre}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Demande de devis
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {contractorName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Nous faisons appel à vos services pour le bien <strong>{propertyName}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Prestation :</strong> {titreOrdre}
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Urgence :</strong> {urgenceLabel[urgence] ?? urgence}
            </Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{description}</Text>
          </Section>
          <Text style={{ color: "#6b5f57", fontSize: "14px" }}>
            Merci de nous faire parvenir votre devis par retour d'email.
          </Text>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/travaux-notification.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  ownerName: string
  propertyName: string
  titreOrdre: string
  urgence: string
  description: string
}

export function TravauxNotificationEmail({ ownerName, propertyName, titreOrdre, urgence, description }: Props) {
  const urgenceLabel: Record<string, string> = { NORMALE: "Normale", URGENTE: "Urgente ⚠️", CRITIQUE: "Critique 🔴" }
  return (
    <Html>
      <Head />
      <Preview>Ordre de travaux — {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Ordre de travaux ouvert
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Un ordre de travaux a été créé pour votre bien <strong>{propertyName}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Prestation :</strong> {titreOrdre}
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Urgence :</strong> {urgenceLabel[urgence] ?? urgence}
            </Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px", whiteSpace: "pre-wrap" }}>{description}</Text>
          </Section>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/virement-effectue.tsx`**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  ownerName: string
  montant: string
  periode: string
  iban: string
}

export function VirementEffectueEmail({ ownerName, montant, periode, iban }: Props) {
  const ibanMasked = iban.length > 8 ? `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}` : iban
  return (
    <Html>
      <Head />
      <Preview>Virement effectué — {periode}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Virement effectué
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Votre reversement pour la période <strong>{periode}</strong> a bien été effectué.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Montant viré :</strong> {montant} €
            </Text>
            <Text style={{ margin: 0, color: "#8C7566", fontSize: "14px" }}>
              <strong>IBAN destinataire :</strong> {ibanMasked}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/reset-password.tsx`**

```tsx
import { Body, Button, Container, Head, Heading, Html, Preview, Text, Hr } from "@react-email/components"

interface Props {
  name: string
  resetUrl: string
}

export function ResetPasswordEmail({ name, resetUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Réinitialisation du mot de passe
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {name},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expire dans 1 heure.
          </Text>
          <Button href={resetUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "20px" }}>
            Réinitialiser mon mot de passe
          </Button>
          <Text style={{ color: "#a09080", fontSize: "13px", marginTop: "24px" }}>
            Si vous n'avez pas fait cette demande, ignorez cet email.
          </Text>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Créer `packages/email/src/templates/nouveau-message.tsx`**

```tsx
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  recipientName: string
  senderName: string
  preview: string
  mailboxUrl: string
}

export function NouveauMessageEmail({ recipientName, senderName, preview, mailboxUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau message de {senderName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Nouveau message
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {recipientName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Vous avez reçu un nouveau message de <strong>{senderName}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0", borderLeft: "3px solid #D6B8A8" }}>
            <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px", fontStyle: "italic", lineHeight: "1.6" }}>
              "{preview}{preview.length >= 120 ? "…" : ""}"
            </Text>
          </Section>
          <Button href={mailboxUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Répondre au message
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Mettre à jour `packages/email/src/index.ts`** — exporter tous les wrappers et templates

```typescript
// packages/email/src/index.ts
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
```

---

## Task 2 — Webhook sécurisé + EmailLog (indépendant de Task 1)

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `apps/backoffice/lib/dal/email-log.ts`
- Modify: `apps/backoffice/app/api/webhooks/airbnb/resend/route.ts`

- [ ] **Ajouter le modèle `EmailLog` dans `packages/db/prisma/schema.prisma`** — après le bloc MESSAGERIE

```prisma
// ─── EMAIL LOG ─────────────────────────────────────────────────

model EmailLog {
  id         String   @id @default(cuid())
  resend_id  String?
  to         String
  subject    String
  template   String
  status     String   @default("sent")
  error      String?
  owner_id   String?
  booking_id String?
  createdAt  DateTime @default(now())

  @@map("email_logs")
}
```

- [ ] **Lancer `prisma db push`**

```bash
cd packages/db && npx prisma db push
```

- [ ] **Créer `apps/backoffice/lib/dal/email-log.ts`**

```typescript
import { db } from "@conciergerie/db"

export async function logEmail(data: {
  to: string
  subject: string
  template: string
  resend_id?: string | null
  status?: string
  error?: string
  owner_id?: string
  booking_id?: string
}) {
  return db.emailLog.create({ data: { ...data, status: data.status ?? "sent" } })
}

export async function getEmailLogs(filters?: { owner_id?: string; booking_id?: string }) {
  return db.emailLog.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}
```

- [ ] **Sécuriser et améliorer `apps/backoffice/app/api/webhooks/airbnb/resend/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createThread } from '@/lib/dal/emails'
import { db } from '@conciergerie/db'

function verifyResendSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  const expected = hmac.digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

async function resolveContactType(fromEmail: string): Promise<{
  contact_type: string
  owner_id?: string
  guest_id?: string
  contractor_id?: string
}> {
  const owner = await db.owner.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (owner) return { contact_type: 'proprietaire', owner_id: owner.id }

  const guest = await db.guest.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (guest) return { contact_type: 'voyageur', guest_id: guest.id }

  const contractor = await db.contractor.findFirst({ where: { email: fromEmail }, select: { id: true } })
  if (contractor) return { contact_type: 'prestataire', contractor_id: contractor.id }

  return { contact_type: 'autre' }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (webhookSecret) {
      const signature = req.headers.get('svix-signature') ?? req.headers.get('resend-signature') ?? ''
      if (!verifyResendSignature(rawBody, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { from, subject, text, html, id, to } = payload

    if (!from || !id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { contact_type, owner_id, guest_id, contractor_id } = await resolveContactType(from)

    await createThread({
      subject: subject || 'Sans objet',
      contact_type,
      folder: 'inbox',
      owner_id,
      guest_id,
      contractor_id,
      to_email: Array.isArray(to) ? to[0] : to ?? 'contact@entre-rhone-alpilles.fr',
      to_name: 'Conciergerie',
      firstMessage: {
        contenu: html || text || 'Message sans contenu',
        author_id: from,
      },
      resend_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook Resend]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Task 3 — Envoi transactionnel sur événements métier (dépend Task 1)

**Files:**
- Modify: `apps/backoffice/app/(protected)/reservations/new/actions.ts`
- Modify: `apps/backoffice/app/(protected)/crg/new/actions.ts`
- Modify: `apps/backoffice/app/(protected)/facturation/new/actions.ts`
- Modify: `apps/backoffice/app/(protected)/travaux/new/actions.ts`

- [ ] **Modifier `reservations/new/actions.ts`** — envoyer email au propriétaire après création réservation

```typescript
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { bookingSchema } from "@/lib/validations/booking"
import { createBooking } from "@/lib/dal/bookings"
import { getBookingById } from "@/lib/dal/bookings"
import { sendBookingConfirmedEmail, sendAccessCodesEmail } from "@conciergerie/email"
import { logEmail } from "@/lib/dal/email-log"

export async function createBookingAction(_prev: unknown, formData: FormData) {
  const raw = {
    property_id: formData.get("property_id"),
    guest_id: formData.get("guest_id"),
    platform: formData.get("platform") || "DIRECT",
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    nb_nuits: formData.get("nb_nuits"),
    nb_voyageurs: formData.get("nb_voyageurs"),
    montant_total: formData.get("montant_total"),
    frais_menage: formData.get("frais_menage") || 0,
    commission_plateforme: formData.get("commission_plateforme") || 0,
    revenu_net_proprietaire: formData.get("revenu_net_proprietaire"),
    notes_internes: formData.get("notes_internes") || undefined,
  }

  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const booking = await createBooking({
    ...parsed.data,
    check_in: new Date(parsed.data.check_in),
    check_out: new Date(parsed.data.check_out),
  })

  // Récupérer données complètes pour les emails
  const full = await getBookingById(booking.id)
  if (full) {
    const checkInStr = new Date(full.check_in).toLocaleDateString("fr-FR")
    const checkOutStr = new Date(full.check_out).toLocaleDateString("fr-FR")

    // Email au propriétaire
    if (full.property.mandate?.owner?.email) {
      try {
        const result = await sendBookingConfirmedEmail({
          to: full.property.mandate.owner.email,
          ownerName: full.property.mandate.owner.nom,
          propertyName: full.property.nom,
          guestName: `${full.guest.prenom} ${full.guest.nom}`,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          nbNuits: full.nb_nuits,
          revenuNet: full.revenu_net_proprietaire.toFixed(2),
        })
        await logEmail({
          to: full.property.mandate.owner.email,
          subject: `Nouvelle réservation — ${full.property.nom}`,
          template: "booking-confirmed",
          resend_id: result?.id,
          owner_id: full.property.mandate.owner.id,
          booking_id: full.id,
        })
      } catch (e) {
        console.error("[Email] Erreur booking-confirmed owner:", e)
      }
    }

    // Email au voyageur avec codes d'accès si disponibles
    if (full.guest.email && full.property.access) {
      try {
        const access = full.property.access
        const result = await sendAccessCodesEmail({
          to: full.guest.email,
          guestName: full.guest.prenom,
          propertyName: full.property.nom,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          typeAcces: access.type_acces ?? "CODE",
          codeAcces: access.code_acces,
          instructionsArrivee: access.instructions_arrivee,
          wifiNom: access.wifi_nom,
          wifiMdp: access.wifi_mdp,
        })
        await logEmail({
          to: full.guest.email,
          subject: `Informations d'accès — ${full.property.nom}`,
          template: "access-codes",
          resend_id: result?.id,
          booking_id: full.id,
        })
      } catch (e) {
        console.error("[Email] Erreur access-codes guest:", e)
      }
    }
  }

  revalidatePath("/reservations")
  redirect(`/reservations/${booking.id}`)
}
```

- [ ] **Lire `apps/backoffice/app/(protected)/crg/new/actions.ts`** puis modifier pour envoyer `sendCrgMensuelEmail` après génération CRG

Le fichier `crg/new/actions.ts` crée un ManagementReport. Après la création, récupérer le propriétaire via `owner_id` et envoyer l'email CRG.

```typescript
// Ajouter après la création du rapport (adapter selon le vrai fichier) :
try {
  const owner = await db.owner.findUnique({ where: { id: ownerId }, select: { nom: true, email: true } })
  if (owner?.email) {
    const result = await sendCrgMensuelEmail({
      to: owner.email,
      ownerName: owner.nom,
      periode: `${periodeDebut} — ${periodeFin}`,
      revenusBruts: revenusBruts.toFixed(2),
      fraisGestion: fraisGestion.toFixed(2),
      autresCharges: "0.00",
      revenuNet: revenuNet.toFixed(2),
      portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/finances`,
    })
    await logEmail({
      to: owner.email,
      subject: `Compte-rendu de gestion — ${periodeDebut}`,
      template: "crg-mensuel",
      resend_id: result?.id,
      owner_id: ownerId,
    })
  }
} catch (e) {
  console.error("[Email] Erreur crg-mensuel:", e)
}
```

- [ ] **Modifier `facturation/new/actions.ts`** — envoyer `sendFactureEmail` après création facture

```typescript
// Ajouter après création de la FeeInvoice (adapter selon le vrai fichier) :
try {
  const owner = await db.owner.findUnique({ where: { id: ownerId }, select: { nom: true, email: true } })
  if (owner?.email) {
    const result = await sendFactureEmail({
      to: owner.email,
      ownerName: owner.nom,
      numeroFacture: invoice.numero,
      periode: `${invoice.periode_debut} — ${invoice.periode_fin}`,
      montantHT: invoice.montant_ht.toFixed(2),
      montantTTC: invoice.montant_ttc.toFixed(2),
      portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.entrerhonenalpilles.fr"}/documents`,
    })
    await logEmail({
      to: owner.email,
      subject: `Facture d'honoraires n° ${invoice.numero}`,
      template: "facture",
      resend_id: result?.id,
      owner_id: ownerId,
    })
  }
} catch (e) {
  console.error("[Email] Erreur facture:", e)
}
```

- [ ] **Modifier `travaux/new/actions.ts`** — envoyer `sendDevisDemandeEmail` au prestataire si assigné

```typescript
// Ajouter après création work order si contractor_id présent (adapter selon le vrai fichier) :
try {
  if (workOrder.contractor_id) {
    const contractor = await db.contractor.findUnique({
      where: { id: workOrder.contractor_id },
      select: { nom: true, email: true },
    })
    const property = await db.property.findUnique({
      where: { id: workOrder.property_id },
      select: { nom: true },
    })
    if (contractor?.email && property) {
      const result = await sendDevisDemandeEmail({
        to: contractor.email,
        contractorName: contractor.nom,
        propertyName: property.nom,
        titreOrdre: workOrder.titre,
        description: workOrder.description ?? "",
        urgence: workOrder.urgence,
      })
      await logEmail({
        to: contractor.email,
        subject: `Demande de devis — ${workOrder.titre}`,
        template: "devis-demande",
        resend_id: result?.id,
      })
    }
  }
} catch (e) {
  console.error("[Email] Erreur devis-demande:", e)
}
```

---

## Task 4 — Réponses dans threads + suppression MOCK_MAILS (indépendant)

**Files:**
- Modify: `apps/backoffice/lib/dal/emails.ts`
- Modify: `apps/backoffice/app/(protected)/mails/actions.ts`

- [ ] **Ajouter `addMessageToThread()` dans `lib/dal/emails.ts`**

```typescript
export async function addMessageToThread(threadId: string, data: {
  contenu: string
  author_id: string
  author_type: "USER" | "OWNER"
}) {
  const [message] = await Promise.all([
    db.message.create({
      data: {
        thread_id: threadId,
        author_type: data.author_type,
        author_id: data.author_id,
        contenu: data.contenu,
      },
    }),
    db.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    }),
  ])
  return message
}

export async function getThreadById(threadId: string) {
  return db.messageThread.findUnique({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      owner: { select: { id: true, nom: true, email: true } },
    },
  })
}
```

- [ ] **Mettre à jour `mails/actions.ts`** — support des réponses + suppression MOCK_MAILS fallback

```typescript
'use server'

import { auth } from '@/auth'
import { sendEmail } from '@conciergerie/email'
import {
  createThread,
  markThreadAsRead,
  moveThread,
  getThreads,
  deleteThread,
  addMessageToThread,
  getThreadById,
} from '@/lib/dal/emails'
import type { Mail, MailFolder, ContactType } from './mail-data'

export async function fetchThreadsAction(
  folder: MailFolder,
  contactType?: ContactType | 'all'
): Promise<Mail[]> {
  const threads = await getThreads(folder, contactType)
  return (threads as any[]).map((t) => ({
    id: t.id,
    from: {
      name: t.owner?.nom ?? t.to_name ?? 'Contact',
      email: t.owner?.email ?? '',
    },
    to: [{ name: t.to_name ?? 'Conciergerie', email: t.to_email ?? 'contact@entre-rhone-alpilles.fr' }],
    subject: t.subject,
    body: t.messages?.at(-1)?.contenu ?? '',
    preview: (t.messages?.at(-1)?.contenu ?? '').slice(0, 120),
    date: t.updatedAt.toISOString(),
    read: (t.messages ?? []).every((m: any) => m.lu_at !== null),
    folder: t.folder ?? 'inbox',
    contactType: t.contact_type ?? 'autre' as ContactType,
    labels: [],
  }))
}

export async function sendMailAction(data: {
  to: string
  toName: string
  subject: string
  body: string
  contactType: ContactType
  ownerId?: string
  replyToThreadId?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Non autorisé')

  await sendEmail({
    to: data.to,
    subject: data.subject,
    html: `<div style="font-family:sans-serif;line-height:1.6;white-space:pre-wrap">${data.body}</div>`,
  })

  if (data.replyToThreadId) {
    // Répondre dans un thread existant
    await addMessageToThread(data.replyToThreadId, {
      contenu: data.body,
      author_id: session.user.id!,
      author_type: 'USER',
    })
  } else {
    // Nouveau thread
    await createThread({
      subject: data.subject,
      contact_type: data.contactType,
      folder: 'sent',
      owner_id: data.ownerId,
      to_email: data.to,
      to_name: data.toName,
      firstMessage: {
        contenu: data.body,
        author_id: session.user.id!,
      },
    })
  }
}

export async function markAsReadAction(threadId: string) {
  await markThreadAsRead(threadId)
}

export async function moveThreadAction(threadId: string, folder: MailFolder) {
  await moveThread(threadId, folder)
}

export async function deleteThreadAction(threadId: string) {
  await deleteThread(threadId)
}
```
