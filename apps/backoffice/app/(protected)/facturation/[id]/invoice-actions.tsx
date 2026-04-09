"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@conciergerie/ui"
import {
  ChevronDown, CheckCircle, Send, FileX, RotateCcw,
  Loader2, Mail, BellRing, Copy, Download, CreditCard,
} from "lucide-react"
import { toast } from "sonner"
import {
  updateInvoiceStatutAction, resendFactureEmailAction,
  sendReminderAction, duplicateInvoiceAction, exportInvoiceCsvAction,
} from "./actions"
import { PaymentDialog } from "./payment-dialog"

type Statut = "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"

interface InvoiceActionsProps {
  id: string
  statut: Statut
  montantTTC: number
  numeroFacture: string
}

const STATUT_LABELS: Record<Statut, string> = {
  BROUILLON: "brouillon", EMISE: "émise", PAYEE: "payée", AVOIR: "avoir",
}

export function InvoiceActions({ id, statut, montantTTC, numeroFacture }: InvoiceActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [payOpen, setPayOpen] = useState(false)

  function changeStatut(next: Statut) {
    startTransition(async () => {
      const res = await updateInvoiceStatutAction(id, next)
      if (res.error) toast.error(res.error)
      else { toast.success(`Facture passée en ${STATUT_LABELS[next]}`); router.refresh() }
    })
  }

  function sendEmail() {
    startTransition(async () => {
      const res = await resendFactureEmailAction(id)
      if (res.error) toast.error(res.error)
      else toast.success("Email envoyé au propriétaire")
    })
  }

  function sendReminder() {
    startTransition(async () => {
      const res = await sendReminderAction(id)
      if (res.error) toast.error(res.error)
      else toast.success("Relance envoyée")
    })
  }

  function duplicate() {
    startTransition(async () => {
      const res = await duplicateInvoiceAction(id)
      if (res.error) toast.error(res.error)
      else { toast.success("Facture dupliquée"); router.push(`/facturation/${res.id}`) }
    })
  }

  async function exportCsv() {
    const res = await exportInvoiceCsvAction()
    if (!res || res.error || !res.csv) return toast.error((res as any)?.error ?? "Erreur export")
    const blob = new Blob(["﻿" + res.csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export téléchargé")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="sm" variant="outline" disabled={isPending} className="cursor-pointer gap-1.5">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Actions
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Workflow statuts */}
          {statut === "BROUILLON" && (
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => changeStatut("EMISE")}>
              <Send className="w-4 h-4 text-blue-500" />
              Émettre la facture
            </DropdownMenuItem>
          )}
          {(statut === "BROUILLON" || statut === "EMISE") && (
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setPayOpen(true)}>
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Enregistrer le paiement
            </DropdownMenuItem>
          )}
          {statut === "PAYEE" && (
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => changeStatut("AVOIR")}>
              <FileX className="w-4 h-4 text-orange-500" />
              Émettre un avoir
            </DropdownMenuItem>
          )}
          {statut !== "BROUILLON" && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-muted-foreground"
              onClick={() => changeStatut("BROUILLON")}
            >
              <RotateCcw className="w-4 h-4" />
              Repasser en brouillon
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Communication */}
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={sendEmail}>
            <Mail className="w-4 h-4" />
            Envoyer par email
          </DropdownMenuItem>
          {statut === "EMISE" && (
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={sendReminder}>
              <BellRing className="w-4 h-4 text-amber-500" />
              Envoyer une relance
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Utilitaires */}
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={duplicate}>
            <Copy className="w-4 h-4" />
            Dupliquer la facture
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={exportCsv}>
            <Download className="w-4 h-4" />
            Exporter toutes (CSV)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDialog
        invoiceId={id}
        invoiceNumber={numeroFacture}
        amount={montantTTC}
        open={payOpen}
        onOpenChange={setPayOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
