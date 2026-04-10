"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileText,
  MessageCircle,
  Calendar,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Mes biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
  { href: "/planning", icon: Calendar, label: "Planning" },
]

export function SidebarNav() {
  const pathname = usePathname()

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
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
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
                  <span className="tracking-wide">{label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 bg-or-400 rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom divider */}
      <div className="px-7 pb-6 pt-4 border-t border-argile-200/40">
        <p className="text-xs text-garrigue-400/60 tracking-wider uppercase">
          Espace Propriétaire
        </p>
      </div>
    </aside>
  )
}
