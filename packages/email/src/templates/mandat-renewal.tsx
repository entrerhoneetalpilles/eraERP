import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text,
} from "@react-email/components"

interface MandatRenewalEmailProps {
  ownerName: string
  numeroMandat: string
  dateExpiration: string
  joursRestants: number
  backofficeUrl: string
}

export function MandatRenewalEmail({
  ownerName,
  numeroMandat,
  dateExpiration,
  joursRestants,
  backofficeUrl,
}: MandatRenewalEmailProps) {
  const isUrgent = joursRestants <= 30

  return (
    <Html>
      <Head />
      <Preview>Mandat {numeroMandat} expire dans {String(joursRestants)} jours — action requise</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: isUrgent ? "#b91c1c" : "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            {isUrgent ? "Mandat expirant bientôt" : "Rappel renouvellement mandat"}
          </Heading>
          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Le mandat <strong>{numeroMandat}</strong> de <strong>{ownerName}</strong> expire
            le <strong>{dateExpiration}</strong> ({String(joursRestants)} jours restants).
          </Text>

          {isUrgent && (
            <Section style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
              <Text style={{ margin: 0, color: "#b91c1c", fontSize: "14px", fontWeight: "500" }}>
                Action urgente requise — contactez le propriétaire pour renouveler le mandat avant son expiration.
              </Text>
            </Section>
          )}

          <Text style={{ color: "#6b5f57", lineHeight: "1.6" }}>
            Veuillez contacter {ownerName} pour procéder au renouvellement du mandat avant son expiration.
          </Text>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <a
              href={backofficeUrl}
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
              Voir le mandat
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
