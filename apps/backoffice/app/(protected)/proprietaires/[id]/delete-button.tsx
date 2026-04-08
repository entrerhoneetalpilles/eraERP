"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteOwnerAction } from "./actions"

export function DeleteOwnerButton({ ownerId, ownerNom }: { ownerId: string; ownerNom: string }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteOwnerAction(ownerId)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
      setOpen(false)
    }
    // Si pas d'erreur, la server action redirige directement
  }

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
        Supprimer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer {ownerNom} ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cette action est irréversible. Toutes les données associées (mandats, documents, messages) seront supprimées. La suppression est bloquée si des réservations actives existent.
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
