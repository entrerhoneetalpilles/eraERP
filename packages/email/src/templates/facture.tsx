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
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>Facture d'honoraires</Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Veuillez trouver ci-dessous le détail de votre facture <strong>n° {numeroFacture}</strong> pour la période <strong>{periode}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Montant HT :</strong> {montantHT} €</Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#9BA88D", fontSize: "16px", fontWeight: "600" }}>Montant TTC : {montantTTC} €</Text>
          </Section>
          <Button href={portalUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Télécharger la facture
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
