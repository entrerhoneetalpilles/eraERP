"use client"

import { useState } from "react"
import { Wifi, Key, FileText, Eye, EyeOff } from "lucide-react"

interface PropertyAccessCardProps {
  wifi_nom: string | null
  wifi_mdp: string | null
  code_acces: string | null
  instructions_arrivee: string | null
  notes_depart: string | null
}

export function PropertyAccessCard({
  wifi_nom,
  wifi_mdp,
  code_acces,
  instructions_arrivee,
  notes_depart,
}: PropertyAccessCardProps) {
  const [showWifi, setShowWifi] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const hasAny = wifi_nom || wifi_mdp || code_acces || instructions_arrivee || notes_depart
  if (!hasAny) return null

  return (
    <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-argile-200/40">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
          Informations d&apos;accès
        </h2>
      </div>
      <div className="px-5 py-4 space-y-4">
        {(wifi_nom || wifi_mdp) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <Wifi size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Wi-Fi
              </p>
              {wifi_nom && (
                <p className="text-sm text-garrigue-900 font-medium">{wifi_nom}</p>
              )}
              {wifi_mdp && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-garrigue-600 font-mono">
                    {showWifi ? wifi_mdp : "••••••••"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowWifi((v) => !v)}
                    className="text-garrigue-400 hover:text-garrigue-700 transition-fast cursor-pointer focus-visible:ring-2 focus-visible:ring-or-400 focus-visible:ring-offset-1 rounded-sm outline-none"
                    aria-label={showWifi ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showWifi ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {code_acces && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <Key size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Code d&apos;accès
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-garrigue-600 font-mono tracking-widest">
                  {showCode ? code_acces : "••••"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="text-garrigue-400 hover:text-garrigue-700 transition-fast cursor-pointer focus-visible:ring-2 focus-visible:ring-or-400 focus-visible:ring-offset-1 rounded-sm outline-none"
                  aria-label={showCode ? "Masquer le code" : "Afficher le code"}
                >
                  {showCode ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {instructions_arrivee && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Instructions d&apos;arrivée
              </p>
              <p className="text-sm text-garrigue-600 leading-relaxed whitespace-pre-line">
                {instructions_arrivee}
              </p>
            </div>
          </div>
        )}

        {notes_depart && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-calcaire-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={14} className="text-garrigue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-1">
                Instructions de départ
              </p>
              <p className="text-sm text-garrigue-600 leading-relaxed whitespace-pre-line">
                {notes_depart}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
