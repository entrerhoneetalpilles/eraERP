import Link from "next/link"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Report {
  id: string
  periode_debut: Date
  periode_fin: Date
  revenus_sejours: number
  honoraires_deduits: number
  montant_reverse: number
  document_id: string | null
}

interface RevenusTableProps {
  reports: Report[]
  year?: number
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

const fmtMonth = (d: Date) =>
  format(d, "MMMM yyyy", { locale: fr })

export function RevenusTable({ reports, year }: RevenusTableProps) {
  const totalBrut = reports.reduce((s, r) => s + r.revenus_sejours, 0)
  const totalHono = reports.reduce((s, r) => s + r.honoraires_deduits, 0)
  const totalRev = reports.reduce((s, r) => s + r.montant_reverse, 0)

  if (!reports.length) {
    return (
      <div className="text-center py-16 text-garrigue-400">
        <p className="font-serif text-xl font-light italic">
          Aucun compte-rendu{year ? ` pour ${year}` : ""}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-4 gap-4 px-5 py-2">
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">Mois</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Revenus</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Honoraires</p>
        <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] text-right">Reversé</p>
      </div>

      {/* Data rows */}
      {reports.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-4 gap-4 items-center bg-white rounded-xl px-5 py-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth group"
        >
          <p className="font-serif text-base text-garrigue-900 font-light capitalize">
            {fmtMonth(r.periode_debut)}
          </p>
          <p className="text-sm text-garrigue-700 text-right tabular-nums">{fmtEur(r.revenus_sejours)}</p>
          <p className="text-sm text-garrigue-500 text-right tabular-nums">{fmtEur(-r.honoraires_deduits)}</p>
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-semibold text-garrigue-900 text-right tabular-nums">
              {fmtEur(r.montant_reverse)}
            </p>
            {r.document_id && (
              <Link
                href={`/api/pdf/crg/${r.id}`}
                className="opacity-0 group-hover:opacity-100 transition-fast text-garrigue-400 hover:text-olivier-600"
                title="Télécharger le CRG"
              >
                <Download size={14} />
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Total row */}
      <div className="grid grid-cols-4 gap-4 items-center bg-gradient-dark rounded-xl px-5 py-4 mt-2">
        <p className="font-serif text-base text-white font-medium italic">
          Total{year ? ` ${year}` : ""}
        </p>
        <p className="text-sm text-garrigue-300 text-right tabular-nums">{fmtEur(totalBrut)}</p>
        <p className="text-sm text-garrigue-300 text-right tabular-nums">{fmtEur(-totalHono)}</p>
        <p className="text-sm font-semibold text-or-300 text-right tabular-nums">{fmtEur(totalRev)}</p>
      </div>
    </div>
  )
}
