"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteMandateAction } from "./actions"

export function DeleteMandateButton({ mandateId, numero }: { mandateId: string; numero: string }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteMandateAction(mandateId)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
      setOpen(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="destructive" className="gap-2" onClick={() => setOpen(true)}>
        <Trash2 className="w-4 h-4" />
        Supprimer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le mandat {numero} ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cette action est irréversible. Le mandat et tous ses avenants seront supprimés. La suppression est bloquée si des réservations actives existent sur le bien associé.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
