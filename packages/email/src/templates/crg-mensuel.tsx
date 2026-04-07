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
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Revenus bruts :</strong> {revenusBruts} €</Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Frais de gestion :</strong> -{fraisGestion} €</Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}><strong>Autres charges :</strong> -{autresCharges} €</Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#9BA88D", fontSize: "18px", fontWeight: "600" }}>Revenu net : {revenuNet} €</Text>
          </Section>
          <Button href={portalUrl} style={{ backgroundColor: "#9BA88D", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-block", marginTop: "8px" }}>
            Voir le détail sur mon espace
          </Button>
          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>Entre Rhône et Alpilles — Conciergerie haut de gamme en Provence</Text>
        </Container>
      </Body>
    </Html>
  )
}
