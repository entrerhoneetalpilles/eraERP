"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { assignCleaningTaskAction } from "./actions"

interface Contractor { id: string; nom: string }

export function AssignButton({ taskId, contractors }: { taskId: string; contractors: Contractor[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline cursor-pointer"
      >
        Assigner
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <select
        id={`assign-${taskId}`}
        className="text-xs border border-border rounded px-1.5 py-1 bg-background"
        defaultValue=""
        onChange={async (e) => {
          const contractorId = e.target.value
          if (!contractorId) return
          setLoading(true)
          await assignCleaningTaskAction(taskId, contractorId)
          setLoading(false)
          setOpen(false)
        }}
      >
        <option value="">Choisir…</option>
        {contractors.map(c => (
          <option key={c.id} value={c.id}>{c.nom}</option>
        ))}
      </select>
      {loading && <span className="text-xs text-muted-foreground">…</span>}
      <button
        onClick={() => setOpen(false)}
        aria-label="Annuler"
        className="text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
