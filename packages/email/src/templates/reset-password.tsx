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
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>Réinitialisation du mot de passe</Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {name},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Vous avez demandé la réinitialisation de votre mot de passe. Ce lien expire dans 1 heure.
          </Text>
          <Button href={resetUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "20px" }}>
            Réinitialiser mon mot de passe
          </Button>
          <Text style={{ color: "#a09080", fontSize: "13px", marginTop: "24px" }}>Si vous n'avez pas fait cette demande, ignorez cet email.</Text>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
