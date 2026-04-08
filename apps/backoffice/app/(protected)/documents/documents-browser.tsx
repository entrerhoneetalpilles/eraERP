"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText, Image, File, Download, Trash2, ExternalLink,
  Grid3X3, List, Search, X, RefreshCw, FolderOpen, ChevronRight,
} from "lucide-react"
import { Button } from "@conciergerie/ui"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import type { getDocuments, getDocumentCounts } from "@/lib/dal/documents"
import { deleteDocumentAction, getDocumentViewUrlAction } from "./actions"
import { UploadDialog } from "./upload-dialog"

type Doc = Awaited<ReturnType<typeof getDocuments>>[number]
type Counts = Awaited<ReturnType<typeof getDocumentCounts>>

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  ALL: "Tous les documents",
  MANDAT: "Mandats",
  AVENANT: "Avenants",
  DEVIS: "Devis",
  FACTURE: "Factures",
  CRG: "CRG",
  ETAT_LIEUX: "États des lieux",
  ATTESTATION_FISCALE: "Attestations fiscales",
  PHOTO: "Photos",
  DIAGNOSTIC: "Diagnostics",
  AUTRE: "Autres",
}

const TYPE_ORDER = [
  "ALL", "MANDAT", "AVENANT", "DEVIS", "FACTURE",
  "CRG", "ETAT_LIEUX", "ATTESTATION_FISCALE", "PHOTO", "DIAGNOSTIC", "AUTRE",
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function FileIcon({ mime, className = "w-5 h-5" }: { mime: string; className?: string }) {
  if (mime.startsWith("image/")) return <Image className={`${className} text-blue-500`} />
  if (mime === "application/pdf") return <FileText className={`${className} text-red-500`} />
  if (mime.includes("word") || mime.includes("document")) return <FileText className={`${className} text-blue-600`} />
  if (mime.includes("sheet") || mime.includes("excel")) return <FileText className={`${className} text-emerald-600`} />
  return <File className={`${className} text-muted-foreground`} />
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    MANDAT: "bg-blue-100 text-blue-700",
    AVENANT: "bg-purple-100 text-purple-700",
    DEVIS: "bg-amber-100 text-amber-700",
    FACTURE: "bg-emerald-100 text-emerald-700",
    CRG: "bg-indigo-100 text-indigo-700",
    ETAT_LIEUX: "bg-rose-100 text-rose-700",
    ATTESTATION_FISCALE: "bg-sky-100 text-sky-700",
    PHOTO: "bg-pink-100 text-pink-700",
    DIAGNOSTIC: "bg-orange-100 text-orange-700",
    AUTRE: "bg-gray-100 text-gray-700",
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors[type] ?? "bg-gray-100 text-gray-700"}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────

function DocumentPreview({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function loadPreview() {
    if (viewUrl) return
    setLoading(true)
    const result = await getDocumentViewUrlAction(doc.id)
    setLoading(false)
    if (result.url) setViewUrl(result.url)
    else toast.error("Impossible de charger l'aperçu")
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteDocumentAction(doc.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Document supprimé")
      onClose()
      router.refresh()
    }
    setDeleteOpen(false)
  }

  const canPreview = doc.mime_type === "application/pdf" || doc.mime_type.startsWith("image/")

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 border-b border-border shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileIcon mime={doc.mime_type} className="w-4 h-4 shrink-0" />
            <p className="text-sm font-semibold truncate">{doc.nom}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={doc.type} />
            <span className="text-xs text-muted-foreground">{formatBytes(doc.taille)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden bg-muted/30">
        {!viewUrl ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <FileIcon mime={doc.mime_type} className="w-12 h-12" />
            {canPreview ? (
              <Button size="sm" variant="outline" onClick={loadPreview} disabled={loading} className="gap-2">
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {loading ? "Chargement…" : "Charger l'aperçu"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Aperçu non disponible</p>
            )}
          </div>
        ) : doc.mime_type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewUrl} alt={doc.nom} className="w-full h-full object-contain p-4" />
        ) : (
          <iframe
            src={viewUrl}
            className="w-full h-full border-0"
            title={doc.nom}
          />
        )}
      </div>

      {/* Actions footer */}
      <div className="p-3 border-t border-border shrink-0 space-y-2">
        {/* Entity links */}
        {doc.mandate && (
          <Link href={`/mandats/${doc.mandate.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
            <ChevronRight className="w-3 h-3" />
            Mandat {doc.mandate.numero_mandat}
          </Link>
        )}
        {doc.owner && (
          <Link href={`/proprietaires/${doc.owner.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
            <ChevronRight className="w-3 h-3" />
            {doc.owner.nom}
          </Link>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {viewUrl && (
            <a href={viewUrl} download={doc.nom} className="flex-1">
              <Button size="sm" variant="outline" className="gap-2 w-full">
                <Download className="w-3.5 h-3.5" />
                Télécharger
              </Button>
            </a>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer {doc.nom} ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Card (grid view) ──────────────────────────────────────────────────────────

function DocCard({ doc, selected, onClick }: { doc: Doc; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm ${
        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <FileIcon mime={doc.mime_type} className="w-7 h-7" />
        <TypeBadge type={doc.type} />
      </div>
      <p className="text-sm font-medium text-foreground truncate w-full mb-0.5">{doc.nom}</p>
      <p className="text-xs text-muted-foreground">{formatBytes(doc.taille)} · {formatDate(doc.createdAt)}</p>
      {doc.owner && <p className="text-xs text-muted-foreground truncate w-full mt-0.5">{doc.owner.nom}</p>}
    </button>
  )
}

// ─── Row (list view) ───────────────────────────────────────────────────────────

function DocRow({ doc, selected, onClick }: { doc: Doc; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent ${
        selected ? "bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
    >
      <FileIcon mime={doc.mime_type} className="w-5 h-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.nom}</p>
        <p className="text-xs text-muted-foreground truncate">
          {doc.owner?.nom ?? ""}{doc.owner ? " · " : ""}{formatDate(doc.createdAt)}
        </p>
      </div>
      <TypeBadge type={doc.type} />
      <span className="text-xs text-muted-foreground shrink-0">{formatBytes(doc.taille)}</span>
    </button>
  )
}

// ─── Main browser ──────────────────────────────────────────────────────────────

interface Props {
  initialDocs: Doc[]
  counts: Counts
}

export function DocumentsBrowser({ initialDocs, counts }: Props) {
  const [docs] = useState<Doc[]>(initialDocs)
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleRefresh = useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const filtered = docs.filter((d) => {
    const matchType = selectedType === "ALL" || d.type === selectedType
    const matchSearch = !search || d.nom.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const hasPreview = !!selectedDoc

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0 overflow-hidden rounded-lg border border-border bg-card">

      {/* ── Left sidebar ── */}
      <div className="w-48 shrink-0 border-r border-border flex flex-col overflow-hidden hidden md:flex">
        <div className="px-3 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Catégories</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {TYPE_ORDER.map((t) => {
            const count = t === "ALL" ? counts.total : (counts.byType[t] ?? 0)
            const active = selectedType === t
            return (
              <button
                key={t}
                onClick={() => { setSelectedType(t); setSelectedDoc(null) }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors rounded-sm mx-1 ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <span className="truncate">{TYPE_LABELS[t]}</span>
                {count > 0 && (
                  <span className={`text-xs ml-1 shrink-0 ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Main area ── */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${hasPreview ? "hidden md:flex" : "flex"}`}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile: type filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedDoc(null) }}
            className="md:hidden h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none"
          >
            {TYPE_ORDER.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>

          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-sm transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-sm transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={handleRefresh} className="text-muted-foreground hover:text-foreground p-1">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setUploadOpen(true)}>
            <Download className="w-3.5 h-3.5 rotate-180" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
        </div>

        {/* File area */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {search ? "Aucun résultat pour cette recherche" : "Aucun document dans cette catégorie"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {filtered.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 border-t border-border shrink-0 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            {selectedType !== "ALL" && ` · ${TYPE_LABELS[selectedType]}`}
          </span>
          {selectedDoc && (
            <span className="text-xs text-muted-foreground">
              · <span className="font-medium text-foreground">{selectedDoc.nom}</span> sélectionné
            </span>
          )}
        </div>
      </div>

      {/* ── Preview panel ── */}
      {selectedDoc && (
        <div className="w-full md:w-80 lg:w-96 border-l border-border flex flex-col overflow-hidden shrink-0">
          <DocumentPreview
            doc={selectedDoc}
            onClose={() => setSelectedDoc(null)}
          />
        </div>
      )}

      {/* Upload dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleRefresh}
      />
    </div>
  )
}
