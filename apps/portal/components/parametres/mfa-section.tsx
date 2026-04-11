"use client"

import { useState, useTransition } from "react"
import { useFormState } from "react-dom"
import {
  generateMfaSecretAction,
  enableMfaAction,
  disableMfaAction,
} from "@/app/actions/account"
import { ShieldCheck, ShieldOff, Copy, ExternalLink, Loader2 } from "lucide-react"
import { Input, Label } from "@conciergerie/ui"

type MfaSectionProps = {
  mfaActive: boolean
}

type PendingSecret = {
  secret: string
  otpauthUrl: string
} | null

const enableInitialState: { error: string | null; success: boolean } = {
  error: null,
  success: false,
}

const disableInitialState: { error: string | null; success: boolean } = {
  error: null,
  success: false,
}

export function MfaSection({ mfaActive }: MfaSectionProps) {
  const [pendingSecret, setPendingSecret] = useState<PendingSecret>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [enablePending, startEnableTransition] = useTransition()
  const [disablePending, startDisableTransition] = useTransition()

  const [enableState, enableFormAction] = useFormState(
    enableMfaAction,
    enableInitialState
  )
  const [disableState, disableFormAction] = useFormState(
    disableMfaAction,
    disableInitialState
  )

  const isGenerating = false

  const handleGenerate = async () => {
    setGenerateError(null)

    try {
      const result = await generateMfaSecretAction()

      if (result.error || !result.secret || !result.otpauthUrl) {
        throw new Error(result.error ?? "Impossible de générer le secret MFA")
      }

      setPendingSecret({
        secret: result.secret,
        otpauthUrl: result.otpauthUrl,
      })
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  const handleCopy = async () => {
    if (!pendingSecret?.secret) return

    await navigator.clipboard.writeText(pendingSecret.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-3xl border border-argile-200 bg-white p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl text-garrigue-900 font-light">
            Authentification à deux facteurs
          </h3>
          <p className="text-sm text-garrigue-500 mt-2 leading-relaxed max-w-xl">
            Ajoutez une couche de sécurité supplémentaire à votre compte avec une
            application d’authentification.
          </p>
        </div>

        <div className="shrink-0">
          {mfaActive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <ShieldCheck size={14} />
              Activée
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-argile-100 px-3 py-1 text-xs font-medium text-garrigue-600">
              <ShieldOff size={14} />
              Non activée
            </span>
          )}
        </div>
      </div>

      {mfaActive ? (
        <div className="space-y-6">
          <p className="text-sm text-garrigue-600 leading-relaxed">
            Votre compte est protégé par une application d’authentification.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              startDisableTransition(() =>
                disableFormAction(new FormData(e.currentTarget))
              )
            }}
            className="space-y-4 max-w-md"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Mot de passe actuel
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={disablePending}
                className="h-12 rounded-xl"
                required
              />
            </div>

            {disableState.error && (
              <p className="text-sm text-destructive">{disableState.error}</p>
            )}

            {disableState.success && (
              <p className="text-sm text-green-600">
                Le MFA a été désactivé avec succès.
              </p>
            )}

            <button
              type="submit"
              disabled={disablePending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-garrigue-900 px-5 text-sm font-medium tracking-wide text-white transition-smooth hover:bg-garrigue-700 disabled:opacity-50"
            >
              {disablePending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Désactivation...
                </>
              ) : (
                "Désactiver le MFA"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-garrigue-600 leading-relaxed">
            Activez le MFA pour renforcer la sécurité de votre compte.
          </p>

          {!pendingSecret ? (
            <div className="space-y-4">
              {generateError && (
                <p className="text-sm text-destructive">{generateError}</p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-garrigue-900 px-5 text-sm font-medium tracking-wide text-white transition-smooth hover:bg-garrigue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  "Générer un secret MFA"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-argile-200 bg-argile-50 p-4">
                <p className="text-sm text-garrigue-700 leading-relaxed">
                  Entrez cette clé dans votre application d’authentification
                  (Google Authenticator, Authy, 1Password, etc.), ou ouvrez le lien
                  ci-dessous si votre appareil le permet.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Clé secrète</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-xl border border-argile-200 bg-white px-4 py-3 text-sm text-garrigue-900">
                    {pendingSecret.secret}
                  </code>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-argile-200 bg-white text-garrigue-700 transition-smooth hover:bg-argile-50"
                    aria-label="Copier la clé secrète"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {copied && (
                  <p className="text-xs text-green-600">
                    Clé copiée dans le presse-papiers.
                  </p>
                )}
              </div>

              <div>
                <a
                  href={pendingSecret.otpauthUrl}
                  className="inline-flex items-center gap-2 text-sm text-garrigue-700 underline underline-offset-4 hover:text-garrigue-900"
                >
                  <ExternalLink size={15} />
                  Ouvrir le lien de configuration
                </a>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  startEnableTransition(() =>
                    enableFormAction(new FormData(e.currentTarget))
                  )
                }}
                className="space-y-4 max-w-md"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="code">
                    Code à 6 chiffres
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    disabled={enablePending}
                    className="h-12 rounded-xl text-center tracking-[0.3em]"
                    required
                  />
                </div>

                {enableState.error && (
                  <p className="text-sm text-destructive">{enableState.error}</p>
                )}

                {enableState.success && (
                  <p className="text-sm text-green-600">
                    Le MFA a été activé avec succès.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enablePending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-garrigue-900 px-5 text-sm font-medium tracking-wide text-white transition-smooth hover:bg-garrigue-700 disabled:opacity-50"
                >
                  {enablePending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Activer le MFA"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  )
}