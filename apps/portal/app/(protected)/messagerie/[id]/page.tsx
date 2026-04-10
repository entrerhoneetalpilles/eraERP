import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOwnerThread } from "@/lib/dal/messagerie"
import { MessageBubble } from "@/components/messagerie/message-bubble"
import { MessageForm } from "@/components/messagerie/message-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const thread = await getOwnerThread(session.user.ownerId, params.id)
  if (!thread) notFound()

  return (
    <div className="flex flex-col max-w-2xl h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <Link
          href="/messagerie"
          className="text-garrigue-400 hover:text-garrigue-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-serif text-lg text-garrigue-900 truncate">{thread.subject}</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {thread.messages.map((m) => (
          <MessageBubble
            key={m.id}
            contenu={m.contenu}
            authorType={m.author_type as "USER" | "OWNER"}
            createdAt={m.createdAt}
            attachments={m.attachments}
          />
        ))}
      </div>

      <div className="shrink-0 -mx-4 lg:-mx-8">
        <MessageForm threadId={thread.id} />
      </div>
    </div>
  )
}
