"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  SprayCan,
  Menu,
  X,
  Users,
  Building2,
  FileText,
  UserCheck,
  Mail,
  Wallet,
  Receipt,
  FileBarChart2,
  HardHat,
  Wrench,
  Settings,
  KeyRound,
  FolderOpen,
  ClipboardList,
} from "lucide-react"
import { cn } from "@conciergerie/ui"

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/reservations", label: "Réservations", icon: CalendarDays },
  { href: "/planning", label: "Planning", icon: CalendarRange },
  { href: "/menage", label: "Ménage", icon: SprayCan },
]

const DRAWER_SECTIONS = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard }],
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
    label: "Communication",
    items: [
      { href: "/mails", label: "Messagerie", icon: Mail, newTab: true },
      { href: "/documents", label: "Documents", icon: FolderOpen },
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
      { href: "/devis", label: "Devis", icon: ClipboardList },
    ],
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Barre inférieure ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card border-t border-border safe-area-bottom">
        <div className="flex items-stretch h-16">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Bouton Menu */}
          <button
            onClick={() => setOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* ── Tiroir ── */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Panneau */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-[hsl(var(--sidebar-bg))] overflow-y-auto">
            {/* En-tête tiroir */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-sm bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
                  <KeyRound className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[hsl(var(--sidebar-text-active))] font-semibold text-sm truncate">
                  Entre Rhône et Alpilles
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-3 overflow-y-auto">
              {DRAWER_SECTIONS.map((section) => (
                <div key={section.label ?? "main"} className="mb-1">
                  {section.label && (
                    <p className="text-[10px] font-medium uppercase tracking-widest text-[hsl(var(--sidebar-label))] px-3 py-1 mt-4">
                      {section.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map(({ href, label, icon: Icon, newTab }: { href: string; label: string; icon: React.ElementType; newTab?: boolean }) => {
                      const active =
                        href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(href)
                      return (
                        <Link
                          key={href}
                          href={href}
                          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                            active
                              ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-text-active))] font-medium"
                              : "text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]"
                          )}
                        >
                          <Icon className={cn("w-4 h-4 shrink-0", active ? "opacity-100" : "opacity-70")} />
                          <span>{label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer Admin */}
            <div className="px-2 py-2 border-t border-border shrink-0">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-text-active))] font-medium"
                    : "text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]"
                )}
              >
                <Settings className="w-4 h-4 shrink-0 opacity-70" />
                <span>Administration</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
