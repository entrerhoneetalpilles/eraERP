"use client"

import { useState } from "react"
import { FileText, Download, AlertTriangle } from "lucide-react"
import { getDocumentViewUrlAction } from "@/app/(protected)/documents/actions"

const TYPE_LABELS: Record<string, string> = {
  MANDAT: "Mandat",
  AVENANT: "Avenant",
  FACTURE: "Facture",
  CRG: "CRG",
  ATTESTATION_FISCALE: "Attestation fiscale",
  DIAGNOSTIC: "Diagnostic",
  AUTRE: "Autre",
}

function getExpiryBadge(dateExp: Date | null): { label: string; cls: string } | null {
  if (!dateExp) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateExp)
  exp.setHours(0, 0, 0, 0)
  const days = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: "Expiré", cls: "bg-red-50 text-red-600 border-red-200" }
  if (days <= 30)
    return { label: `Expire dans ${days}j`, cls: "bg-amber-50 text-amber-700 border-amber-200" }
  return null
}

interface DocumentCardProps {
  id: string
  nom: string
  type: string
  createdAt: Date
  date_expiration: Date | null
}

export function DocumentCard({ id, nom, type, createdAt, date_expiration }: DocumentCardProps) {
  const [loading, setLoading] = useState(false)
  const expiryBadge = getExpiryBadge(date_expiration)

  const handleDownload = async () => {
    setLoading(true)
    const result = await getDocumentViewUrlAction(id)
    setLoading(false)
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-soft flex items-center gap-3">
      <div className="p-2 bg-calcaire-100 rounded-lg shrink-0">
        <FileText size={18} className="text-garrigue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-garrigue-900 truncate">{nom}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-garrigue-400">{TYPE_LABELS[type] ?? type}</span>
          <span className="text-xs text-garrigue-300">·</span>
          <span className="text-xs text-garrigue-400">
            {new Intl.DateTimeFormat("fr-FR").format(createdAt)}
          </span>
          {expiryBadge && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${expiryBadge.cls}`}
            >
              <AlertTriangle size={10} />
              {expiryBadge.label}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        aria-label={`Télécharger ${nom}`}
        className="p-2 rounded-full hover:bg-calcaire-100 transition-colors text-garrigue-400 disabled:opacity-50"
      >
        <Download size={16} />
      </button>
    </div>
  )
}
