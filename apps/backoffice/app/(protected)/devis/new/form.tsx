"use client"

import { useFormState } from "react-dom"
import { createDevisAction } from "./actions"

const WORK_TYPES = [
  "Plomberie", "Électricité", "Peinture", "Menuiserie",
  "Serrurerie", "Jardinage", "Ménage approfondi", "Climatisation / Chauffage",
  "Maçonnerie", "Carrelage", "Vitrage", "Autre",
]

interface Props {
  properties: {
    id: string
    nom: string
    mandate: { seuil_validation_devis: number; owner: { nom: string } | null } | null
  }[]
  contractors: { id: string; nom: string; metier: string }[]
}

export function NewDevisForm({ properties, contractors }: Props) {
  const [state, formAction] = useFormState(createDevisAction, null)

  return (
    <form action={formAction} className="space-y-5">
      {/* Bien */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Bien <span className="text-destructive">*</span>
        </label>
        <select
          name="property_id"
          required
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Sélectionner un bien…</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}{p.mandate?.owner ? ` — ${p.mandate.owner.nom}` : ""}
              {p.mandate ? ` (seuil ${p.mandate.seuil_validation_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Titre */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Titre <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="titre"
          required
          placeholder="ex: Remplacement robinetterie salle de bain"
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Type + Urgence */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Type de travaux <span className="text-destructive">*</span>
          </label>
          <select
            name="type"
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Choisir…</option>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Urgence</label>
          <select
            name="urgence"
            defaultValue="NORMALE"
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="NORMALE">Normale</option>
            <option value="URGENTE">Urgente</option>
            <option value="CRITIQUE">Critique</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Détails des travaux à réaliser…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {/* Montant + Imputable à */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Montant HT (€) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            name="montant_devis"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Imputé à</label>
          <select
            name="imputable_a"
            defaultValue="PROPRIETAIRE"
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="PROPRIETAIRE">Propriétaire</option>
            <option value="SOCIETE">Société</option>
          </select>
        </div>
      </div>

      {/* Prestataire (optionnel) */}
      {contractors.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Prestataire (optionnel)</label>
          <select
            name="contractor_id"
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Aucun</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>{c.nom} — {c.metier}</option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Notes internes</label>
        <textarea
          name="notes_devis"
          rows={2}
          placeholder="Remarques, conditions particulières…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Créer le devis
        </button>
        <a href="/devis" className="text-sm text-muted-foreground hover:text-foreground">
          Annuler
        </a>
      </div>
    </form>
  )
}
