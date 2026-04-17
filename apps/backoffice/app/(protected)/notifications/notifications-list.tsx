"use client"

import { useTransition } from "react"
import { Button } from "@conciergerie/ui"
import { Bell, CheckCheck } from "lucide-react"
import { markReadAction, markAllReadAction } from "./actions"

type Notification = {
  id: string
  type: string
  titre: string
  message: string
  lu: boolean
  entity_type: string | null
  entity_id: string | null
  createdAt: Date | string
}

export function NotificationsList({ notifications, userId }: { notifications: Notification[]; userId: string }) {
  const [isPending, startTransition] = useTransition()
  const unreadCount = notifications.filter(n => !n.lu).length

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm" variant="outline"
            disabled={isPending}
            onClick={() => startTransition(() => { void markAllReadAction() })}
            className="gap-2 text-xs h-7"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tout marquer comme lu
          </Button>
        </div>
      )}
      <div className="space-y-1.5">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
              n.lu ? "bg-card border-border" : "bg-primary/5 border-primary/20"
            }`}
            onClick={() => !n.lu && startTransition(() => { void markReadAction(n.id) })}
          >
            <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.lu ? "text-muted-foreground" : "text-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${n.lu ? "text-foreground" : "text-primary"}`}>{n.titre}</p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            {!n.lu && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
