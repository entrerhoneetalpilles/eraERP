"use client"

import { useState } from "react"
import { getDocumentViewUrlAction } from "@/app/(protected)/documents/actions"

export function DocumentDownloadButton({ docId, label = "Ouvrir" }: { docId: string; label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleOpen() {
    setLoading(true)
    const result = await getDocumentViewUrlAction(docId)
    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Chargement…" : label}
    </button>
  )
}
