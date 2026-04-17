"use client"

import { useState, useTransition } from "react"
import { createTemplateAction } from "../actions"
import type { PdfTemplateType } from "@/lib/pdf/template-types"

const ALL_TYPES: PdfTemplateType[] = ["FACTURE", "DEVIS", "MANDAT", "CONTRAT", "QUITTANCE"]

interface Props {
  preType?: PdfTemplateType
  typeLabels: Record<PdfTemplateType, string>
}

export function NewTemplateForm({ preType, typeLabels }: Props) {
  const [nom, setNom] = useState("")
  const [type, setType] = useState<PdfTemplateType>(preType ?? "FACTURE")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => { createTemplateAction(nom, type) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Type de document *</label>
        <div className="grid grid-cols-1 gap-2">
          {ALL_TYPES.map((t) => (
            <label
              key={t}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                type === t
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-border/80 hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="hidden"
              />
              <span
                className={`w-2 h-2 rounded-full ${type === t ? "bg-primary" : "bg-border"}`}
              />
              <span className="text-sm font-medium">{typeLabels[t]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="nom" className="text-sm font-medium text-foreground">
          Nom du modèle *
        </label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          placeholder={`ex: Facture standard 2026`}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !nom.trim()}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {isPending ? "Création…" : "Créer et ouvrir l'éditeur →"}
      </button>
    </form>
  )
}
