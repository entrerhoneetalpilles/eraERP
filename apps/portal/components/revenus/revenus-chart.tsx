"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ReportEntry {
  id: string
  periode_debut: Date
  montant_reverse: number
  revenus_sejours: number
}

interface RevenusChartProps {
  reports: ReportEntry[]
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-argile-200 rounded-xl shadow-luxury px-4 py-3">
      <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-wide mb-1 capitalize">
        {label}
      </p>
      <p className="text-sm font-semibold text-garrigue-900 tabular-nums">
        {fmtEur(payload[0].value)}
      </p>
    </div>
  )
}

export function RevenusChart({ reports }: RevenusChartProps) {
  if (reports.length === 0) return null

  const data = reports
    .slice()
    .sort((a, b) => a.periode_debut.getTime() - b.periode_debut.getTime())
    .map((r) => ({
      mois: format(r.periode_debut, "MMM", { locale: fr }),
      reversé: Math.round(r.montant_reverse),
    }))

  return (
    <div className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 px-5 pt-5 pb-4">
      <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">
        Montant reversé par mois
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -16, bottom: 0 }} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e3da" vertical={false} />
          <XAxis
            dataKey="mois"
            tick={{ fill: "#9c9488", fontSize: 11, textAnchor: "middle" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
            tick={{ fill: "#9c9488", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f2ed", radius: 6 }} />
          <Bar dataKey="reversé" fill="#C9A84C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
