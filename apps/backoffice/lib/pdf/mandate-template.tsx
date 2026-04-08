import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { getMandateById } from "@/lib/dal/mandates"

type MandateData = NonNullable<Awaited<ReturnType<typeof getMandateById>>>

// ─── Styles ────────────────────────────────────────────────────────────────────

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
}

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
    paddingTop: 45,
    paddingBottom: 55,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 2 },
  companySubtitle: { fontSize: 8, color: colors.accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  companyDetail: { fontSize: 7.5, color: colors.muted, lineHeight: 1.4 },
  mandateRefBlock: { alignItems: "flex-end" },
  mandateRefLabel: { fontSize: 8, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  mandateRefNumber: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.primary },
  mandateDate: { fontSize: 7.5, color: colors.muted, marginTop: 2 },

  // Title banner
  titleBanner: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
    alignItems: "center",
  },
  titleBannerText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "white", letterSpacing: 1.5, textTransform: "uppercase" },

  // Section
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 3,
  },

  // Two-column layout
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 6 },
  col: { flex: 1 },

  // Card block
  card: {
    backgroundColor: colors.light,
    border: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },

  // Row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2.5,
  },
  rowLabel: { fontSize: 7.5, color: colors.muted, flex: 1 },
  rowValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.text, flex: 1.5, textAlign: "right" },

  // Highlight row
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 2,
  },
  highlightLabel: { fontSize: 8, color: "white", flex: 1 },
  highlightValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.accent, textAlign: "right" },

  // Tags
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: { backgroundColor: colors.primary, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 2 },
  tagText: { fontSize: 7, color: "white" },

  // Legal
  legalSection: { marginTop: 14, padding: 10, backgroundColor: "#fafafa", borderWidth: 0.5, borderColor: colors.border, borderRadius: 2 },
  legalTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  legalText: { fontSize: 7, color: colors.muted, lineHeight: 1.6, textAlign: "justify" },

  // Signatures
  signatureSection: { flexDirection: "row", gap: 20, marginTop: 20 },
  signatureBlock: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 10,
    minHeight: 80,
  },
  signatureTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 2 },
  signatureSubtitle: { fontSize: 7, color: colors.muted, marginBottom: 8 },
  signatureLine: { borderBottomWidth: 0.5, borderBottomColor: colors.border, marginTop: 30, marginBottom: 4 },
  signatureCaption: { fontSize: 6.5, color: colors.muted, textAlign: "center" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 5,
  },
  footerText: { fontSize: 6.5, color: colors.muted },

  // Page number
  pageNumber: { fontSize: 6.5, color: colors.muted },
})

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const style = last ? S.rowLast : S.row
  return (
    <View style={style}>
      <Text style={S.rowLabel}>{label}</Text>
      <Text style={S.rowValue}>{value}</Text>
    </View>
  )
}

// ─── Document ─────────────────────────────────────────────────────────────────

interface Props {
  mandate: MandateData
  companyName?: string
  companyAddress?: string
  companyCartePro?: string
  companySiret?: string
}

export function MandatePDF({
  mandate,
  companyName = "Entre Rhône et Alpilles",
  companyAddress = "Provence, France",
  companyCartePro = "CPI XXXX-XXXX-XXXX-XXXX",
  companySiret = "XXX XXX XXX XXXXX",
}: Props) {
  const adresse = mandate.property.adresse as { rue?: string; code_postal?: string; ville?: string }
  const adresseStr = [adresse?.rue, `${adresse?.code_postal ?? ""} ${adresse?.ville ?? ""}`].filter(Boolean).join(", ")

  return (
    <Document
      title={`Mandat de gestion ${mandate.numero_mandat}`}
      author={companyName}
      subject="Mandat de gestion locative saisonnière"
    >
      <Page size="A4" style={S.page}>

        {/* ── En-tête ── */}
        <View style={S.header}>
          <View style={S.companyBlock}>
            <Text style={S.companyName}>{companyName}</Text>
            <Text style={S.companySubtitle}>Conciergerie & Gestion locative</Text>
            <Text style={S.companyDetail}>{companyAddress}</Text>
            <Text style={S.companyDetail}>Carte professionnelle : {companyCartePro}</Text>
            <Text style={S.companyDetail}>SIRET : {companySiret}</Text>
          </View>
          <View style={S.mandateRefBlock}>
            <Text style={S.mandateRefLabel}>Mandat de gestion</Text>
            <Text style={S.mandateRefNumber}>{mandate.numero_mandat}</Text>
            <Text style={S.mandateDate}>Établi le {formatDate(new Date())}</Text>
            <Text style={S.mandateDate}>Début : {formatDate(mandate.date_debut)}</Text>
            {mandate.date_fin && <Text style={S.mandateDate}>Fin : {formatDate(mandate.date_fin)}</Text>}
          </View>
        </View>

        {/* ── Bannière titre ── */}
        <View style={S.titleBanner}>
          <Text style={S.titleBannerText}>Mandat de gestion locative saisonnière</Text>
        </View>

        {/* ── Parties ── */}
        <Text style={S.sectionTitle}>Article 1 — Parties au contrat</Text>
        <View style={S.twoCol}>
          <View style={[S.card, S.col]}>
            <Text style={S.cardTitle}>Le Mandant (Propriétaire)</Text>
            <Row label="Nom / Raison sociale" value={mandate.owner.nom} />
            <Row label="Email" value={mandate.owner.email} />
            {mandate.owner.telephone && <Row label="Téléphone" value={mandate.owner.telephone} />}
            <Row label="Type" value={mandate.owner.type} last />
          </View>
          <View style={[S.card, S.col]}>
            <Text style={S.cardTitle}>Le Mandataire</Text>
            <Row label="Raison sociale" value={companyName} />
            <Row label="Adresse" value={companyAddress} />
            <Row label="Carte professionnelle" value={companyCartePro} />
            <Row label="SIRET" value={companySiret} last />
          </View>
        </View>

        {/* ── Bien ── */}
        <Text style={S.sectionTitle}>Article 2 — Désignation du bien</Text>
        <View style={S.card}>
          <Text style={S.cardTitle}>{mandate.property.nom}</Text>
          <Row label="Type de bien" value={mandate.property.type} />
          <Row label="Adresse" value={adresseStr} />
          <Row label="Superficie" value={`${mandate.property.superficie} m²`} />
          <Row label="Nombre de chambres" value={String(mandate.property.nb_chambres)} />
          <Row label="Capacité d'accueil" value={`${mandate.property.capacite_voyageurs} voyageur${mandate.property.capacite_voyageurs > 1 ? "s" : ""}`} last />
          {mandate.property.amenities.length > 0 && (
            <View>
              <Text style={{ fontSize: 7.5, color: colors.muted, marginTop: 5, marginBottom: 3 }}>Équipements</Text>
              <View style={S.tagContainer}>
                {mandate.property.amenities.map((a: string) => (
                  <View key={a} style={S.tag}><Text style={S.tagText}>{a}</Text></View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Durée ── */}
        <Text style={S.sectionTitle}>Article 3 — Durée du mandat</Text>
        <View style={S.card}>
          <Row label="Date de début" value={formatDate(mandate.date_debut)} />
          {mandate.date_fin
            ? <Row label="Date de fin" value={formatDate(mandate.date_fin)} last />
            : <Row label="Durée" value="Durée indéterminée" last />
          }
          <Row label="Reconduction tacite" value={mandate.reconduction_tacite ? "Oui — reconduction annuelle automatique sauf dénonciation 3 mois avant l'échéance" : "Non"} last />
        </View>

        {/* ── Honoraires ── */}
        <Text style={S.sectionTitle}>Article 4 — Honoraires et rémunération</Text>
        <View style={S.card}>
          <View style={S.highlightRow}>
            <Text style={S.highlightLabel}>Taux d'honoraires de gestion (TTC)</Text>
            <Text style={S.highlightValue}>{mandate.taux_honoraires} %</Text>
          </View>
          {mandate.honoraires_location != null && (
            <Row label="Honoraires de mise en location (%)" value={`${mandate.honoraires_location} %`} />
          )}
          {mandate.taux_horaire_ht != null && (
            <Row label="Taux horaire HT (prestations hors forfait)" value={`${mandate.taux_horaire_ht} €/h`} />
          )}
          <Row
            label="Seuil d'approbation devis travaux"
            value={formatCurrency(mandate.seuil_validation_devis)}
            last
          />
        </View>

        {/* ── Prestations ── */}
        {mandate.prestations_incluses.length > 0 && (
          <>
            <Text style={S.sectionTitle}>Article 5 — Prestations incluses au forfait</Text>
            <View style={S.card}>
              <View style={S.tagContainer}>
                {mandate.prestations_incluses.map((p: string) => (
                  <View key={p} style={S.tag}><Text style={S.tagText}>{p}</Text></View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── Clauses légales ── */}
        <View style={S.legalSection}>
          <Text style={S.legalTitle}>Dispositions légales et réglementaires (Loi Hoguet n°70-9 du 2 janvier 1970)</Text>
          <Text style={S.legalText}>
            Le présent mandat est soumis aux dispositions de la loi n° 70-9 du 2 janvier 1970 réglementant les conditions d'exercice des activités relatives à certaines opérations portant sur les immeubles et les fonds de commerce. Le mandataire est titulaire d'une carte professionnelle délivrée par la Chambre de Commerce et d'Industrie. Le mandataire est garant de la gestion des fonds détenus pour le compte du mandant, lesquels sont déposés sur un compte séquestre distinct.
          </Text>
          <Text style={[S.legalText, { marginTop: 4 }]}>
            Les honoraires de gestion sont dus au mandataire pour toute période d'occupation du bien, qu'elle soit le résultat d'une mise en location par le mandataire ou par tout autre intermédiaire. Le mandant s'engage à informer immédiatement le mandataire de toute occupation directe du bien. Le présent mandat est résiliable par lettre recommandée avec accusé de réception, sous réserve du respect du préavis contractuel.
          </Text>
        </View>

        {/* ── Signatures ── */}
        <Text style={[S.sectionTitle, { marginTop: 18 }]}>Signatures des parties</Text>
        <View style={S.signatureSection}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureTitle}>Le Mandant</Text>
            <Text style={S.signatureSubtitle}>{mandate.owner.nom}</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureCaption}>Signature précédée de la mention « Lu et approuvé »</Text>
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureTitle}>Le Mandataire</Text>
            <Text style={S.signatureSubtitle}>{companyName}</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureCaption}>Signature et cachet</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{companyName} · Mandat {mandate.numero_mandat}</Text>
          <Text style={S.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
