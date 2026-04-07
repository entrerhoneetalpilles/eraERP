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
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>Virement effectué</Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>Votre reversement pour la période <strong>{periode}</strong> a bien été effectué.</Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Montant viré :</strong> {montant} €</Text>
            <Text style={{ margin: 0, color: "#8C7566", fontSize: "14px" }}><strong>IBAN destinataire :</strong> {ibanMasked}</Text>
          </Section>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
