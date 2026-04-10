import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerThreads } from "@/lib/dal/messagerie"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { MessageCircle } from "lucide-react"

export default async function MessageriePage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const threads = await getOwnerThreads(session.user.ownerId)

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-serif text-2xl text-garrigue-900">Messages</h1>
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
                className="block bg-white rounded-xl px-4 py-3 shadow-soft hover:shadow-hover transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm ${
                      unread > 0
                        ? "font-semibold text-garrigue-900"
                        : "font-medium text-garrigue-700"
                    }`}
                  >
                    {t.subject}
                  </p>
                  {unread > 0 && (
                    <span className="shrink-0 text-xs bg-olivier-600 text-white rounded-full px-2 py-0.5 font-medium">
                      {unread}
                    </span>
                  )}
                </div>
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
