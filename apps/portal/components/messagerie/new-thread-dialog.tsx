"use client"

import { useEffect, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send } from "lucide-react"
import { createThreadAction } from "@/app/(protected)/messagerie/actions"

interface NewThreadDialogProps {
  open: boolean
  onClose: () => void
}

export function NewThreadDialog({ open, onClose }: NewThreadDialogProps) {
  const [subject, setSubject] = useState("")
  const [contenu, setContenu] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createThreadAction(subject, contenu)
      if (result?.error) setError(result.error)
      // On success, createThreadAction calls redirect() — page navigates automatically
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-garrigue-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-0 inset-x-0 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[440px] bg-white sm:rounded-2xl rounded-t-2xl shadow-luxury px-6 pt-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-thread-title"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                id="new-thread-title"
                className="font-serif text-2xl text-garrigue-900 font-light italic"
              >
                Nouveau message.
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-calcaire-100 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer focus-visible:ring-2 focus-visible:ring-or-400 outline-none"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-thread-subject"
                  className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]"
                >
                  Sujet
                </label>
                <input
                  id="new-thread-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Question sur ma réservation de juillet"
                  required
                  className="w-full bg-calcaire-50 border border-argile-300 focus:border-garrigue-900 focus:outline-none rounded-xl px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 transition-fast"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="new-thread-contenu"
                  className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]"
                >
                  Message
                </label>
                <textarea
                  id="new-thread-contenu"
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Votre message…"
                  required
                  rows={4}
                  className="w-full bg-calcaire-50 border border-argile-300 focus:border-garrigue-900 focus:outline-none rounded-xl px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 transition-fast resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending || !subject.trim() || !contenu.trim()}
                className="w-full flex items-center justify-center gap-2 bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-40 text-white rounded-xl px-4 py-3 text-sm font-medium transition-smooth cursor-pointer"
              >
                <Send size={14} strokeWidth={2} />
                {isPending ? "Envoi…" : "Envoyer"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
