"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CalendarDays,
  UserCheck,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@conciergerie/ui"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/proprietaires", label: "Propriétaires", icon: Users },
  { href: "/biens", label: "Biens", icon: Building2 },
  { href: "/mandats", label: "Mandats", icon: FileText },
  { href: "/reservations", label: "Réservations", icon: CalendarDays },
  { href: "/voyageurs", label: "Voyageurs", icon: UserCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-garrigue-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-garrigue-700">
        <div>
          <p className="text-calcaire-100 font-semibold text-sm leading-tight">
            Entre Rhône et Alpilles
          </p>
          <p className="text-garrigue-400 text-xs">Conciergerie</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-garrigue-700 text-calcaire-100"
                  : "text-garrigue-300 hover:bg-garrigue-800 hover:text-calcaire-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-garrigue-700">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-garrigue-400 hover:text-calcaire-100 hover:bg-garrigue-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Administration</span>
        </Link>
      </div>
    </aside>
  )
}
