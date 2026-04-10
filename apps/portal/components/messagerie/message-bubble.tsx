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
  authorName?: string
}

export function MessageBubble({ contenu, authorType, createdAt, attachments, authorName }: MessageBubbleProps) {
  const isOwner = authorType === "OWNER"
  const time = format(createdAt, "HH:mm", { locale: fr })

  return (
    <div className={`flex flex-col gap-1 max-w-[80%] ${isOwner ? "items-end self-end" : "items-start self-start"}`}>
      {!isOwner && authorName && (
        <p className="text-[10px] text-garrigue-400 font-medium px-1">{authorName}</p>
      )}
      <div
        className={`px-4 py-3 text-sm leading-relaxed ${
          isOwner
            ? "bg-garrigue-900 text-white rounded-2xl rounded-tr-sm"
            : "bg-calcaire-200 text-garrigue-900 rounded-2xl rounded-tl-sm"
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
      <p className={`text-[10px] text-garrigue-400 px-1 ${isOwner ? "text-right" : "text-left"}`}>
        {time}
      </p>
    </div>
  )
}
