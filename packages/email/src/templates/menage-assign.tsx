import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface Props {
  contractorName: string
  propertyName: string
  datePrevue: string
  notes?: string
}

export function MenageAssignEmail({ contractorName, propertyName, datePrevue, notes }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle tâche ménage assignée — {propertyName}</Preview>
      <Body style={{ backgroundColor: "#F4EFEA", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "40px", backgroundColor: "#fff", borderRadius: "12px" }}>
          <Heading style={{ color: "#8C7566", fontFamily: "Georgia, serif", fontSize: "22px" }}>
            Tâche ménage assignée
          </Heading>
          <Text style={{ color: "#6b5f57" }}>Bonjour {contractorName},</Text>
          <Text style={{ color: "#6b5f57" }}>
            Une nouvelle tâche ménage vous a été assignée.
          </Text>
          <Section style={{ backgroundColor: "#f9f6f3", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
            <Text style={{ margin: "0 0 8px", color: "#6b5f57" }}>
              <strong>Bien :</strong> {propertyName}
            </Text>
            <Text style={{ margin: "0", color: "#6b5f57" }}>
              <strong>Date prévue :</strong> {datePrevue}
            </Text>
            {notes && (
              <Text style={{ margin: "8px 0 0", color: "#6b5f57" }}>
                <strong>Notes :</strong> {notes}
              </Text>
            )}
          </Section>
          <Hr style={{ borderColor: "#e8ddd5" }} />
          <Text style={{ fontSize: "12px", color: "#9a8880" }}>
            Entre Rhône et Alpilles — Gestion locative haut de gamme
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
