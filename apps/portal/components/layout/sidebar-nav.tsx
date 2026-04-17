"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileText,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
  ClipboardList,
  CalendarCheck,
  Wrench,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil", badgeKey: null },
  { href: "/biens", icon: Building2, label: "Mes biens", badgeKey: null },
  { href: "/reservations", icon: CalendarCheck, label: "Réservations", badgeKey: null },
  { href: "/revenus", icon: TrendingUp, label: "Revenus", badgeKey: null },
  { href: "/travaux", icon: Wrench, label: "Travaux", badgeKey: null },
  { href: "/documents", icon: FileText, label: "Documents", badgeKey: null },
  { href: "/messagerie", icon: MessageCircle, label: "Messages", badgeKey: "unread" },
  { href: "/devis", icon: ClipboardList, label: "Devis", badgeKey: "devis" },
  { href: "/planning", icon: Calendar, label: "Planning", badgeKey: null },
  { href: "/parametres", icon: Settings, label: "Paramètres", badgeKey: null },
] as const

interface SidebarNavProps {
  userName: string
  userEmail: string
  unreadCount: number
  pendingDevisCount?: number
}

export function SidebarNav({ userName, userEmail, unreadCount, pendingDevisCount = 0 }: SidebarNavProps) {
  const pathname = usePathname()
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

  const badges: Record<string, number> = {
    unread: unreadCount,
    devis: pendingDevisCount,
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-argile-200/60 min-h-screen">
      {/* Logo area */}
      <div className="px-7 py-8 border-b border-argile-200/40">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-2xl font-semibold text-garrigue-900 tracking-[0.06em]">
            ERA
          </span>
        </div>
        <p className="text-xs text-garrigue-400 mt-1 font-light tracking-wide italic">
          Entre Rhône et Alpilles
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 px-4 py-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label, badgeKey }) => {
            const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0
            // Hide devis nav item if no pending devis
            if (href === "/devis" && pendingDevisCount === 0) return null
            const active = pathname === href || pathname.startsWith(href + "/")
            const showBadge = badgeCount > 0
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-fast cursor-pointer group relative ${
                    active
                      ? "bg-garrigue-900 text-white shadow-luxury"
                      : "text-garrigue-500 hover:bg-calcaire-100 hover:text-garrigue-900"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2 : 1.6}
                    className="shrink-0 transition-fast"
                  />
                  <span className="tracking-wide flex-1">{label}</span>
                  {showBadge ? (
                    <span className="ml-auto text-[10px] font-bold text-white bg-or-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 tabular-nums">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  ) : active ? (
                    <span className="ml-auto w-1.5 h-1.5 bg-or-400 rounded-full" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User card + logout */}
      <div className="px-4 pb-5 pt-4 border-t border-argile-200/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          {/* Avatar initials */}
          <div className="w-8 h-8 rounded-full bg-garrigue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-garrigue-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-garrigue-900 truncate">{userName}</p>
            <p className="text-xs text-garrigue-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-garrigue-500 hover:bg-red-50 hover:text-red-600 transition-fast cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.6} className="shrink-0" />
          <span className="tracking-wide">Se déconnecter</span>
        </button>
      </div>
    </aside>
  )
}
