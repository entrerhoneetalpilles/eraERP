"use client"

import { useActionState } from "react"
import { changePasswordAction } from "@/app/actions/account"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { Loader2, CheckCircle } from "lucide-react"

const initialState: { error: string | null; success: boolean } = { error: null, success: false }

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      {state.success && (
        <div className="flex items-center gap-2 text-sm text-olivier-600 bg-olivier-50 border border-olivier-100 rounded-xl px-4 py-3">
          <CheckCircle size={15} />
          Mot de passe modifié avec succès
        </div>
      )}
      {state.error && (
        <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Mot de passe actuel
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Nouveau mot de passe
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
        <p className="text-xs text-garrigue-400">Minimum 8 caractères</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
          Confirmer le nouveau mot de passe
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 px-6 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        Modifier le mot de passe
      </button>
    </form>
  )
}
