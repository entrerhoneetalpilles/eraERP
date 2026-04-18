"use client"

import { useRef, useState, useTransition } from "react"
import { Upload, Loader2, Info } from "lucide-react"
import { importCsvAction } from "./actions"

export function CsvImport() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean; nb?: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await importCsvAction(null, fd)
      setResult(res)
      if (res?.success) {
        setOpen(false)
        if (fileRef.current) fileRef.current.value = ""
      }
    })
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        Importer un relevé CSV
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-border bg-card p-5 space-y-4 max-w-lg">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-md p-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>Format CSV attendu (séparateur <code>;</code>) :<br />
              <strong>date;libelle;montant</strong><br />
              Exemple : <code>2024-01-15;Virement Dupont Jean;1200,00</code><br />
              La première ligne (en-tête) est ignorée.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Fichier CSV *</label>
            <input
              ref={fileRef}
              type="file"
              name="file"
              accept=".csv,.txt"
              required
              className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:bg-background file:text-sm file:font-medium file:cursor-pointer hover:file:bg-accent"
            />
          </div>
          {result?.error && <p className="text-xs text-destructive">{result.error}</p>}
          {result?.success && <p className="text-xs text-emerald-600">{result.nb} ligne(s) importée(s) avec succès</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Importer
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
