"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, TrendingUp, FileText, MessageCircle } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/biens", icon: Building2, label: "Biens" },
  { href: "/revenus", icon: TrendingUp, label: "Revenus" },
  { href: "/documents", icon: FileText, label: "Docs" },
  { href: "/messagerie", icon: MessageCircle, label: "Messages" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-4 inset-x-4 z-40 lg:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="flex h-16 bg-white/95 backdrop-blur-xl rounded-2xl shadow-luxury-card border border-argile-200/60 overflow-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-fast cursor-pointer relative ${
                  active ? "text-or-500" : "text-garrigue-400 hover:text-garrigue-700"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.6}
                  className="transition-fast"
                />
                <span className={`text-[10px] font-medium tracking-wide transition-fast ${
                  active ? "text-or-500" : "text-garrigue-400"
                }`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-or-400 rounded-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
