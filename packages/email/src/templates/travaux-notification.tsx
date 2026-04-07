import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  ownerName: string
  propertyName: string
  titreOrdre: string
  urgence: string
  description: string
}

export function TravauxNotificationEmail({ ownerName, propertyName, titreOrdre, urgence, description }: Props) {
  const urgenceLabel: Record<string, string> = { NORMALE: "Normale", URGENTE: "Urgente", CRITIQUE: "Critique" }
  return (
    <Html>
      <Head />
      <Preview>Ordre de travaux — {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>Ordre de travaux ouvert</Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>Un ordre de travaux a été créé pour votre bien <strong>{propertyName}</strong>.</Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Prestation :</strong> {titreOrdre}</Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Urgence :</strong> {urgenceLabel[urgence] ?? urgence}</Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px", whiteSpace: "pre-wrap" }}>{description}</Text>
          </Section>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
