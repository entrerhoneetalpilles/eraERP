import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface WelcomeOwnerEmailProps {
  ownerName: string
  loginUrl: string
  temporaryPassword?: string
}

export function WelcomeOwnerEmail({
  ownerName,
  loginUrl,
  temporaryPassword,
}: WelcomeOwnerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue dans votre espace propriétaire</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "600" }}>
            Bienvenue, {ownerName}
          </Heading>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Votre espace propriétaire Entre Rhône et Alpilles est prêt. Vous pouvez désormais suivre vos biens, vos reversements et vos documents en temps réel.
          </Text>
          {temporaryPassword && (
            <Section style={{ backgroundColor: "#F4EFEA", padding: "16px", borderRadius: "8px", margin: "20px 0" }}>
              <Text style={{ margin: 0, color: "#8C7566", fontSize: "14px" }}>
                Mot de passe temporaire : <strong>{temporaryPassword}</strong>
              </Text>
              <Text style={{ margin: "8px 0 0", color: "#a09080", fontSize: "12px" }}>
                Vous devrez le modifier à votre première connexion.
              </Text>
            </Section>
          )}
          <Button
            href={loginUrl}
            style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "20px" }}
          >
            Accéder à mon espace
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
