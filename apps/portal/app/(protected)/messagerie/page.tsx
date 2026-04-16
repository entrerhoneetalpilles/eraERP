import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerThreads } from "@/lib/dal/messagerie"
import { NewThreadButton } from "@/components/messagerie/new-thread-button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { MessageCircle } from "lucide-react"

export default async function MessageriePage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const threads = await getOwnerThreads(session.user.ownerId)

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Messages.</h1>
        <NewThreadButton />
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <MessageCircle size={40} />
          <p className="text-sm">Aucun message</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => {
            const lastMessage = t.messages[0]
            const unread = t._count.messages
            return (
              <Link
                key={t.id}
                href={`/messagerie/${t.id}`}
                className={`block bg-white rounded-xl p-4 shadow-luxury-card border transition-smooth hover:shadow-luxury cursor-pointer ${
                  unread > 0 ? "border-l-4 border-l-or-400" : "border-argile-200/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-lg text-garrigue-900 font-light truncate">
                    {t.subject}
                  </p>
                  {unread > 0 && (
                    <span className="shrink-0 text-xs font-bold text-white bg-or-500 rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-garrigue-400 mt-0.5 font-medium">
                  {t.to_name ?? "Équipe ERA"}
                </p>
                {lastMessage && (
                  <p className="text-xs text-garrigue-400 mt-1 truncate">{lastMessage.contenu}</p>
                )}
                <p className="text-xs text-garrigue-300 mt-1">
                  {formatDistanceToNow(t.updatedAt, { addSuffix: true, locale: fr })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
