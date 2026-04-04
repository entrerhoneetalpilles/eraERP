import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components"

interface BookingConfirmedEmailProps {
  ownerName: string
  propertyName: string
  guestName: string
  checkIn: string
  checkOut: string
  nbNuits: number
  revenuNet: string
}

export function BookingConfirmedEmail({
  ownerName,
  propertyName,
  guestName,
  checkIn,
  checkOut,
  nbNuits,
  revenuNet,
}: BookingConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle réservation confirmée — {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Nouvelle réservation confirmée
          </Heading>
          <Text style={{ color: "#6b5f57" }}>
            Bonjour {ownerName},
          </Text>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Une réservation vient d&apos;être confirmée pour votre bien <strong>{propertyName}</strong>.
          </Text>
          <Section style={{ backgroundColor: "#F4EFEA", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Voyageur :</strong> {guestName}
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Arrivée :</strong> {checkIn}
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Départ :</strong> {checkOut}
            </Text>
            <Text style={{ margin: "0 0 8px", color: "#8C7566", fontSize: "14px" }}>
              <strong>Durée :</strong> {nbNuits} nuit{nbNuits > 1 ? "s" : ""}
            </Text>
            <Hr style={{ borderColor: "#D6B8A8", margin: "12px 0" }} />
            <Text style={{ margin: 0, color: "#9BA88D", fontSize: "16px", fontWeight: "600" }}>
              Revenu net estimé : {revenuNet} €
            </Text>
          </Section>
          <Text style={{ color: "#a09080", fontSize: "12px" }}>
            Consultez votre espace propriétaire pour tous les détails.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
