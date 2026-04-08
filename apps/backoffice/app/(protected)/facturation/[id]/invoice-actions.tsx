"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@conciergerie/ui"
import { ChevronDown, CheckCircle, Send, FileX, RotateCcw, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { updateInvoiceStatutAction, resendFactureEmailAction } from "./actions"

type Statut = "BROUILLON" | "EMISE" | "PAYEE" | "AVOIR"

interface InvoiceActionsProps {
  id: string
  statut: Statut
}

const STATUT_LABELS: Record<Statut, string> = {
  BROUILLON: "brouillon",
  EMISE: "émise",
  PAYEE: "payée",
  AVOIR: "avoir",
}

export function InvoiceActions({ id, statut }: InvoiceActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function changeStatut(next: Statut) {
    startTransition(async () => {
      const res = await updateInvoiceStatutAction(id, next)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Facture passée en ${STATUT_LABELS[next]}`)
        router.refresh()
      }
    })
  }

  function sendEmail() {
    startTransition(async () => {
      const res = await resendFactureEmailAction(id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Email envoyé au propriétaire")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="sm" variant="outline" disabled={isPending} className="cursor-pointer gap-1.5">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Actions
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {statut === "BROUILLON" && (
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => changeStatut("EMISE")}>
            <Send className="w-4 h-4" />
            Émettre la facture
          </DropdownMenuItem>
        )}
        {(statut === "BROUILLON" || statut === "EMISE") && (
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => changeStatut("PAYEE")}>
            <CheckCircle className="w-4 h-4" />
            Marquer comme payée
          </DropdownMenuItem>
        )}
        {statut === "PAYEE" && (
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => changeStatut("AVOIR")}>
            <FileX className="w-4 h-4" />
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
        <DropdownMenuItem className="cursor-pointer gap-2" onClick={sendEmail}>
          <Mail className="w-4 h-4" />
          Envoyer par email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
