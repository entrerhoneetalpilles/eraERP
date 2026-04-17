import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { TemplateConfig, PdfTemplateType } from "./template-types"

export interface SampleData {
  ref: string
  docTitle: string
  recipientName: string
  recipientAddress: string
  recipientEmail: string
  date: string
  period: string
  lineItems: { description: string; qty: number; unit: string; pu: number; total: number }[]
  totalHT: number
  tva: number
  totalTTC: number
  notes: string
}

function getSample(type: PdfTemplateType): SampleData {
  switch (type) {
    case "FACTURE":
      return {
        ref: "FAC-2026-042",
        docTitle: "FACTURE",
        recipientName: "M. Jean-Pierre Fabre",
        recipientAddress: "12 chemin des Oliviers\n13210 Saint-Rémy-de-Provence",
        recipientEmail: "jp.fabre@email.fr",
        date: "17 avril 2026",
        period: "1er mars 2026 — 31 mars 2026",
        lineItems: [
          { description: "Honoraires de gestion 15% — Villa Les Alpilles", qty: 1, unit: "forfait", pu: 486.00, total: 486.00 },
          { description: "Coordination travaux — supervision chantier", qty: 2, unit: "heure", pu: 55.00, total: 110.00 },
        ],
        totalHT: 596.00, tva: 0, totalTTC: 596.00,
        notes: "Règlement par virement bancaire à 30 jours.",
      }
    case "DEVIS":
      return {
        ref: "DEV-2026-018",
        docTitle: "DEVIS",
        recipientName: "Mme Sophie Marchand",
        recipientAddress: "5 rue du Mas\n13210 Saint-Rémy-de-Provence",
        recipientEmail: "s.marchand@email.fr",
        date: "17 avril 2026",
        period: "Validité : 30 jours",
        lineItems: [
          { description: "Remplacement robinetterie salle de bain", qty: 1, unit: "forfait", pu: 320.00, total: 320.00 },
          { description: "Joints silicone et finitions", qty: 1, unit: "forfait", pu: 85.00, total: 85.00 },
        ],
        totalHT: 405.00, tva: 0, totalTTC: 405.00,
        notes: "Devis valable 30 jours. Travaux à réaliser sous 15 jours après acceptation.",
      }
    case "MANDAT":
      return {
        ref: "MAN-2026-004",
        docTitle: "MANDAT DE GESTION",
        recipientName: "M. & Mme Bertrand",
        recipientAddress: "8 avenue des Baux\n13210 Saint-Rémy-de-Provence",
        recipientEmail: "bertrand@email.fr",
        date: "1er janvier 2026",
        period: "À compter du 1er janvier 2026",
        lineItems: [
          { description: "Gestion locative saisonnière — Villa Provençale", qty: 1, unit: "an", pu: 0, total: 0 },
        ],
        totalHT: 0, tva: 0, totalTTC: 0,
        notes: "Taux d'honoraires : 15% du revenu net propriétaire. Mandat renouvelable par tacite reconduction.",
      }
    case "CONTRAT":
      return {
        ref: "CTR-2026-011",
        docTitle: "CONTRAT DE LOCATION",
        recipientName: "Famille Schneider",
        recipientAddress: "12 Hauptstraße — 75001 Paris",
        recipientEmail: "f.schneider@email.de",
        date: "17 avril 2026",
        period: "Du 1er mai au 15 mai 2026 (14 nuits)",
        lineItems: [
          { description: "Location Villa Les Alpilles — 14 nuits", qty: 14, unit: "nuit", pu: 280.00, total: 3920.00 },
          { description: "Forfait ménage", qty: 1, unit: "forfait", pu: 180.00, total: 180.00 },
        ],
        totalHT: 4100.00, tva: 0, totalTTC: 4100.00,
        notes: "Caution de 1 500 € à verser 15 jours avant l'arrivée.",
      }
    case "QUITTANCE":
      return {
        ref: "QUI-2026-033",
        docTitle: "QUITTANCE DE LOYER",
        recipientName: "M. Thomas Renard",
        recipientAddress: "Villa Les Garrigues — Route des Alpilles\n13210 Saint-Rémy-de-Provence",
        recipientEmail: "t.renard@email.fr",
        date: "1er avril 2026",
        period: "Mars 2026",
        lineItems: [
          { description: "Loyer mensuel — Mars 2026", qty: 1, unit: "mois", pu: 1800.00, total: 1800.00 },
          { description: "Charges locatives", qty: 1, unit: "mois", pu: 120.00, total: 120.00 },
        ],
        totalHT: 1920.00, tva: 0, totalTTC: 1920.00,
        notes: "Paiement reçu le 3 mars 2026 par virement bancaire.",
      }
  }
}

export function DynamicPDF({ config, type, data }: { config: TemplateConfig; type: PdfTemplateType; data?: SampleData }) {
  const sample = data ?? getSample(type)
  const { branding: b, header: h, body, table: tbl, footer: ft } = config

  const bold = b.fontFamily === "Helvetica" ? "Helvetica-Bold" : b.fontFamily
  const oblique = b.fontFamily === "Helvetica" ? "Helvetica-Oblique" : b.fontFamily
  const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " \u20AC"

  const S = StyleSheet.create({
    page: {
      fontFamily: b.fontFamily,
      fontSize: 9,
      color: "#111827",
      paddingTop: 45,
      paddingBottom: 60,
      paddingHorizontal: 40,
      lineHeight: 1.5,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: b.accentColor,
    },
    companyName: { fontSize: 16, fontFamily: bold, color: b.primaryColor },
    companyTagline: { fontSize: 8, color: "#6b7280", marginTop: 2 },
    docTitle: { fontSize: 20, fontFamily: bold, color: b.primaryColor, textAlign: "right" },
    docRef: { fontSize: 10, color: b.accentColor, textAlign: "right", marginTop: 3 },
    docDate: { fontSize: 8.5, color: "#6b7280", textAlign: "right", marginTop: 2 },

    twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    col: { width: "48%" },
    sectionTitle: {
      fontSize: 7,
      fontFamily: bold,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 5,
    },
    recipientName: { fontSize: 10, fontFamily: bold, color: b.primaryColor, marginBottom: 2 },
    cell: { fontSize: 9, color: "#374151", lineHeight: 1.5 },

    periodBand: {
      marginBottom: 14,
      paddingVertical: 7,
      paddingHorizontal: 10,
      backgroundColor: "#f9fafb",
      borderLeftWidth: 3,
      borderLeftColor: b.accentColor,
    },
    periodLabel: { fontSize: 7.5, color: "#6b7280" },
    periodValue: { fontSize: 9, fontFamily: bold, color: b.primaryColor, marginTop: 2 },

    introText: { fontSize: 9, color: "#374151", marginBottom: 12, lineHeight: 1.6 },

    tableWrap: { marginBottom: 16 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tbl.headerBg,
      paddingVertical: 6,
      paddingHorizontal: 8,
      ...(tbl.style === "bordered" ? { borderWidth: 0.5, borderColor: tbl.borderColor } : {}),
    },
    thText: { color: tbl.headerTextColor, fontSize: 8, fontFamily: bold },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 5,
      paddingHorizontal: 8,
      ...(tbl.style !== "minimal" ? { borderBottomWidth: 0.5, borderBottomColor: tbl.borderColor } : {}),
      ...(tbl.style === "bordered" ? { borderWidth: 0.5, borderColor: tbl.borderColor } : {}),
    },
    tableRowAlt: { backgroundColor: tbl.stripeBg },
    colDesc: { flex: 1 },
    colQty: { width: 38, textAlign: "right" },
    colUnit: { width: 48, textAlign: "right" },
    colPU: { width: 60, textAlign: "right" },
    colTotal: { width: 68, textAlign: "right" },
    tdText: { fontSize: 8.5, color: "#111827" },

    totalsWrap: { alignSelf: "flex-end", width: 220, marginTop: 4 },
    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: "#e5e7eb",
    },
    totalsLabel: { fontSize: 8.5, color: "#6b7280" },
    totalsValue: { fontSize: 8.5, fontFamily: bold },
    totalsFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: b.primaryColor,
      marginTop: 2,
    },
    totalsFinalLabel: { fontSize: 10, color: "#ffffff", fontFamily: bold },
    totalsFinalValue: { fontSize: 10, color: b.accentColor, fontFamily: bold },

    notesBox: {
      marginTop: 14,
      padding: 10,
      backgroundColor: "#f3f4f6",
      borderRadius: 3,
    },
    notesText: { fontSize: 8, color: "#6b7280", lineHeight: 1.6 },

    outroText: { fontSize: 9, color: "#374151", marginTop: 14, lineHeight: 1.6 },

    sigBlock: { marginTop: 28, flexDirection: "row", justifyContent: "flex-end" },
    sigBox: {
      width: 180,
      borderTopWidth: 1,
      borderTopColor: b.primaryColor,
      paddingTop: 6,
      alignItems: "center",
    },
    sigLabel: { fontSize: 8, color: "#6b7280" },

    footerFixed: {
      position: "absolute",
      bottom: 25,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 0.5,
      borderTopColor: "#e5e7eb",
      paddingTop: 8,
    },
    footerText: { fontSize: 7, color: "#9ca3af" },
  })

  return (
    <Document title={`${sample.docTitle} ${sample.ref}`}>
      <Page size="A4" style={S.page}>

        {/* ── HEADER ─────────────────────────────── */}
        <View style={S.headerRow}>
          {h.showCompanyInfo ? (
            <View>
              <Text style={S.companyName}>{b.companyName}</Text>
              {b.companyTagline ? <Text style={S.companyTagline}>{b.companyTagline}</Text> : null}
              {b.companyAddress ? <Text style={S.companyTagline}>{b.companyAddress}</Text> : null}
              {b.companyEmail ? <Text style={S.companyTagline}>{b.companyEmail}</Text> : null}
              {b.companySiret ? <Text style={S.companyTagline}>SIRET : {b.companySiret}</Text> : null}
            </View>
          ) : <View />}
          <View>
            <Text style={S.docTitle}>{h.titleOverride || sample.docTitle}</Text>
            {h.showDocumentRef ? <Text style={S.docRef}>{sample.ref}</Text> : null}
            {h.showDate ? <Text style={S.docDate}>Le {sample.date}</Text> : null}
          </View>
        </View>

        {/* ── RECIPIENT + PERIOD ─────────────────── */}
        {h.showRecipientBlock ? (
          <View style={S.twoCol}>
            <View style={S.col}>
              <Text style={S.sectionTitle}>Destinataire</Text>
              <Text style={S.recipientName}>{sample.recipientName}</Text>
              <Text style={S.cell}>{sample.recipientAddress}</Text>
              <Text style={S.cell}>{sample.recipientEmail}</Text>
            </View>
            <View style={S.col}>
              <View style={S.periodBand}>
                <Text style={S.periodLabel}>Période</Text>
                <Text style={S.periodValue}>{sample.period}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── INTRO TEXT ─────────────────────────── */}
        {body.introText ? <Text style={S.introText}>{body.introText}</Text> : null}

        {/* ── LINE ITEMS ─────────────────────────── */}
        {body.showLineItems ? (
          <View style={S.tableWrap}>
            <Text style={[S.sectionTitle, { marginBottom: 5 }]}>Détail des prestations</Text>
            <View style={S.tableHeader}>
              <Text style={[S.thText, S.colDesc]}>Description</Text>
              <Text style={[S.thText, S.colQty]}>Qté</Text>
              <Text style={[S.thText, S.colUnit]}>Unité</Text>
              <Text style={[S.thText, S.colPU]}>PU HT</Text>
              <Text style={[S.thText, S.colTotal]}>Total HT</Text>
            </View>
            {sample.lineItems.map((line, i) => (
              <View
                key={i}
                style={[S.tableRow, tbl.style === "striped" && i % 2 === 1 ? S.tableRowAlt : {}]}
              >
                <Text style={[S.tdText, S.colDesc]}>{line.description}</Text>
                <Text style={[S.tdText, S.colQty]}>{line.qty}</Text>
                <Text style={[S.tdText, S.colUnit]}>{line.unit}</Text>
                <Text style={[S.tdText, S.colPU]}>{line.pu > 0 ? fmt(line.pu) : "—"}</Text>
                <Text style={[S.tdText, S.colTotal]}>{line.total > 0 ? fmt(line.total) : "—"}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── TOTALS ─────────────────────────────── */}
        {body.showTotals && sample.totalHT > 0 ? (
          <View style={S.totalsWrap}>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Total HT</Text>
              <Text style={S.totalsValue}>{fmt(sample.totalHT)}</Text>
            </View>
            {sample.tva > 0 ? (
              <View style={S.totalsRow}>
                <Text style={S.totalsLabel}>TVA (20%)</Text>
                <Text style={S.totalsValue}>{fmt(sample.tva)}</Text>
              </View>
            ) : null}
            <View style={S.totalsFinal}>
              <Text style={S.totalsFinalLabel}>{sample.tva > 0 ? "TOTAL TTC" : "TOTAL"}</Text>
              <Text style={S.totalsFinalValue}>{fmt(sample.totalTTC)}</Text>
            </View>
          </View>
        ) : null}

        {/* ── OUTRO TEXT ─────────────────────────── */}
        {body.outroText ? <Text style={S.outroText}>{body.outroText}</Text> : null}

        {/* ── NOTES ──────────────────────────────── */}
        {body.showNotes && sample.notes ? (
          <View style={S.notesBox}>
            <Text style={S.notesText}>{sample.notes}</Text>
          </View>
        ) : null}

        {/* ── SIGNATURE ──────────────────────────── */}
        {body.showSignatureBlock ? (
          <View style={S.sigBlock}>
            <View style={S.sigBox}>
              <Text style={{ fontSize: 9, color: "transparent" }}>{" ".repeat(60)}</Text>
              <Text style={S.sigLabel}>{body.signatureLabel || "Signature"}</Text>
            </View>
          </View>
        ) : null}

        {/* ── FOOTER ─────────────────────────────── */}
        <View style={S.footerFixed} fixed>
          <Text style={S.footerText}>
            {ft.legalText || b.companyName}
          </Text>
          {ft.showBankInfo && ft.bankInfo ? (
            <Text style={S.footerText}>{ft.bankInfo}</Text>
          ) : null}
          {ft.showPageNumbers ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Text style={S.footerText} render={({ pageNumber, totalPages }: any) => `${pageNumber} / ${totalPages}`} />
          ) : null}
        </View>
      </Page>
    </Document>
  )
}
