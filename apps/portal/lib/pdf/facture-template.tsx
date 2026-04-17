import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { getOwnerFeeInvoiceForPdf } from "@/lib/dal/factures"

type InvoiceData = NonNullable<Awaited<ReturnType<typeof getOwnerFeeInvoiceForPdf>>>

const colors = {
  primary: "#1a2744",
  accent: "#c9a84c",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  success: "#059669",
}

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: colors.text, paddingTop: 45, paddingBottom: 55, paddingHorizontal: 40, lineHeight: 1.5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: colors.accent },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.primary },
  companyTagline: { fontSize: 8, color: colors.muted, marginTop: 2 },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: colors.primary, textAlign: "right" },
  invoiceRef: { fontSize: 10, color: colors.accent, textAlign: "right", marginTop: 3 },
  sectionTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  infoBlock: { width: "48%" },
  infoLabel: { fontSize: 8, color: colors.muted, marginBottom: 2 },
  infoValue: { fontSize: 9, color: colors.text, fontFamily: "Helvetica-Bold" },
  table: { marginTop: 8, marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 8 },
  tableHeaderText: { color: "#ffffff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  tableRowAlt: { backgroundColor: colors.light },
  colDescription: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colUnit: { width: 50, textAlign: "right" },
  colPU: { width: 60, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  tableCell: { fontSize: 8.5, color: colors.text },
  totalsBlock: { alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  totalsLabel: { fontSize: 8.5, color: colors.muted },
  totalsValue: { fontSize: 8.5, color: colors.text, fontFamily: "Helvetica-Bold" },
  totalsFinalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 8, backgroundColor: colors.primary, marginTop: 2 },
  totalsFinalLabel: { fontSize: 10, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  totalsFinalValue: { fontSize: 10, color: colors.accent, fontFamily: "Helvetica-Bold" },
  paymentBlock: { marginTop: 16, padding: 10, backgroundColor: "#f0fdf4", borderLeftWidth: 3, borderLeftColor: colors.success },
  paymentLabel: { fontSize: 8, color: colors.success, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  notesBlock: { marginTop: 12, padding: 10, backgroundColor: colors.light, borderRadius: 3 },
  notesText: { fontSize: 8, color: colors.muted, lineHeight: 1.6 },
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 8 },
  footerText: { fontSize: 7, color: colors.muted },
  paid: { position: "absolute", top: 80, right: 40, fontSize: 36, fontFamily: "Helvetica-Bold", color: colors.success, opacity: 0.12 },
})

type Adresse = { rue?: string; complement?: string; code_postal?: string; ville?: string }

const fmt = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  const isPaid = invoice.statut === "PAYEE"
  const tva = invoice.montant_ht * invoice.tva_rate
  const periode = `${fmtDate(invoice.periode_debut)} — ${fmtDate(invoice.periode_fin)}`
  const adresse = ((invoice.owner as any).adresse ?? {}) as Adresse

  return (
    <Document title={`Facture ${invoice.numero_facture}`}>
      <Page size="A4" style={S.page}>
        {isPaid && <Text style={S.paid}>PAYÉE</Text>}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Entre Rhône et Alpilles</Text>
            <Text style={S.companyTagline}>Gestion locative haut de gamme</Text>
            <Text style={S.companyTagline}>Saint-Rémy-de-Provence (13210) — France</Text>
          </View>
          <View>
            <Text style={S.invoiceTitle}>FACTURE</Text>
            <Text style={S.invoiceRef}>N° {invoice.numero_facture}</Text>
          </View>
        </View>
        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Facturé à</Text>
            <Text style={S.infoValue}>{invoice.owner.nom}</Text>
            {adresse.rue && (
              <Text style={S.tableCell}>{adresse.rue}{adresse.complement ? `, ${adresse.complement}` : ""}</Text>
            )}
            {adresse.code_postal && adresse.ville && (
              <Text style={S.tableCell}>{adresse.code_postal} {adresse.ville}</Text>
            )}
            <Text style={S.tableCell}>{invoice.owner.email}</Text>
            {(invoice.owner as any).telephone && (
              <Text style={S.tableCell}>{(invoice.owner as any).telephone}</Text>
            )}
            {(invoice.owner as any).nif && (
              <Text style={S.tableCell}>NIF : {(invoice.owner as any).nif}</Text>
            )}
          </View>
          <View style={S.infoBlock}>
            <Text style={S.sectionTitle}>Détails</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={S.infoLabel}>Date d&apos;émission</Text>
              <Text style={S.tableCell}>{fmtDate(invoice.createdAt)}</Text>
            </View>
            {invoice.date_echeance && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={S.infoLabel}>Échéance</Text>
                <Text style={S.tableCell}>{fmtDate(invoice.date_echeance)}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={S.infoLabel}>Période</Text>
              <Text style={S.tableCell}>{periode}</Text>
            </View>
          </View>
        </View>
        {invoice.objet && (
          <View style={{ marginBottom: 8 }}>
            <Text style={S.sectionTitle}>Objet</Text>
            <Text style={S.tableCell}>{invoice.objet}</Text>
          </View>
        )}
        <View style={S.table}>
          <Text style={S.sectionTitle}>Détail des prestations</Text>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderText, S.colDescription]}>Description</Text>
            <Text style={[S.tableHeaderText, S.colQty]}>Qté</Text>
            <Text style={[S.tableHeaderText, S.colUnit]}>Unité</Text>
            <Text style={[S.tableHeaderText, S.colPU]}>PU HT</Text>
            <Text style={[S.tableHeaderText, S.colTotal]}>Total HT</Text>
          </View>
          {invoice.lineItems.map((line, i) => (
            <View key={line.id} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCell, S.colDescription]}>{line.description}</Text>
              <Text style={[S.tableCell, S.colQty]}>{line.quantite}</Text>
              <Text style={[S.tableCell, S.colUnit]}>{line.unite}</Text>
              <Text style={[S.tableCell, S.colPU]}>{fmt(line.prix_unitaire)}</Text>
              <Text style={[S.tableCell, S.colTotal]}>{fmt(line.montant_ht)}</Text>
            </View>
          ))}
        </View>
        <View style={S.totalsBlock}>
          {invoice.remise_pourcent && (
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Remise ({invoice.remise_pourcent}%)</Text>
              <Text style={S.totalsValue}>-{fmt(invoice.montant_ht * (invoice.remise_pourcent / 100))}</Text>
            </View>
          )}
          <View style={S.totalsRow}>
            <Text style={S.totalsLabel}>Sous-total HT</Text>
            <Text style={S.totalsValue}>{fmt(invoice.montant_ht)}</Text>
          </View>
          <View style={S.totalsRow}>
            <Text style={S.totalsLabel}>TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</Text>
            <Text style={S.totalsValue}>{fmt(tva)}</Text>
          </View>
          <View style={S.totalsFinalRow}>
            <Text style={S.totalsFinalLabel}>TOTAL TTC</Text>
            <Text style={S.totalsFinalValue}>{fmt(invoice.montant_ttc)}</Text>
          </View>
        </View>
        {isPaid && invoice.date_paiement && (
          <View style={S.paymentBlock}>
            <Text style={S.paymentLabel}>Paiement reçu</Text>
            <Text style={S.tableCell}>
              {fmtDate(invoice.date_paiement)}
              {invoice.mode_paiement ? ` — ${invoice.mode_paiement}` : ""}
              {invoice.reference_paiement ? ` (réf. ${invoice.reference_paiement})` : ""}
            </Text>
          </View>
        )}
        {invoice.notes_client && (
          <View style={S.notesBlock}>
            <Text style={[S.notesText, { fontFamily: "Helvetica-Bold", marginBottom: 3 }]}>Note</Text>
            <Text style={S.notesText}>{invoice.notes_client}</Text>
          </View>
        )}
        {!isPaid && (
          <View style={[S.notesBlock, { marginTop: 12 }]}>
            <Text style={[S.notesText, { fontFamily: "Helvetica-Bold", marginBottom: 3 }]}>Conditions de paiement</Text>
            <Text style={S.notesText}>Règlement par virement bancaire à réception de la présente facture.</Text>
            <Text style={[S.notesText, { marginTop: 4 }]}>
              Tout retard de paiement entraîne des pénalités au taux de 3× le taux d&apos;intérêt légal,
              ainsi qu&apos;une indemnité forfaitaire de recouvrement de 40 €.
            </Text>
          </View>
        )}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Entre Rhône et Alpilles — TVA non applicable, art. 293 B CGI</Text>
          <Text style={S.footerText}>{invoice.numero_facture}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
