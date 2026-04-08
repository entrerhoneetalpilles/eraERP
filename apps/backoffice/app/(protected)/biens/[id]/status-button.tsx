"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, PauseCircle, Wrench, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { changePropertyStatusAction } from "./actions"

type PropertyStatus = "ACTIF" | "INACTIF" | "TRAVAUX"

const statusConfig: Record<PropertyStatus, { label: string; icon: React.ReactNode; className: string }> = {
  ACTIF: {
    label: "Actif",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "text-emerald-600",
  },
  INACTIF: {
    label: "Inactif",
    icon: <PauseCircle className="w-4 h-4" />,
    className: "text-muted-foreground",
  },
  TRAVAUX: {
    label: "Travaux",
    icon: <Wrench className="w-4 h-4" />,
    className: "text-amber-600",
  },
}

export function PropertyStatusButton({ propertyId, currentStatus }: { propertyId: string; currentStatus: PropertyStatus }) {
  const [status, setStatus] = useState<PropertyStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const current = statusConfig[status]

  async function handleChange(newStatus: PropertyStatus) {
    if (newStatus === status) return
    setLoading(true)
    await changePropertyStatusAction(propertyId, newStatus)
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
        {(Object.keys(statusConfig) as PropertyStatus[]).map((s) => (
          <DropdownMenuItem
            key={s}
            className={`gap-2 ${statusConfig[s].className}`}
            onClick={() => handleChange(s)}
          >
            {statusConfig[s].icon}
            {statusConfig[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
