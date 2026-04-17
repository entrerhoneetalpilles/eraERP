import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { getDevisForOwnerPdf } from "@/lib/dal/travaux"

type DevisData = NonNullable<Awaited<ReturnType<typeof getDevisForOwnerPdf>>>

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  warning: "#d97706",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.primary },
  companyTagline: { fontSize: 8, color: colors.muted, marginTop: 2 },
  devisTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: colors.primary, textAlign: "right" },
  devisRef: { fontSize: 10, color: colors.accent, textAlign: "right", marginTop: 3 },
  devisDate: { fontSize: 8, color: colors.muted, textAlign: "right", marginTop: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  infoBlock: { width: "48%" },
  sectionTitle: {
    fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.muted,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 5,
  },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  infoLine: { fontSize: 8.5, color: colors.muted },
  card: {
    backgroundColor: colors.light,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.primary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 2.5, borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  rowLast: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  rowLabel: { fontSize: 8, color: colors.muted },
  rowValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.text },
  amountBlock: {
    alignSelf: "flex-end",
    width: 200,
    backgroundColor: colors.primary,
    borderRadius: 3,
    padding: 12,
    marginTop: 8,
  },
  amountLabel: { fontSize: 9, color: "#ffffff", marginBottom: 2 },
  amountValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.accent },
  amountSub: { fontSize: 7.5, color: "#9ca3af", marginTop: 3 },
  validityBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#fffbeb",
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  validityText: { fontSize: 8, color: colors.warning },
  legalBlock: {
    marginTop: 16, padding: 10,
    backgroundColor: colors.light, borderRadius: 3,
  },
  legalText: { fontSize: 7.5, color: colors.muted, lineHeight: 1.6 },
  signatureRow: { flexDirection: "row", gap: 20, marginTop: 24 },
  signatureBlock: {
    flex: 1, borderWidth: 0.5, borderColor: colors.border,
    borderRadius: 3, padding: 10, minHeight: 70,
  },
  signatureTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 2 },
  signatureLine: { borderBottomWidth: 0.5, borderBottomColor: colors.border, marginTop: 28, marginBottom: 3 },
  signatureCaption: { fontSize: 6.5, color: colors.muted, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 25, left: 40, right: 40,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 8,
  },
  footerText: { fontSize: 7, color: colors.muted },
})

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

const URGENCE_LABELS: Record<string, string> = {
  NORMALE: "Normale",
  URGENTE: "Urgente",
  CRITIQUE: "Critique",
}

export function DevisPDF({ devis }: { devis: DevisData }) {
  const owner = devis.property.mandate?.owner
  const validityDate = new Date(devis.createdAt)
  validityDate.setDate(validityDate.getDate() + 30)
  const adresse = (devis.property.adresse as Record<string, string> | null) ?? {}

  return (
    <Document title={`Devis — ${devis.titre}`} author="Entre Rhône et Alpilles">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
            <Text style={S.companyTagline}>Saint-Rémy-de-Provence (13210) — France</Text>
          </View>
          <View>
            <Text style={S.devisTitle}>DEVIS</Text>
            <Text style={S.devisRef}>Réf. D-{devis.id.slice(-6).toUpperCase()}</Text>
            <Text style={S.devisDate}>Établi le {fmtDate(devis.createdAt)}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Propriétaire</Text>
            {owner ? (
              <>
                <Text style={S.infoValue}>{owner.nom}</Text>
                <Text style={S.infoLine}>{owner.email}</Text>
                {owner.telephone && <Text style={S.infoLine}>{owner.telephone}</Text>}
              </>
            ) : (
              <Text style={S.infoLine}>Non renseigné</Text>
            )}
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Bien concerné</Text>
            <Text style={S.infoValue}>{devis.property.nom}</Text>
            {adresse.rue && <Text style={S.infoLine}>{adresse.rue}</Text>}
            {adresse.code_postal && adresse.ville && (
              <Text style={S.infoLine}>{adresse.code_postal} {adresse.ville}</Text>
            )}
          </View>
        </View>

        {/* Détail travaux */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Objet du devis</Text>
          <View style={S.row}>
            <Text style={S.rowLabel}>Titre</Text>
            <Text style={S.rowValue}>{devis.titre}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>Type</Text>
            <Text style={S.rowValue}>{devis.type}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>Urgence</Text>
            <Text style={S.rowValue}>{URGENCE_LABELS[devis.urgence] ?? devis.urgence}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>À la charge de</Text>
            <Text style={S.rowValue}>{devis.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société"}</Text>
          </View>
          {devis.description && (
            <View style={{ marginTop: 6 }}>
              <Text style={[S.rowLabel, { marginBottom: 3 }]}>Description</Text>
              <Text style={{ fontSize: 8.5, color: colors.text, lineHeight: 1.6 }}>{devis.description}</Text>
            </View>
          )}
        </View>

        {/* Prestataire */}
        {devis.contractor && (
          <View style={S.card}>
            <Text style={S.cardTitle}>Prestataire</Text>
            <View style={S.row}>
              <Text style={S.rowLabel}>Nom</Text>
              <Text style={S.rowValue}>{devis.contractor.nom}</Text>
            </View>
            <View style={S.row}>
              <Text style={S.rowLabel}>Métier</Text>
              <Text style={S.rowValue}>{devis.contractor.metier}</Text>
            </View>
            {devis.contractor.email && (
              <View style={S.row}>
                <Text style={S.rowLabel}>Email</Text>
                <Text style={S.rowValue}>{devis.contractor.email}</Text>
              </View>
            )}
            {devis.contractor.telephone && (
              <View style={S.rowLast}>
                <Text style={S.rowLabel}>Téléphone</Text>
                <Text style={S.rowValue}>{devis.contractor.telephone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {devis.notes_devis && (
          <View style={S.legalBlock}>
            <Text style={[S.legalText, { fontFamily: "Helvetica-Bold", marginBottom: 3 }]}>Notes</Text>
            <Text style={S.legalText}>{devis.notes_devis}</Text>
          </View>
        )}

        {/* Montant */}
        <View style={S.amountBlock}>
          <Text style={S.amountLabel}>Montant estimé HT</Text>
          <Text style={S.amountValue}>{fmt(devis.montant_devis ?? 0)}</Text>
          <Text style={S.amountSub}>TVA non applicable — art. 293 B CGI</Text>
        </View>

        {/* Validité */}
        <View style={S.validityBlock}>
          <Text style={S.validityText}>
            Ce devis est valable jusqu&apos;au {fmtDate(validityDate)}.
            Au-delà, un nouveau devis devra être établi.
          </Text>
        </View>

        {/* Signatures */}
        <View style={S.signatureRow}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureTitle}>Bon pour accord — Propriétaire</Text>
            <Text style={{ fontSize: 7, color: colors.muted }}>{owner?.nom ?? ""}</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureCaption}>Date et signature</Text>
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureTitle}>Le Mandataire</Text>
            <Text style={{ fontSize: 7, color: colors.muted }}>Entre Rhône et Alpilles</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureCaption}>Signature et cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles · Devis D-{devis.id.slice(-6).toUpperCase()}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
