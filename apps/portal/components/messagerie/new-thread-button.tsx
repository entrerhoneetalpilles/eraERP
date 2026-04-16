"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { NewThreadDialog } from "./new-thread-dialog"

export function NewThreadButton() {
  const [open, setOpen] = useState(false)
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-garrigue-900 hover:bg-garrigue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-smooth cursor-pointer shrink-0"
      >
        <Plus size={15} strokeWidth={2} />
        <span className="hidden sm:inline">Nouveau message</span>
      </button>
      <NewThreadDialog open={open} onClose={handleClose} />
    </>
  )
}
