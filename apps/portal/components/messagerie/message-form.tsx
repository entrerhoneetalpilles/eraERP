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
      className="flex items-end gap-2 p-4 border-t border-border bg-white"
    >
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Votre message…"
        rows={2}
        className="flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm text-garrigue-900 bg-calcaire-100 focus:outline-none focus:border-olivier-400 placeholder:text-garrigue-300"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
          }
        }}
      />
      <button
        type="submit"
        disabled={isPending || !contenu.trim()}
        aria-label="Envoyer"
        className="p-3 bg-olivier-600 text-white rounded-xl hover:bg-olivier-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
