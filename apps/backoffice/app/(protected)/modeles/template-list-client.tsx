"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Star, Copy, Trash2, MoreVertical, ExternalLink } from "lucide-react"
import { TYPE_COLORS, type PdfTemplateType } from "@/lib/pdf/template-types"
import { deleteTemplateAction, duplicateTemplateAction, setDefaultTemplateAction } from "./actions"
import { useRouter } from "next/navigation"

interface Props {
  id: string
  nom: string
  type: PdfTemplateType
  isDefault: boolean
  updatedAt: string
}

export function TemplateListClient({ id, nom, type, isDefault, updatedAt }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fmtDate = new Date(updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

  async function handleDuplicate() {
    setMenuOpen(false)
    setLoading(true)
    const result = await duplicateTemplateAction(id)
    setLoading(false)
    if (result?.id) router.push(`/modeles/${result.id}`)
  }

  async function handleDelete() {
    setMenuOpen(false)
    if (!confirm(`Supprimer le modèle "${nom}" ?`)) return
    setLoading(true)
    await deleteTemplateAction(id)
    setLoading(false)
    router.refresh()
  }

  async function handleSetDefault() {
    setMenuOpen(false)
    setLoading(true)
    await setDefaultTemplateAction(id, type)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className={`relative group rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden ${loading ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Color band */}
      <div className="h-2 w-full" style={{ background: "hsl(var(--primary))" }} />

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1">
            {isDefault && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-semibold border border-amber-200">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                Défaut
              </span>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 w-44 bg-popover border border-border rounded-lg shadow-lg py-1 text-sm">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={handleSetDefault}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted text-left cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Définir par défaut
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted text-left cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      Dupliquer
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 text-destructive text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">{nom}</p>
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[type]}`}>
          {type}
        </span>
        <p className="text-[11px] text-muted-foreground mt-3">Modifié le {fmtDate}</p>
      </div>

      {/* Hover overlay CTA */}
      <Link
        href={`/modeles/${id}`}
        className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-card/95 via-transparent to-transparent"
      >
        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md">
          <ExternalLink className="w-3 h-3" />
          Éditer
        </span>
      </Link>
    </div>
  )
}
