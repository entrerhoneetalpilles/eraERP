import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Row, Column,
} from "@react-email/components"

interface AttestationFiscaleEmailProps {
  ownerName: string
  annee: number
  totalLoyers: string
  totalHonoraires: string
  totalCharges: string
  totalVerse: string
  portalUrl: string
}

export function AttestationFiscaleEmail({
  ownerName,
  annee,
  totalLoyers,
  totalHonoraires,
  totalCharges,
  totalVerse,
  portalUrl,
}: AttestationFiscaleEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre attestation fiscale {String(annee)} est disponible</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Attestation fiscale {String(annee)}
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {ownerName},</Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Votre attestation fiscale pour l&apos;année {String(annee)} est disponible dans votre espace propriétaire.
            Ce document récapitule les sommes perçues et les charges déduites pour vos biens en gestion.
          </Text>

          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Row style={{ marginBottom: "8px" }}>
              <Column>
                <Text style={{ margin: "0 0 4px", color: "#8C7566", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Loyers encaissés
                </Text>
                <Text style={{ margin: 0, color: "#1a1a1a", fontSize: "18px", fontWeight: "bold" }}>{totalLoyers}</Text>
              </Column>
            </Row>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Row style={{ marginBottom: "6px" }}>
              <Column>
                <Text style={{ margin: "0 0 2px", color: "#8C7566", fontSize: "13px" }}>Honoraires de gestion</Text>
                <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px" }}>-{totalHonoraires}</Text>
              </Column>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Column>
                <Text style={{ margin: "0 0 2px", color: "#8C7566", fontSize: "13px" }}>Charges et travaux</Text>
                <Text style={{ margin: 0, color: "#6b5f57", fontSize: "14px" }}>-{totalCharges}</Text>
              </Column>
            </Row>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Row>
              <Column>
                <Text style={{ margin: "0 0 4px", color: "#8C7566", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Montant total reversé
                </Text>
                <Text style={{ margin: 0, color: "#1a1a1a", fontSize: "20px", fontWeight: "bold" }}>{totalVerse}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ color: "#6b5f57" }}>
            Téléchargez votre attestation fiscale depuis votre espace propriétaire.
          </Text>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <a
              href={portalUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#1a2744",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Accéder à mes documents
            </a>
          </Section>

          <Hr style={{ borderColor: "#D6B8A8", margin: "32px 0" }} />
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Entre Rhône et Alpilles — Gestion locative haut de gamme
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
