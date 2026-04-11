"use client"

import { useTransition } from "react"
import { useFormState } from "react-dom"
import { changePasswordAction } from "@/app/actions/account"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { Loader2, CheckCircle } from "lucide-react"

const initialState: { error: string | null; success: boolean } = {
  error: null,
  success: false,
}

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useFormState(changePasswordAction, initialState)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(() => formAction(new FormData(e.currentTarget)))
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          required
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <CheckCircle size={14} />
          Mot de passe modifié avec succès.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          "Modifier le mot de passe"
        )}
      </button>
    </form>
  )
}