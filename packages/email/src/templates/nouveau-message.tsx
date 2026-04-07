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
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>Nouveau message</Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {recipientName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>Vous avez reçu un nouveau message de <strong>{senderName}</strong>.</Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0", borderLeft: "3px solid #D6B8A8" }}>
            <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px", fontStyle: "italic", lineHeight: "1.6" }}>
              "{preview}{preview.length >= 120 ? "…" : ""}"
            </Text>
          </Section>
          <Button href={mailboxUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Répondre au message
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
