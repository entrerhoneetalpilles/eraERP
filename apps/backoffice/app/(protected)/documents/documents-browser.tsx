"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  FileText, ImageIcon, File, Download, Trash2, ExternalLink,
  Grid3X3, List, Search, X, RefreshCw, FolderOpen, ChevronRight,
  Upload, ArrowUpDown, ArrowUp, ArrowDown, SortAsc,
} from "lucide-react"
import { Button } from "@conciergerie/ui"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import type { getDocuments, getDocumentCounts } from "@/lib/dal/documents"
import { deleteDocumentAction, getDocumentViewUrlAction, fetchDocumentsAction } from "./actions"
import { UploadDialog } from "./upload-dialog"
import { cn } from "@conciergerie/ui"

type Doc = Awaited<ReturnType<typeof getDocuments>>[number]
type Counts = Awaited<ReturnType<typeof getDocumentCounts>>
type SortKey = "date" | "name" | "size" | "type"
type SortDir = "asc" | "desc"

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

const TYPE_COLORS: Record<string, string> = {
  MANDAT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  AVENANT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DEVIS: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FACTURE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  CRG: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  ETAT_LIEUX: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  ATTESTATION_FISCALE: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  PHOTO: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  DIAGNOSTIC: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  AUTRE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function FileIcon({ mime, className = "w-5 h-5" }: { mime: string; className?: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className={cn(className, "text-blue-500")} />
  if (mime === "application/pdf") return <FileText className={cn(className, "text-red-500")} />
  if (mime.includes("word") || mime.includes("document")) return <FileText className={cn(className, "text-blue-600")} />
  if (mime.includes("sheet") || mime.includes("excel")) return <FileText className={cn(className, "text-emerald-600")} />
  return <File className={cn(className, "text-muted-foreground")} />
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", TYPE_COLORS[type] ?? TYPE_COLORS.AUTRE)}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

// ─── Preview panel ─────────────────────────────────────────────────────────────

function DocumentPreview({ doc, onClose, onDeleted }: {
  doc: Doc
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Reset quand le document change
  useEffect(() => {
    setViewUrl(null)
    setLoadingUrl(false)
  }, [doc.id])

  // Raccourcis
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (["INPUT", "TEXTAREA"].includes(tag)) return
      if (e.key === "Escape") onClose()
      if (e.key === "Delete") setDeleteOpen(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  async function loadPreview() {
    if (viewUrl || loadingUrl) return
    setLoadingUrl(true)
    const result = await getDocumentViewUrlAction(doc.id)
    setLoadingUrl(false)
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
      onDeleted(doc.id)
      onClose()
    }
    setDeleteOpen(false)
  }

  const canPreview = doc.mime_type === "application/pdf" || doc.mime_type.startsWith("image/")

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <FileIcon mime={doc.mime_type} className="w-4 h-4 shrink-0" />
            <p className="text-sm font-semibold truncate">{doc.nom}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={doc.type} />
            <span className="text-xs text-muted-foreground">{formatBytes(doc.taille)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
          </div>
          {doc.uploaded_by && (
            <p className="text-xs text-muted-foreground mt-1">Ajouté par {doc.uploaded_by}</p>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-0.5 rounded shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-muted/20 relative">
        {!viewUrl ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
            <FileIcon mime={doc.mime_type} className="w-14 h-14 opacity-30" />
            <div>
              <p className="text-sm font-medium">{doc.nom}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(doc.taille)}</p>
            </div>
            {canPreview ? (
              <Button size="sm" variant="outline" onClick={loadPreview} disabled={loadingUrl} className="gap-2 mt-1">
                {loadingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {loadingUrl ? "Chargement…" : "Aperçu"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Aperçu non disponible</p>
            )}
          </div>
        ) : doc.mime_type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewUrl} alt={doc.nom} className="w-full h-full object-contain p-4" />
        ) : (
          <iframe src={viewUrl} className="w-full h-full border-0" title={doc.nom} />
        )}
      </div>

      <div className="px-4 py-3 border-t shrink-0 space-y-2.5">
        {(doc.mandate || doc.owner) && (
          <div className="space-y-1">
            {doc.mandate && (
              <Link href={`/mandats/${doc.mandate.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <ChevronRight className="w-3 h-3" /> Mandat {doc.mandate.numero_mandat}
              </Link>
            )}
            {doc.owner && (
              <Link href={`/proprietaires/${doc.owner.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <ChevronRight className="w-3 h-3" /> {doc.owner.nom}
              </Link>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {viewUrl ? (
            <a href={viewUrl} download={doc.nom} className="flex-1">
              <Button size="sm" variant="outline" className="gap-1.5 w-full">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={loadPreview} disabled={loadingUrl}>
              <Download className="w-3.5 h-3.5" /> {loadingUrl ? "…" : "Télécharger"}
            </Button>
          )}
          <Button
            size="sm" variant="outline"
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center">
          <span className="font-mono bg-muted px-1 rounded">Suppr</span> supprimer ·{" "}
          <span className="font-mono bg-muted px-1 rounded">Échap</span> fermer
        </p>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer {doc.nom} ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible. Le fichier sera supprimé du stockage.</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function DocCard({ doc, selected, onClick }: { doc: Doc; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start rounded-xl border p-3 text-left transition-all",
        "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
        selected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border bg-card hover:bg-accent/30"
      )}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <FileIcon mime={doc.mime_type} className="w-5 h-5" />
        </div>
        <TypeBadge type={doc.type} />
      </div>
      <p className="text-sm font-medium truncate w-full leading-tight mb-0.5">{doc.nom}</p>
      <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
      <p className="text-xs text-muted-foreground">{formatBytes(doc.taille)}</p>
      {doc.owner && (
        <p className="text-xs text-muted-foreground/70 truncate w-full mt-1.5 pt-1.5 border-t border-border/60">
          {doc.owner.nom}
        </p>
      )}
    </button>
  )
}

// ─── Row ───────────────────────────────────────────────────────────────────────

function DocRow({ doc, selected, onClick }: { doc: Doc; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60",
        selected && "bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <FileIcon mime={doc.mime_type} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.nom}</p>
        <p className="text-xs text-muted-foreground truncate">
          {[doc.owner?.nom, formatDate(doc.createdAt)].filter(Boolean).join(" · ")}
        </p>
      </div>
      <TypeBadge type={doc.type} />
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{formatBytes(doc.taille)}</span>
    </button>
  )
}

// ─── Sort button ───────────────────────────────────────────────────────────────

function SortButton({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
        active ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      {label}
      {active
        ? dir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
        : <ArrowUpDown className="w-3 h-3 opacity-30" />}
    </button>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  initialDocs: Doc[]
  counts: Counts
}

export function DocumentsBrowser({ initialDocs, counts }: Props) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [globalDragOver, setGlobalDragOver] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Sync quand le serveur re-render avec des nouvelles données
  useEffect(() => { setDocs(initialDocs) }, [initialDocs])

  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const fresh = await fetchDocumentsAction()
      setDocs(fresh)
    } catch {
      toast.error("Impossible de rafraîchir")
    } finally {
      setLoading(false)
    }
  }, [])

  // Raccourcis clavier
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (["INPUT", "TEXTAREA"].includes(tag)) return
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault(); searchRef.current?.focus()
      }
      if (e.key === "u" && !e.metaKey && !uploadOpen) {
        e.preventDefault(); setUploadOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [uploadOpen])

  // Drag & drop global
  function onGlobalDragOver(e: React.DragEvent) {
    e.preventDefault(); setGlobalDragOver(true)
  }
  function onGlobalDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setGlobalDragOver(false)
  }
  function onGlobalDrop(e: React.DragEvent) {
    e.preventDefault(); setGlobalDragOver(false)
    if (e.dataTransfer.files.length) setUploadOpen(true)
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "desc" ? "asc" : "desc")
    else { setSortKey(key); setSortDir("desc") }
  }

  function handleDeleted(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  const filtered = docs
    .filter((d) => {
      const matchType = selectedType === "ALL" || d.type === selectedType
      const matchSearch = !search ||
        d.nom.toLowerCase().includes(search.toLowerCase()) ||
        (d.owner?.nom.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchType && matchSearch
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else if (sortKey === "name") cmp = a.nom.localeCompare(b.nom, "fr")
      else if (sortKey === "size") cmp = a.taille - b.taille
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type)
      return sortDir === "desc" ? -cmp : cmp
    })

  // Comptages live depuis le state client
  const liveCounts = {
    total: docs.length,
    byType: docs.reduce((acc, d) => { acc[d.type] = (acc[d.type] ?? 0) + 1; return acc }, {} as Record<string, number>),
  }

  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 overflow-hidden rounded-xl border bg-card relative transition-all",
        globalDragOver && "ring-2 ring-primary border-primary"
      )}
      onDragOver={onGlobalDragOver}
      onDragLeave={onGlobalDragLeave}
      onDrop={onGlobalDrop}
    >
      {/* Overlay drag & drop */}
      {globalDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Upload className="w-12 h-12" />
            <p className="text-lg font-semibold">Déposer pour importer</p>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <div className="w-52 shrink-0 border-r flex flex-col overflow-hidden hidden md:flex">
        <div className="px-3 py-3 border-b">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Catégories</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {TYPE_ORDER.map((t) => {
            const count = t === "ALL" ? liveCounts.total : (liveCounts.byType[t] ?? 0)
            const active = selectedType === t
            return (
              <button
                key={t}
                onClick={() => { setSelectedType(t); setSelectedDoc(null) }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <span className="truncate">{TYPE_LABELS[t]}</span>
                {count > 0 && (
                  <span className={cn("text-xs ml-1 shrink-0 tabular-nums", active ? "text-primary-foreground/70" : "")}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="px-3 py-3 border-t">
          <p className="text-[10px] text-muted-foreground/60 leading-5">
            <span className="font-mono bg-muted px-1 rounded">/</span> Rechercher ·{" "}
            <span className="font-mono bg-muted px-1 rounded">U</span> Importer<br />
            <span className="font-mono bg-muted px-1 rounded">Suppr</span> Supprimer ·{" "}
            <span className="font-mono bg-muted px-1 rounded">Échap</span> Fermer
          </p>
        </div>
      </div>

      {/* ── Zone principale ── */}
      <div className={cn("flex flex-col flex-1 min-w-0 overflow-hidden", selectedDoc ? "hidden md:flex" : "flex")}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearch("")}
              className="w-full pl-8 pr-8 h-8 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile type filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedDoc(null) }}
            className="md:hidden h-8 rounded-md border bg-background px-2 text-xs focus:outline-none"
          >
            {TYPE_ORDER.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>

          {/* Sort */}
          <div className="hidden sm:flex items-center gap-0.5 border rounded-md px-1.5 py-0.5">
            <SortAsc className="w-3 h-3 text-muted-foreground mr-0.5" />
            <SortButton label="Date" sortKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
            <SortButton label="Nom" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
            <SortButton label="Taille" sortKey="size" current={sortKey} dir={sortDir} onSort={handleSort} />
          </div>

          {/* Vue */}
          <div className="flex items-center gap-0.5 border rounded-md p-0.5">
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-sm transition-colors", viewMode === "grid" ? "bg-accent" : "text-muted-foreground hover:text-foreground")}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-sm transition-colors", viewMode === "list" ? "bg-accent" : "text-muted-foreground hover:text-foreground")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={loadDocs} disabled={loading} className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors" title="Rafraîchir (R)">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>

          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setUploadOpen(true)}>
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {search ? "Aucun résultat" : "Aucun document"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search
                    ? `Aucun document ne correspond à "${search}"`
                    : selectedType !== "ALL"
                      ? `Aucun document de type ${TYPE_LABELS[selectedType]}`
                      : "Glissez des fichiers ici ou cliquez sur Importer"}
                </p>
              </div>
              {!search && (
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setUploadOpen(true)}>
                  <Upload className="w-3.5 h-3.5" /> Importer un document
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {filtered.map((doc) => (
                <DocCard
                  key={doc.id} doc={doc}
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="hidden md:flex items-center gap-3 px-3 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b mb-1">
                <div className="w-8 shrink-0" />
                <span className="flex-1">Nom</span>
                <span className="w-28 text-right">Type</span>
                <span className="w-16 text-right">Taille</span>
              </div>
              {filtered.map((doc) => (
                <DocRow
                  key={doc.id} doc={doc}
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 border-t shrink-0 flex items-center gap-2 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            {selectedType !== "ALL" && ` · ${TYPE_LABELS[selectedType]}`}
          </span>
          {search && (
            <span className="text-xs text-muted-foreground">
              · filtrés pour "<span className="font-medium text-foreground">{search}</span>"
            </span>
          )}
          {selectedDoc && (
            <span className="text-xs text-muted-foreground ml-auto truncate max-w-[200px]">
              <span className="font-medium text-foreground">{selectedDoc.nom}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Preview ── */}
      {selectedDoc && (
        <div className="w-full md:w-80 lg:w-96 border-l flex flex-col overflow-hidden shrink-0">
          <DocumentPreview
            key={selectedDoc.id}
            doc={selectedDoc}
            onClose={() => setSelectedDoc(null)}
            onDeleted={handleDeleted}
          />
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={loadDocs} />
    </div>
  )
}
