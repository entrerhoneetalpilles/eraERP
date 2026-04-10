"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@conciergerie/ui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Upload, X, FileText, Image, File } from "lucide-react"
import { toast } from "sonner"
import { uploadDocumentAction } from "./actions"

const DOC_TYPES = [
  { value: "MANDAT", label: "Mandat" },
  { value: "AVENANT", label: "Avenant" },
  { value: "DEVIS", label: "Devis" },
  { value: "FACTURE", label: "Facture" },
  { value: "CRG", label: "CRG" },
  { value: "ETAT_LIEUX", label: "État des lieux" },
  { value: "ATTESTATION_FISCALE", label: "Attestation fiscale" },
  { value: "PHOTO", label: "Photo" },
  { value: "DIAGNOSTIC", label: "Diagnostic" },
  { value: "AUTRE", label: "Autre" },
] as const

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />
  if (mime === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />
  return <File className="w-5 h-5 text-muted-foreground" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: () => void
}

export function UploadDialog({ open, onOpenChange, onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [type, setType] = useState<string>("AUTRE")
  const [dateExpiration, setDateExpiration] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const added = Array.from(newFiles).filter((f) => !existing.has(`${f.name}-${f.size}`))
      return [...prev, ...added]
    })
  }, [])

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    let errors = 0

    for (const file of files) {
      const fd = new FormData()
      fd.set("file", file)
      fd.set("type", type)
      fd.set("entity_type", "document")
      fd.set("entity_id", "misc")
      if (dateExpiration) fd.set("date_expiration", dateExpiration)

      const result = await uploadDocumentAction(fd)
      if (result.error) errors++
    }

    setUploading(false)
    if (errors === 0) {
      toast.success(`${files.length} fichier${files.length > 1 ? "s" : ""} importé${files.length > 1 ? "s" : ""}`)
    } else {
      toast.error(`${errors} erreur${errors > 1 ? "s" : ""} lors de l'import`)
    }

    setFiles([])
    setDateExpiration("")
    onUploaded()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type de document</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Date d'expiration */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Date d&apos;expiration <span className="font-normal">(optionnel — DPE, assurance…)</span>
            </label>
            <input
              type="date"
              name="date_expiration"
              value={dateExpiration}
              onChange={(e) => setDateExpiration(e.target.value)}
              className="w-full text-sm border border-border rounded-md px-2.5 py-1.5 bg-background"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            <Upload className={`w-8 h-8 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium text-foreground">
              Glissez vos fichiers ici, ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground">PDF, images, Excel, Word — 50 MB max par fichier</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.docx,.doc"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 bg-card">
                  {fileIcon(file.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setFiles([]); setDateExpiration("") }}>
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Import en cours…" : `Importer ${files.length > 0 ? `(${files.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
