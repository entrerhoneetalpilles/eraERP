"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronDown, ChevronUp, Download } from "lucide-react"

interface Report {
  id: string
  periode_debut: Date
  periode_fin: Date
  revenus_sejours: number
  honoraires_deduits: number
  montant_reverse: number
  document_id: string | null
}

export function RevenusTable({ reports }: { reports: Report[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const totals = reports.reduce(
    (acc, r) => ({
      revenus: acc.revenus + r.revenus_sejours,
      honoraires: acc.honoraires + r.honoraires_deduits,
      reverse: acc.reverse + r.montant_reverse,
    }),
    { revenus: 0, honoraires: 0, reverse: 0 }
  )

  if (reports.length === 0) {
    return <p className="text-sm text-garrigue-400 text-center py-8">Aucun compte-rendu disponible</p>
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-calcaire-100 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-garrigue-900 capitalize">
                {format(r.periode_debut, "MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-xs text-garrigue-400 mt-0.5">{fmt(r.revenus_sejours)} revenus</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-garrigue-900 text-sm">{fmt(r.montant_reverse)}</span>
              {expanded === r.id ? (
                <ChevronUp size={16} className="text-garrigue-400" />
              ) : (
                <ChevronDown size={16} className="text-garrigue-400" />
              )}
            </div>
          </button>

          {expanded === r.id && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-garrigue-400">Revenus</p>
                  <p className="text-sm font-medium text-garrigue-900">{fmt(r.revenus_sejours)}</p>
                </div>
                <div>
                  <p className="text-xs text-garrigue-400">Honoraires</p>
                  <p className="text-sm font-medium text-red-500">−{fmt(Math.abs(r.honoraires_deduits))}</p>
                </div>
                <div>
                  <p className="text-xs text-garrigue-400">Reversé</p>
                  <p className="text-sm font-medium text-olivier-600">{fmt(r.montant_reverse)}</p>
                </div>
              </div>
              {r.document_id && (
                <a
                  href={`/api/pdf/crg/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-olivier-600 hover:text-olivier-500 transition-colors mt-2"
                >
                  <Download size={14} />
                  Télécharger le CRG
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="bg-garrigue-50 rounded-xl px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-garrigue-900">Total</p>
        <div className="flex gap-6 text-sm">
          <span className="text-garrigue-500">{fmt(totals.revenus)}</span>
          <span className="text-red-500">−{fmt(Math.abs(totals.honoraires))}</span>
          <span className="font-semibold text-olivier-600">{fmt(totals.reverse)}</span>
        </div>
      </div>
    </div>
  )
}
