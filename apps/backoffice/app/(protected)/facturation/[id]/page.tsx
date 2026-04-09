import { notFound } from "next/navigation"
import Link from "next/link"
import { getFeeInvoiceById } from "@/lib/dal/facturation"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, Building2, Calendar, Clock, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react"
import { InvoiceActions } from "./invoice-actions"

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC"
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}
function fmtShort(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR")
}

const MODE_LABELS: Record<string, string> = {
  VIREMENT: "Virement bancaire", CHEQUE: "Ch\u00e8que",
  CB: "Carte bancaire", PRELEVEMENT: "Pr\u00e9l\u00e8vement", ESPECES: "Esp\u00e8ces",
}

export default async function FactureDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getFeeInvoiceById(params.id)
  if (!invoice) notFound()

  const now = new Date()
  const isOverdue = invoice.statut === "EMISE" && invoice.date_echeance && new Date(invoice.date_echeance) < now
  const overdueDays = isOverdue
    ? Math.ceil((now.getTime() - new Date(invoice.date_echeance!).getTime()) / 86400000) : 0

  const tvaAmount = invoice.montant_ttc - invoice.montant_ht
  const subtotalHT = invoice.lineItems.length > 0
    ? invoice.lineItems.reduce((s, l) => s + l.montant_ht, 0) : invoice.montant_ht
  const remiseAmount = invoice.remise_pourcent ? subtotalHT * (invoice.remise_pourcent / 100) : 0
  const adresse = invoice.owner.adresse as any

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/facturation" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" />Facturation
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-mono font-semibold text-foreground">{invoice.numero_facture}</span>
          <StatusBadge status={invoice.statut} />
          {isOverdue && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" />{overdueDays}j de retard
            </span>
          )}
        </div>
        <InvoiceActions id={invoice.id} statut={invoice.statut as any} montantTTC={invoice.montant_ttc} numeroFacture={invoice.numero_facture} />
      </div>

      {/* Invoice paper */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Paper header */}
        <div className="px-8 pt-8 pb-6 border-b border-border bg-gradient-to-r from-muted/30 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg text-foreground">Entre Rh\u00f4ne et Alpilles</span>
              </div>
              <p className="text-sm text-muted-foreground">Conciergerie Haut de Gamme</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-foreground">FACTURE</p>
              <p className="text-base font-mono text-primary mt-1">{invoice.numero_facture}</p>
            </div>
          </div>
        </div>

        {/* Recipient + meta */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Destinataire</p>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{invoice.owner.nom}</p>
              {adresse?.ligne1 && <p className="text-sm text-muted-foreground">{adresse.ligne1}</p>}
              {adresse?.ligne2 && <p className="text-sm text-muted-foreground">{adresse.ligne2}</p>}
              {(adresse?.code_postal || adresse?.ville) && (
                <p className="text-sm text-muted-foreground">{[adresse.code_postal, adresse.ville].filter(Boolean).join(" ")}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{invoice.owner.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date d&apos;\u00e9mission</span>
              <span className="font-medium">{fmtDate(invoice.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">P\u00e9riode couverte</span>
              <span className="font-medium">{fmtShort(invoice.periode_debut)} \u2192 {fmtShort(invoice.periode_fin)}</span>
            </div>
            {invoice.date_echeance && (
              <div className={`flex items-center justify-between text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : ""}`}>
                <span className={`flex items-center gap-1.5 ${isOverdue ? "" : "text-muted-foreground"}`}>
                  <Clock className="w-3.5 h-3.5" />\u00c9ch\u00e9ance
                </span>
                <span className={`font-medium ${isOverdue ? "font-semibold" : ""}`}>{fmtDate(invoice.date_echeance)}</span>
              </div>
            )}
            {invoice.date_paiement && (
              <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Pay\u00e9e le</span>
                <span className="font-semibold">{fmtDate(invoice.date_paiement)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Objet */}
        {invoice.objet && (
          <div className="px-8 py-3 border-b border-border bg-muted/10">
            <p className="text-sm"><span className="font-medium text-muted-foreground">Objet\u00a0: </span><span className="text-foreground">{invoice.objet}</span></p>
          </div>
        )}

        {/* Line items */}
        {invoice.lineItems.length > 0 ? (
          <div className="px-8 py-5 border-b border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {["Description","Qt\u00e9","Unit\u00e9","PU HT","TVA","Total HT"].map((h, i) => (
                    <th key={h} className={`pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i === 0 ? "text-left" : "text-right"} ${i === 1 ? "w-16" : ""} ${i === 2 ? "w-20" : ""} ${i > 2 ? "w-24" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4 text-foreground">{item.description}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{item.quantite}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{item.unite}</td>
                    <td className="py-2.5 text-right font-mono">{fmt(item.prix_unitaire)}</td>
                    <td className="py-2.5 text-right text-muted-foreground text-xs">{(item.tva_rate * 100).toFixed(0)}%</td>
                    <td className="py-2.5 text-right font-mono font-medium">{fmt(item.montant_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : invoice.timeEntries.length > 0 ? (
          <div className="px-8 py-5 border-b border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {["Date","Description","Temps","Taux HT","Total HT"].map((h, i) => (
                    <th key={h} className={`pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i <= 1 ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 pr-4 text-muted-foreground w-24">{fmtShort(entry.date)}</td>
                    <td className="py-2.5 pr-4 text-foreground">{entry.description}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{entry.nb_heures}h</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{entry.taux_horaire} \u20AC/h</td>
                    <td className="py-2.5 text-right font-mono font-medium">{fmt(entry.montant_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Totals */}
        <div className="px-8 py-5 border-b border-border">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {remiseAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span className="font-mono">{fmt(subtotalHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Remise ({invoice.remise_pourcent}%)</span>
                    <span className="font-mono">\u2212 {fmt(remiseAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-mono">{fmt(invoice.montant_ht)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA ({(invoice.tva_rate * 100).toFixed(0)}%)</span>
                <span className="font-mono">{fmt(tvaAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-border">
                <span>TOTAL TTC</span>
                <span className="font-mono text-primary">{fmt(invoice.montant_ttc)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment info + client notes */}
        <div className="px-8 py-5 space-y-4">
          {(invoice.date_paiement || invoice.mode_paiement) && (
            <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Paiement re\u00e7u</span>
                {invoice.mode_paiement && <span> \u2014 {MODE_LABELS[invoice.mode_paiement] ?? invoice.mode_paiement}</span>}
                {invoice.date_paiement && <span> le {fmtDate(invoice.date_paiement)}</span>}
                {invoice.reference_paiement && <span className="ml-1 font-mono text-xs">({invoice.reference_paiement})</span>}
              </div>
            </div>
          )}
          {invoice.notes_client && (
            <div className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Conditions &amp; informations</p>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{invoice.notes_client}</p>
            </div>
          )}
        </div>
      </div>

      {/* Internal notes */}
      {invoice.notes && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">Notes internes</p>
          <p className="text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <span>Cr\u00e9\u00e9e le {fmtDate(invoice.createdAt)}</span>
        <span>\u00b7</span>
        <Link href={`/proprietaires/${invoice.owner.id}`} className="hover:text-primary cursor-pointer">Voir le propri\u00e9taire</Link>
        <span>\u00b7</span>
        <span>Modifi\u00e9e {fmtDate(invoice.updatedAt)}</span>
      </div>
    </div>
  )
}
