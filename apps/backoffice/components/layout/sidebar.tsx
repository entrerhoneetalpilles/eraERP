"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CalendarDays,
  CalendarRange,
  UserCheck,
  Settings,
  ChevronRight,
  Wallet,
  Receipt,
  Wrench,
  HardHat,
  SprayCan,
  FileBarChart2,
} from "lucide-react"
import { cn } from "@conciergerie/ui"

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    ],
  },
  {
    label: "Référentiels",
    items: [
      { href: "/proprietaires", label: "Propriétaires", icon: Users },
      { href: "/biens", label: "Biens", icon: Building2 },
      { href: "/mandats", label: "Mandats", icon: FileText },
    ],
  },
  {
    label: "Activité",
    items: [
      { href: "/reservations", label: "Réservations", icon: CalendarDays },
      { href: "/planning", label: "Planning", icon: CalendarRange },
      { href: "/menage", label: "Ménage", icon: SprayCan },
      { href: "/voyageurs", label: "Voyageurs", icon: UserCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/comptabilite", label: "Comptabilité", icon: Wallet },
      { href: "/facturation", label: "Facturation", icon: Receipt },
      { href: "/crg", label: "CRG", icon: FileBarChart2 },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/prestataires", label: "Prestataires", icon: HardHat },
      { href: "/travaux", label: "Travaux", icon: Wrench },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            Entre Rhône et Alpilles
          </p>
          <p className="text-slate-400 text-xs">Conciergerie — Back-office</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? "main"}>
            {section.label && (
              <p className="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname.startsWith("/admin")
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Administration</span>
        </Link>
      </div>
    </aside>
  )
}
