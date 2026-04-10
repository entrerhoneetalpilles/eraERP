import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { FileText } from "lucide-react"

interface Attachment {
  id: string
  nom: string
  mime_type: string
}

interface MessageBubbleProps {
  contenu: string
  authorType: "USER" | "OWNER"
  createdAt: Date
  attachments: Attachment[]
}

export function MessageBubble({ contenu, authorType, createdAt, attachments }: MessageBubbleProps) {
  const isOwner = authorType === "OWNER"

  return (
    <div className={`flex ${isOwner ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] space-y-1 flex flex-col ${isOwner ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwner
              ? "bg-olivier-50 text-garrigue-900 rounded-br-sm"
              : "bg-garrigue-50 text-garrigue-900 rounded-bl-sm"
          }`}
        >
          {contenu}
        </div>
        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5 text-xs text-garrigue-400">
                <FileText size={12} />
                <span className="truncate max-w-[200px]">{a.nom}</span>
              </div>
            ))}
          </div>
        )}
        <p className={`text-xs text-garrigue-300 ${isOwner ? "text-right" : ""}`}>
          {format(createdAt, "d MMM à HH:mm", { locale: fr })}
        </p>
      </div>
    </div>
  )
}
