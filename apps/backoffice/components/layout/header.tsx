import Link from "next/link"
import { auth, signOut } from "@/auth"
import { LogOut, Bell } from "lucide-react"
import { Button } from "@conciergerie/ui"
import { getUnreadNotificationsCount } from "@/lib/dal/notifications"

function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatRole(role?: string | null): string {
  if (!role) return ""
  const labels: Record<string, string> = {
    ADMIN: "Administrateur",
    DIRECTION: "Direction",
    GESTIONNAIRE: "Gestionnaire",
    COMPTABLE: "Comptable",
    CHARGE_SERVICES: "Chargé de services",
    RESPONSABLE_TRAVAUX: "Responsable travaux",
  }
  return labels[role] ?? role
}

export async function Header() {
  const session = await auth()
  const unreadCount = session?.user?.id
    ? await getUnreadNotificationsCount(session.user.id)
    : 0

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* Left: current date */}
      <p className="text-sm text-muted-foreground hidden sm:block">{todayFormatted}</p>

      {/* Right: user */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Bell */}
        <Link href="/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white bg-primary rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
          <span className="text-white text-[11px] font-semibold">
            {getInitials(session?.user?.name)}
          </span>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-tight">
            {session?.user?.name}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">{formatRole(session?.user?.role)}</p>
        </div>

        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground cursor-pointer h-7 w-7 p-0"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </header>
  )
}
