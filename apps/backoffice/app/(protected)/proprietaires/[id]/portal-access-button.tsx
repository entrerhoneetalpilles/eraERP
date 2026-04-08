"use client"

import { useState } from "react"
import { Button } from "@conciergerie/ui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { KeyRound, UserPlus, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { createPortalAccessAction } from "./actions"

interface PortalAccessButtonProps {
  ownerId: string
  mode: "create" | "reset"
}

export function PortalAccessButton({ ownerId, mode }: PortalAccessButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ tempPassword: string; email: string; action: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await createPortalAccessAction(ownerId)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
      return
    }

    setResult({ tempPassword: res.tempPassword!, email: res.email!, action: res.action! })
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button
        size="sm"
        variant={mode === "create" ? "default" : "outline"}
        className="gap-2 w-full"
        disabled={loading}
        onClick={handleClick}
      >
        {mode === "create" ? (
          <><UserPlus className="w-3.5 h-3.5" /> {loading ? "Création…" : "Créer l'accès portail"}</>
        ) : (
          <><KeyRound className="w-3.5 h-3.5" /> {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}</>
        )}
      </Button>

      <Dialog open={!!result} onOpenChange={() => setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {result?.action === "created" ? "Accès portail créé" : "Mot de passe réinitialisé"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transmettez ces identifiants au propriétaire de manière sécurisée.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{result?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Mot de passe temporaire</p>
                  <p className="text-sm font-mono font-bold tracking-wider">{result?.tempPassword}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Le propriétaire pourra modifier son mot de passe après sa première connexion sur le portail.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
