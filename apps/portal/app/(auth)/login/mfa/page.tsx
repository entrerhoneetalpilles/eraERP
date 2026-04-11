"use client"

import { useActionState } from "react"
import { verifyMfaAction } from "@/app/actions/mfa"
import { Loader2, ShieldCheck } from "lucide-react"
import { Input, Label } from "@conciergerie/ui"

const initialState = { error: null }

export default function MfaPage() {
  const [state, formAction, isPending] = useActionState(verifyMfaAction, initialState)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <span className="font-serif text-3xl font-semibold text-white tracking-[0.08em]">
            ERA
          </span>
        </div>
        <div className="relative space-y-6">
          <h1 className="font-serif text-5xl font-light text-white leading-[1.1] italic">
            Vérification en deux étapes.
          </h1>
          <p className="text-garrigue-400 text-sm leading-relaxed max-w-xs font-light">
            Votre compte est protégé par une authentification à deux facteurs.
          </p>
        </div>
        <div className="relative">
          <p className="text-garrigue-400/40 text-xs tracking-widest uppercase">
            Espace Propriétaire
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="font-serif text-3xl font-semibold text-garrigue-900 tracking-[0.08em]">
              ERA
            </span>
            <p className="text-xs text-garrigue-400 mt-1 tracking-wide italic">
              Entre Rhône et Alpilles
            </p>
          </div>

          {/* Icon + heading */}
          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-garrigue-100 flex items-center justify-center mb-6">
              <ShieldCheck size={22} strokeWidth={1.6} className="text-garrigue-700" />
            </div>
            <h2 className="font-serif text-3xl text-garrigue-900 font-light">
              Code de vérification.
            </h2>
            <p className="text-garrigue-500 text-sm mt-2 leading-relaxed">
              Entrez le code à 6 chiffres généré par votre application d'authentification.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="sr-only">Code à 6 chiffres</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000 000"
                autoFocus
                className="h-14 text-center text-2xl tracking-[0.3em] border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 font-light"
              />
              {state.error && (
                <p className="text-xs text-destructive text-center">{state.error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-50 text-white rounded-xl font-medium tracking-wide transition-smooth cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Vérifier le code"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-garrigue-400/60 mt-10 italic">
            Entre Rhône et Alpilles · Conciergerie Haut de Gamme
          </p>
        </div>
      </div>
    </div>
  )
}
