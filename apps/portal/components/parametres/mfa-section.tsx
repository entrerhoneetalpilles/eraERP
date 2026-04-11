"use client"

import { useState, useActionState } from "react"
import { generateMfaSecretAction, enableMfaAction, disableMfaAction } from "@/app/actions/account"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { ShieldCheck, ShieldOff, Copy, CheckCircle, Loader2 } from "lucide-react"

interface MfaSectionProps {
  mfaActive: boolean
}

const enableInitial: { error: string | null; success: boolean } = { error: null, success: false }
const disableInitial: { error: string | null; success: boolean } = { error: null, success: false }

export function MfaSection({ mfaActive: initialMfaActive }: MfaSectionProps) {
  const [mfaActive, setMfaActive] = useState(initialMfaActive)
  const [pendingSecret, setPendingSecret] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [enableState, enableAction, enablePending] = useActionState(
    async (prev: typeof enableInitial, formData: FormData) => {
      const result = await enableMfaAction(prev, formData)
      if (result.success) setMfaActive(true)
      return result
    },
    enableInitial
  )

  const [disableState, disableAction, disablePending] = useActionState(
    async (prev: typeof disableInitial, formData: FormData) => {
      const result = await disableMfaAction(prev, formData)
      if (result.success) {
        setMfaActive(false)
        setPendingSecret(null)
      }
      return result
    },
    disableInitial
  )

  async function handleGenerate() {
    setIsGenerating(true)
    const result = await generateMfaSecretAction()
    setIsGenerating(false)
    if (result.error || !result.secret || !result.otpauthUrl) return
    setPendingSecret({ secret: result.secret, otpauthUrl: result.otpauthUrl })
  }

  function handleCopy() {
    if (!pendingSecret) return
    navigator.clipboard.writeText(pendingSecret.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (mfaActive) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-olivier-50 border border-olivier-100 rounded-xl">
          <ShieldCheck size={18} className="text-olivier-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-garrigue-900">Activée</p>
            <p className="text-xs text-garrigue-400 mt-0.5">
              Votre compte est protégé par une application d&apos;authentification.
            </p>
          </div>
        </div>

        <form action={disableAction} className="space-y-4 max-w-sm">
          {disableState.error && (
            <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {disableState.error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="disable-password" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
              Mot de passe actuel
            </Label>
            <Input
              id="disable-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={disablePending}
            className="h-11 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
          >
            {disablePending && <Loader2 size={14} className="animate-spin" />}
            <ShieldOff size={14} />
            Désactiver le MFA
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-calcaire-100 border border-argile-200/60 rounded-xl">
        <ShieldOff size={18} className="text-garrigue-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-garrigue-900">Non activée</p>
          <p className="text-xs text-garrigue-400 mt-0.5">
            Activez le MFA pour renforcer la sécurité de votre compte.
          </p>
        </div>
      </div>

      {!pendingSecret ? (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-11 px-6 border border-garrigue-900 text-garrigue-900 hover:bg-garrigue-900 hover:text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating && <Loader2 size={14} className="animate-spin" />}
          <ShieldCheck size={14} />
          Activer l&apos;authentification à deux facteurs
        </button>
      ) : (
        <div className="space-y-5 max-w-sm">
          <div className="space-y-3">
            <p className="text-sm text-garrigue-700 leading-relaxed">
              Entrez ce code dans votre application d&apos;authentification (Google Authenticator, Authy, etc.) ou ouvrez le lien ci-dessous.
            </p>

            {/* Secret display */}
            <div className="bg-calcaire-100 border border-argile-200/60 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-2">
                Clé secrète
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm text-garrigue-900 tracking-wider break-all">
                  {pendingSecret.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-calcaire-200 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer"
                  aria-label="Copier la clé"
                >
                  {copied ? (
                    <CheckCircle size={14} className="text-olivier-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Link to open in authenticator app */}
            <a
              href={pendingSecret.otpauthUrl}
              className="inline-flex items-center gap-1.5 text-xs text-olivier-600 hover:text-olivier-500 underline transition-fast"
            >
              Ouvrir dans mon application →
            </a>
          </div>

          {/* Verification form */}
          <form action={enableAction} className="space-y-4">
            {enableState.error && (
              <p className="text-sm text-destructive bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {enableState.error}
              </p>
            )}
            {enableState.success && (
              <div className="flex items-center gap-2 text-sm text-olivier-600 bg-olivier-50 border border-olivier-100 rounded-xl px-4 py-3">
                <CheckCircle size={15} />
                MFA activé avec succès
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Code de vérification
              </Label>
              <Input
                id="mfa-code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="h-11 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm tracking-widest text-center"
              />
              <p className="text-xs text-garrigue-400">
                Entrez le code affiché dans votre application pour confirmer.
              </p>
            </div>
            <button
              type="submit"
              disabled={enablePending}
              className="h-11 px-6 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium tracking-wide transition-smooth cursor-pointer flex items-center gap-2"
            >
              {enablePending && <Loader2 size={14} className="animate-spin" />}
              Vérifier et activer
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
