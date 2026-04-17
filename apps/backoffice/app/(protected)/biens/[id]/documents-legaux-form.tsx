"use client"

import { useState, useTransition } from "react"
import { Button } from "@conciergerie/ui"
import { FileCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { upsertPropertyDocumentAction } from "./actions"

type DocType = "DPE" | "ELECTRICITE" | "GAZ" | "PLOMB" | "AMIANTE" | "PNO" | "AUTRE"
type DocStatut = "VALIDE" | "EXPIRE" | "MANQUANT"

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "DPE", label: "DPE" },
  { value: "ELECTRICITE", label: "Électricité" },
  { value: "GAZ", label: "Gaz" },
  { value: "PLOMB", label: "Plomb" },
  { value: "AMIANTE", label: "Amiante" },
  { value: "PNO", label: "Assurance PNO" },
  { value: "AUTRE", label: "Autre" },
]

const STATUT_CONFIG: Record<DocStatut, { label: string; icon: React.ReactNode; cls: string }> = {
  VALIDE: { label: "Valide", icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, cls: "text-green-700 bg-green-50 border-green-200" },
  EXPIRE: { label: "Expiré", icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  MANQUANT: { label: "Manquant", icon: <XCircle className="w-4 h-4 text-red-500" />, cls: "text-red-700 bg-red-50 border-red-200" },
}

type PropertyDocument = {
  id: string
  type: string
  statut: string
  date_validite: Date | null
}

export function PropertyDocumentsForm({
  propertyId,
  documents,
}: {
  propertyId: string
  documents: PropertyDocument[]
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<DocType | null>(null)
  const [formData, setFormData] = useState({ statut: "VALIDE" as DocStatut, date_validite: "" })

  const docMap = Object.fromEntries(documents.map(d => [d.type, d]))

  function startEdit(type: DocType) {
    const existing = docMap[type]
    setFormData({
      statut: (existing?.statut as DocStatut) ?? "MANQUANT",
      date_validite: existing?.date_validite
        ? new Date(existing.date_validite).toISOString().split("T")[0]
        : "",
    })
    setEditing(type)
  }

  function handleSave() {
    if (!editing) return
    startTransition(async () => {
      await upsertPropertyDocumentAction(propertyId, {
        type: editing,
        statut: formData.statut,
        date_validite: formData.date_validite || undefined,
      })
      setEditing(null)
    })
  }

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <div className="bg-card rounded-md border border-border p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <FileCheck className="w-3.5 h-3.5" />
        Documents légaux
      </h2>

      <div className="divide-y divide-border">
        {DOC_TYPES.map(({ value, label }) => {
          const doc = docMap[value]
          const statut = (doc?.statut ?? "MANQUANT") as DocStatut
          const cfg = STATUT_CONFIG[statut]
          const isEditingThis = editing === value

          return (
            <div key={value} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {cfg.icon}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {doc?.date_validite && (
                      <p className="text-xs text-muted-foreground">
                        Valide jusqu'au {new Date(doc.date_validite).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => isEditingThis ? setEditing(null) : startEdit(value)}
                  >
                    {isEditingThis ? "Annuler" : "Modifier"}
                  </Button>
                </div>
              </div>

              {isEditingThis && (
                <div className="mt-3 bg-muted rounded-md p-3 space-y-3 border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Statut</label>
                      <select
                        className={inputCls}
                        value={formData.statut}
                        onChange={e => setFormData(p => ({ ...p, statut: e.target.value as DocStatut }))}
                      >
                        <option value="VALIDE">Valide</option>
                        <option value="EXPIRE">Expiré</option>
                        <option value="MANQUANT">Manquant</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Date de validité</label>
                      <input
                        className={inputCls}
                        type="date"
                        value={formData.date_validite}
                        onChange={e => setFormData(p => ({ ...p, date_validite: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                    <Button size="sm" disabled={isPending} onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
