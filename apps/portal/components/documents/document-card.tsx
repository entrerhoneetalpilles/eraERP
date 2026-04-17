"use client"

import { useState } from "react"
import { FileText, FileImage, File, Download, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getDocumentViewUrlAction } from "@/app/(protected)/documents/actions"

const TYPE_LABELS: Record<string, string> = {
  MANDAT: "Mandat",
  AVENANT: "Avenant",
  FACTURE: "Facture",
  CRG: "CRG",
  DEVIS: "Devis",
  ATTESTATION_FISCALE: "Attestation",
  DIAGNOSTIC: "Diagnostic",
  AUTRE: "Document",
}

function DocIcon({ mimeType }: { mimeType?: string | null }) {
  if (mimeType?.startsWith("image/")) return <FileImage size={20} strokeWidth={1.6} />
  if (mimeType === "application/pdf") return <FileText size={20} strokeWidth={1.6} />
  return <FileText size={20} strokeWidth={1.6} />
}

function ExpiryBadge({ date }: { date?: Date | null }) {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(date)
  exp.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
        <AlertTriangle size={10} />
        Expiré
      </span>
    )
  }
  if (daysLeft <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-or-600 bg-or-300/15 border border-or-300/40 px-2 py-0.5 rounded-full shrink-0">
        <AlertTriangle size={10} />
        {daysLeft}j
      </span>
    )
  }
  return null
}

interface DocumentCardProps {
  id: string
  nom: string
  type: string
  mime_type?: string | null
  createdAt: Date
  date_expiration?: Date | null | undefined
  /** Direct URL — used for invoices that stream from an API route */
  pdfUrl?: string
}

export function DocumentCard({ id, nom, type, mime_type, createdAt, date_expiration, pdfUrl }: DocumentCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer")
      return
    }
    setLoading(true)
    const result = await getDocumentViewUrlAction(id)
    setLoading(false)
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 text-garrigue-400">
        <DocIcon mimeType={mime_type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-garrigue-900 truncate leading-snug">
            {nom}
          </p>
          <ExpiryBadge date={date_expiration} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium text-garrigue-400 bg-calcaire-200 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[type] ?? type}
          </span>
          <span className="text-[10px] text-garrigue-400">
            {format(createdAt, "d MMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={loading}
        aria-label={`Télécharger ${nom}`}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-calcaire-100 text-garrigue-400 hover:text-olivier-600 transition-fast cursor-pointer shrink-0 disabled:opacity-50"
      >
        <Download size={15} />
      </button>
    </div>
  )
}
