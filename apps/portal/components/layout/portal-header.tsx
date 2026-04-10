import { auth } from "@/auth"
import { Bell, Settings } from "lucide-react"
import Link from "next/link"

export async function PortalHeader() {
  const session = await auth()
  const prenom = session?.user?.name?.split(" ")[0] ?? "Propriétaire"

  return (
    <header className="sticky top-0 z-40 bg-calcaire-50/90 backdrop-blur-xl border-b border-argile-200/60 flex items-center justify-between px-5 h-14 lg:hidden">
      {/* ERA monogram */}
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-xl font-semibold text-garrigue-900 tracking-[0.08em]">
          ERA
        </span>
        <span className="hidden sm:block text-xs text-garrigue-400 tracking-wide">
          Espace Propriétaire
        </span>
      </div>

      {/* Greeting (center, sm+) */}
      <span className="absolute left-1/2 -translate-x-1/2 text-sm text-garrigue-500 hidden sm:block">
        Bonjour,{" "}
        <span className="text-garrigue-900 font-medium">{prenom}</span>
      </span>

      {/* Right: settings + bell */}
      <div className="flex items-center gap-1">
        <Link
          href="/parametres"
          aria-label="Paramètres"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-calcaire-200 transition-fast text-garrigue-500 hover:text-garrigue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-olivier-500"
        >
          <Settings size={18} strokeWidth={1.8} />
        </Link>
        <button
          aria-label="Notifications"
          className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-calcaire-200 transition-fast text-garrigue-500 hover:text-garrigue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-olivier-500"
        >
          <Bell size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}
