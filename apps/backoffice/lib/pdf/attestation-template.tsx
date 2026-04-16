import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

export interface AttestationFiscaleData {
  owner: {
    nom: string
    email: string
  }
  annee: number
  reports: {
    periode_debut: Date
    periode_fin: Date
    revenus_sejours: number
    honoraires_deduits: number
    charges_deduites: number
    montant_reverse: number
  }[]
  totalLoyers: number
  totalHonoraires: number
  totalCharges: number
  totalVerse: number
  generatedAt: Date
}

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  danger: "#dc2626",
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
  docTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.primary, textAlign: "right" },
  docSubtitle: { fontSize: 9, color: colors.muted, textAlign: "right", marginTop: 3 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  infoBlock: { width: "48%" },
  sectionTitle: {
    fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.muted,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
  },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  infoSub: { fontSize: 8, color: colors.muted },
  tableBlock: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: { fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  colMois: { width: "22%" },
  colLoyers: { width: "22%", textAlign: "right" },
  colHonoraires: { width: "22%", textAlign: "right" },
  colCharges: { width: "18%", textAlign: "right" },
  colVerse: { width: "16%", textAlign: "right" },
  tableLabel: { fontSize: 8.5, color: colors.text },
  tableValue: { fontSize: 8.5, color: colors.text, fontFamily: "Helvetica-Bold" },
  deductionValue: { fontSize: 8.5, color: colors.danger, fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: colors.light,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  summaryBox: { marginTop: 20, padding: 14, backgroundColor: colors.primary, borderRadius: 4 },
  summaryLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  summaryAmount: { fontSize: 24, fontFamily: "Helvetica-Bold", color: colors.accent },
  summaryNote: { fontSize: 7.5, color: "rgba(255,255,255,0.5)", marginTop: 6 },
  legalText: { marginTop: 20, fontSize: 7.5, color: colors.muted, lineHeight: 1.6 },
  footer: {
    position: "absolute",
    bottom: 25, left: 40, right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: colors.muted },
})

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })

const fmtMonth = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

export function AttestationFiscalePDF({ data }: { data: AttestationFiscaleData }) {
  return (
    <Document title={`Attestation Fiscale ${data.annee} — ${data.owner.nom}`}>
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
          </View>
          <View>
            <Text style={S.docTitle}>ATTESTATION FISCALE</Text>
            <Text style={S.docSubtitle}>Année {data.annee}</Text>
          </View>
        </View>

        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Propriétaire</Text>
            <Text style={S.infoValue}>{data.owner.nom}</Text>
            <Text style={S.infoSub}>{data.owner.email}</Text>
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Période</Text>
            <Text style={S.infoValue}>Année {data.annee}</Text>
            <Text style={S.infoSub}>Du 1er janvier au 31 décembre {data.annee}</Text>
            <Text style={S.infoSub}>Généré le {fmtDate(data.generatedAt)}</Text>
          </View>
        </View>

        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Récapitulatif mensuel</Text>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderText, S.colMois]}>Période</Text>
            <Text style={[S.tableHeaderText, S.colLoyers]}>Loyers</Text>
            <Text style={[S.tableHeaderText, S.colHonoraires]}>Honoraires</Text>
            <Text style={[S.tableHeaderText, S.colCharges]}>Charges</Text>
            <Text style={[S.tableHeaderText, S.colVerse]}>Reversé</Text>
          </View>
          {data.reports.map((r, i) => (
            <View key={i} style={S.tableRow}>
              <Text style={[S.tableLabel, S.colMois]}>{fmtMonth(r.periode_debut)}</Text>
              <Text style={[S.tableValue, S.colLoyers]}>{fmt(r.revenus_sejours)}</Text>
              <Text style={[S.deductionValue, S.colHonoraires]}>-{fmt(r.honoraires_deduits)}</Text>
              <Text style={[S.deductionValue, S.colCharges]}>-{fmt(r.charges_deduites)}</Text>
              <Text style={[S.tableValue, S.colVerse]}>{fmt(r.montant_reverse)}</Text>
            </View>
          ))}
          <View style={S.totalRow}>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colMois]}>TOTAL {data.annee}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colLoyers]}>{fmt(data.totalLoyers)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: colors.danger }, S.colHonoraires]}>-{fmt(data.totalHonoraires)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: colors.danger }, S.colCharges]}>-{fmt(data.totalCharges)}</Text>
            <Text style={[{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }, S.colVerse]}>{fmt(data.totalVerse)}</Text>
          </View>
        </View>

        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Total reversé au propriétaire sur {data.annee}</Text>
          <Text style={S.summaryAmount}>{fmt(data.totalVerse)}</Text>
          <Text style={S.summaryNote}>
            Loyers encaissés : {fmt(data.totalLoyers)} — Charges déduites : {fmt(data.totalHonoraires + data.totalCharges)}
          </Text>
        </View>

        <Text style={S.legalText}>
          Cette attestation fiscale est établie conformément aux obligations déclaratives en matière de revenus fonciers
          (location meublée courte durée — régime BIC ou régime réel). Les montants ci-dessus correspondent aux encaissements
          et décaissements effectués pour votre compte mandant sur la période du 1er janvier au 31 décembre {data.annee},
          conformément à la loi Hoguet n°70-9 du 2 janvier 1970 et au décret n°72-678 du 20 juillet 1972.
          Document à conserver et à déclarer aux services fiscaux (case 4BE ou liasse 2031 selon régime).
        </Text>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — Gestion locative</Text>
          <Text style={S.footerText}>Attestation fiscale {data.annee} — {data.owner.nom}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
