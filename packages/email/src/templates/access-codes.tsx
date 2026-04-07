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
