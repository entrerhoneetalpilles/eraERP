"use client"

import { useState, useTransition } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendOwnerMessageAction } from "@/app/(protected)/messagerie/actions"

export function MessageForm({ threadId }: { threadId: string }) {
  const [contenu, setContenu] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contenu.trim()) return
    const msg = contenu.trim()
    setContenu("")
    startTransition(async () => {
      const result = await sendOwnerMessageAction(threadId, msg)
      if (result.error) {
        toast.error(result.error)
        setContenu(msg)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 border-t border-argile-200/60 bg-calcaire-50"
    >
      <input
        type="text"
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Votre message…"
        className="flex-1 bg-white rounded-2xl border border-argile-300 focus:border-garrigue-900 focus:outline-none px-4 py-3 text-sm text-garrigue-900 placeholder:text-garrigue-300 transition-fast"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
          }
        }}
      />
      <button
        type="submit"
        disabled={isPending || !contenu.trim()}
        aria-label="Envoyer"
        className="w-10 h-10 rounded-full bg-garrigue-900 hover:bg-garrigue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-smooth cursor-pointer"
      >
        <Send size={15} strokeWidth={2} />
      </button>
    </form>
  )
}
