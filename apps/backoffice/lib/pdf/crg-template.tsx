import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { getManagementReportById } from "@/lib/dal/crg"

type CrgData = NonNullable<Awaited<ReturnType<typeof getManagementReportById>>>

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  success: "#059669",
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
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  companyTagline: { fontSize: 8, color: colors.muted, marginTop: 2 },
  docTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
  },
  docSubtitle: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
    marginTop: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBlock: { width: "48%" },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  infoSub: { fontSize: 8, color: colors.muted },
  tableBlock: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableLabel: { fontSize: 8.5, color: colors.text },
  tableValue: { fontSize: 8.5, color: colors.text, fontFamily: "Helvetica-Bold" },
  deductionValue: { fontSize: 8.5, color: colors.danger, fontFamily: "Helvetica-Bold" },
  summaryBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
  },
  summaryNote: {
    fontSize: 7.5,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },
  virementsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  virementsLabel: {
    fontSize: 8,
    color: colors.success,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  legalText: {
    marginTop: 20,
    fontSize: 7.5,
    color: colors.muted,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
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

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

const fmtMonth = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

export function CrgPDF({ report }: { report: CrgData }) {
  const owner = report.account.owner
  const periode = `${fmtDate(report.periode_debut)} — ${fmtDate(report.periode_fin)}`
  const soldeApres = report.account.solde_courant
  const soldeAvant = soldeApres + report.montant_reverse

  return (
    <Document title={`CRG ${fmtMonth(report.periode_debut)} — ${owner.nom}`}>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
          </View>
          <View>
            <Text style={S.docTitle}>COMPTE-RENDU DE GESTION</Text>
            <Text style={S.docSubtitle}>{fmtMonth(report.periode_debut)}</Text>
          </View>
        </View>

        {/* Infos propriétaire + période */}
        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Propriétaire</Text>
            <Text style={S.infoValue}>{owner.nom}</Text>
            <Text style={S.infoSub}>{owner.email}</Text>
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Période</Text>
            <Text style={S.infoValue}>{periode}</Text>
            <Text style={S.infoSub}>
              Généré le {fmtDate(report.createdAt)}
            </Text>
          </View>
        </View>

        {/* Recettes */}
        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Recettes</Text>
          <View style={S.tableHeader}>
            <Text style={S.tableHeaderText}>Poste</Text>
            <Text style={S.tableHeaderText}>Montant</Text>
          </View>
          <View style={S.tableRow}>
            <Text style={S.tableLabel}>Revenus des séjours (net plateforme)</Text>
            <Text style={S.tableValue}>{fmt(report.revenus_sejours)}</Text>
          </View>
        </View>

        {/* Déductions */}
        <View style={S.tableBlock}>
          <Text style={S.sectionTitle}>Déductions</Text>
          <View style={S.tableHeader}>
            <Text style={S.tableHeaderText}>Poste</Text>
            <Text style={S.tableHeaderText}>Montant</Text>
          </View>
          <View style={S.tableRow}>
            <Text style={S.tableLabel}>Honoraires de gestion</Text>
            <Text style={S.deductionValue}>-{fmt(report.honoraires_deduits)}</Text>
          </View>
          {report.charges_deduites > 0 && (
            <View style={S.tableRow}>
              <Text style={S.tableLabel}>Charges et travaux</Text>
              <Text style={S.deductionValue}>-{fmt(report.charges_deduites)}</Text>
            </View>
          )}
        </View>

        {/* Virement net */}
        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Montant à reverser</Text>
          <Text style={S.summaryAmount}>{fmt(report.montant_reverse)}</Text>
          <Text style={S.summaryNote}>
            Solde compte mandant : {fmt(soldeAvant)} → {fmt(soldeApres)} après reversement
          </Text>
        </View>

        {/* Virement effectué */}
        {report.date_virement && (
          <View style={S.virementsBox}>
            <Text style={S.virementsLabel}>Virement effectué</Text>
            <Text style={{ fontSize: 8.5 }}>
              {fmt(report.montant_reverse)} le {fmtDate(report.date_virement)}
            </Text>
          </View>
        )}

        {/* Mention légale */}
        <Text style={S.legalText}>
          Ce compte-rendu de gestion est établi conformément à la loi Hoguet n°70-9 du 2 janvier 1970
          et au décret n°72-678 du 20 juillet 1972. Les sommes ci-dessus correspondent aux encaissements
          et décaissements effectués pour votre compte mandant sur la période indiquée.
        </Text>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — Gestion locative</Text>
          <Text style={S.footerText}>CRG {fmtMonth(report.periode_debut)} — {owner.nom}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
