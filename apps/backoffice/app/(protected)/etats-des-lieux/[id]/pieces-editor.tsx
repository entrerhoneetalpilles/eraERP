"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Loader2, Save } from "lucide-react"
import { updatePiecesAction } from "../actions"

type Etat = "BON" | "MOYEN" | "MAUVAIS" | "A_REMPLACER"

type Piece = {
  id: string
  nom: string
  etat: Etat
  observations: string
}

const ETAT_LABELS: Record<Etat, string> = {
  BON: "Bon état",
  MOYEN: "État moyen",
  MAUVAIS: "Mauvais état",
  A_REMPLACER: "À remplacer",
}
const ETAT_COLORS: Record<Etat, string> = {
  BON: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  MOYEN: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  MAUVAIS: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
  A_REMPLACER: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400",
}

const PIECES_PREDEFINIES = [
  "Entrée", "Salon", "Séjour", "Cuisine", "Chambre 1", "Chambre 2", "Chambre 3",
  "Salle de bain", "Salle d'eau", "WC", "Couloir", "Dressing", "Buanderie",
  "Cave", "Garage", "Terrasse", "Jardin", "Balcon",
]

function newPiece(): Piece {
  return { id: crypto.randomUUID(), nom: "", etat: "BON", observations: "" }
}

function parsePieces(raw: unknown[]): Piece[] {
  return raw
    .filter(p => p && typeof p === "object")
    .map((p: unknown) => {
      const obj = p as Record<string, unknown>
      return {
        id: String(obj.id ?? crypto.randomUUID()),
        nom: String(obj.nom ?? ""),
        etat: (["BON", "MOYEN", "MAUVAIS", "A_REMPLACER"].includes(String(obj.etat)) ? obj.etat : "BON") as Etat,
        observations: String(obj.observations ?? ""),
      }
    })
}

export function PiecesEditor({
  inventoryId,
  initialPieces,
  readOnly,
}: {
  inventoryId: string
  initialPieces: unknown[]
  readOnly: boolean
}) {
  const [pieces, setPieces] = useState<Piece[]>(() =>
    initialPieces.length > 0 ? parsePieces(initialPieces) : []
  )
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function addPiece(nom = "") {
    setPieces(p => [...p, { ...newPiece(), nom }])
    setSaved(false)
  }

  function updatePiece(id: string, field: keyof Piece, value: string) {
    setPieces(p => p.map(pc => pc.id === id ? { ...pc, [field]: value } : pc))
    setSaved(false)
  }

  function removePiece(id: string) {
    setPieces(p => p.filter(pc => pc.id !== id))
    setSaved(false)
  }

  function save() {
    startTransition(async () => {
      await updatePiecesAction(inventoryId, pieces)
      setSaved(true)
    })
  }

  const resumeEtats = pieces.reduce<Record<string, number>>((acc, p) => {
    acc[p.etat] = (acc[p.etat] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Résumé */}
      {pieces.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.entries(resumeEtats) as [Etat, number][]).map(([etat, nb]) => (
            <span key={etat} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ETAT_COLORS[etat]}`}>
              {nb} {ETAT_LABELS[etat]}
            </span>
          ))}
        </div>
      )}

      {/* Liste des pièces */}
      <div className="space-y-2">
        {pieces.map((piece, idx) => (
          <div key={piece.id} className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nom de la pièce */}
                <div>
                  {readOnly ? (
                    <p className="text-sm font-semibold text-foreground">{piece.nom || "—"}</p>
                  ) : (
                    <input
                      list={`pieces-list-${piece.id}`}
                      value={piece.nom}
                      onChange={e => updatePiece(piece.id, "nom", e.target.value)}
                      placeholder="Nom de la pièce"
                      className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                  {!readOnly && (
                    <datalist id={`pieces-list-${piece.id}`}>
                      {PIECES_PREDEFINIES.map(p => <option key={p} value={p} />)}
                    </datalist>
                  )}
                </div>
                {/* État */}
                <div>
                  {readOnly ? (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${ETAT_COLORS[piece.etat]}`}>
                      {ETAT_LABELS[piece.etat]}
                    </span>
                  ) : (
                    <select
                      value={piece.etat}
                      onChange={e => updatePiece(piece.id, "etat", e.target.value)}
                      className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                      {(Object.entries(ETAT_LABELS) as [Etat, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {!readOnly && (
                <button
                  onClick={() => removePiece(piece.id)}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Observations */}
            <div className="pl-8">
              {readOnly ? (
                piece.observations && (
                  <p className="text-sm text-muted-foreground italic">{piece.observations}</p>
                )
              ) : (
                <textarea
                  value={piece.observations}
                  onChange={e => updatePiece(piece.id, "observations", e.target.value)}
                  placeholder="Observations (optionnel)"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none text-muted-foreground"
                />
              )}
            </div>
          </div>
        ))}

        {pieces.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Aucune pièce renseignée</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ajout rapide pièces prédéfinies */}
          <div className="flex flex-wrap gap-1.5">
            {PIECES_PREDEFINIES.slice(0, 8).map(nom => (
              <button
                key={nom}
                onClick={() => addPiece(nom)}
                className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors cursor-pointer text-muted-foreground"
              >
                + {nom}
              </button>
            ))}
            <button
              onClick={() => addPiece()}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-dashed border-border hover:bg-accent transition-colors cursor-pointer text-muted-foreground"
            >
              <Plus className="w-3 h-3" />Autre
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {saved && <span className="text-xs text-emerald-600">Enregistré</span>}
            <button
              onClick={save}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
