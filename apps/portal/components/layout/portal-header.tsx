import { auth } from "@/auth"
import { Bell } from "lucide-react"

export async function PortalHeader() {
  const session = await auth()
  const prenom = session?.user?.name?.split(" ")[0] ?? "Propriétaire"

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border flex items-center justify-between px-4 h-14 lg:px-6">
      <span className="font-serif text-lg text-garrigue-900 tracking-wide">ERA</span>
      <span className="text-sm text-garrigue-500 hidden sm:block">
        Bonjour, <span className="text-garrigue-900 font-medium">{prenom}</span>
      </span>
      <button
        aria-label="Notifications"
        className="p-2 rounded-full hover:bg-calcaire-100 transition-colors text-garrigue-500"
      >
        <Bell size={20} />
      </button>
    </header>
  )
}
