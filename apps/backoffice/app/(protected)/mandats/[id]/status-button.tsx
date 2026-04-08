"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, PauseCircle, XCircle, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { changeMandateStatusAction } from "./actions"

type MandateStatus = "ACTIF" | "SUSPENDU" | "RESILIE"

const statusConfig: Record<MandateStatus, { label: string; icon: React.ReactNode; className: string }> = {
  ACTIF: {
    label: "Actif",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "text-emerald-600",
  },
  SUSPENDU: {
    label: "Suspendu",
    icon: <PauseCircle className="w-4 h-4" />,
    className: "text-amber-600",
  },
  RESILIE: {
    label: "Résilié",
    icon: <XCircle className="w-4 h-4" />,
    className: "text-destructive",
  },
}

export function MandateStatusButton({
  mandateId,
  currentStatus,
}: {
  mandateId: string
  currentStatus: MandateStatus
}) {
  const [status, setStatus] = useState<MandateStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const current = statusConfig[status]

  async function handleChange(newStatus: MandateStatus) {
    if (newStatus === status) return
    setLoading(true)
    await changeMandateStatusAction(mandateId, newStatus)
    setStatus(newStatus)
    setLoading(false)
    toast.success(`Statut mis à jour : ${statusConfig[newStatus].label}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="sm" variant="outline" className={`gap-2 ${current.className}`} disabled={loading}>
          {current.icon}
          {current.label}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={`gap-2 ${statusConfig.ACTIF.className}`}
          onClick={() => handleChange("ACTIF")}
        >
          {statusConfig.ACTIF.icon} Actif
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`gap-2 ${statusConfig.SUSPENDU.className}`}
          onClick={() => handleChange("SUSPENDU")}
        >
          {statusConfig.SUSPENDU.icon} Suspendu
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={`gap-2 ${statusConfig.RESILIE.className}`}
          onClick={() => handleChange("RESILIE")}
        >
          {statusConfig.RESILIE.icon} Résilier le mandat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
