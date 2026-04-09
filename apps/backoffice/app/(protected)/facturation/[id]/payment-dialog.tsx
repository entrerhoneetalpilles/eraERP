"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button, Input, Label } from "@conciergerie/ui"
import { toast } from "sonner"
import { recordPaymentAction } from "./actions"

const MODES = [
  { value: "VIREMENT", label: "Virement bancaire" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CB", label: "Carte bancaire" },
  { value: "PRELEVEMENT", label: "Prélèvement" },
  { value: "ESPECES", label: "Espèces" },
]

interface PaymentDialogProps {
  invoiceId: string
  invoiceNumber: string
  amount: number
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

export function PaymentDialog({
  invoiceId,
  invoiceNumber,
  amount,
  open,
  onOpenChange,
  onSuccess,
}: PaymentDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState("VIREMENT")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState("")

  function handleSubmit() {
    if (!date) return toast.error("Date de paiement requise")
    startTransition(async () => {
      const res = await recordPaymentAction(invoiceId, {
        date_paiement: date,
        mode_paiement: mode,
        reference_paiement: reference || undefined,
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Paiement enregistré")
        onOpenChange(false)
        onSuccess()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer le paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-muted/40 border border-border">
            <span className="text-sm text-muted-foreground">Facture</span>
            <span className="text-sm font-mono font-semibold">{invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium">Montant TTC</span>
            <span className="text-lg font-bold text-primary">
              {amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Mode de règlement</Label>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`px-3 py-2 rounded-md text-sm border transition-colors cursor-pointer text-left ${
                    mode === m.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pay-date" className="text-sm font-medium">Date de réception</Label>
              <Input
                id="pay-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-ref" className="text-sm font-medium">Référence (optionnel)</Label>
              <Input
                id="pay-ref"
                placeholder="VIR-2025-001, CHQ-123…"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending} className="cursor-pointer">
            {isPending ? "Enregistrement…" : "Confirmer le paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
