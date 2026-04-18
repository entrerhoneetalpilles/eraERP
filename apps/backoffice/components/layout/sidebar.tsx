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
  Wallet,
  Receipt,
  Wrench,
  HardHat,
  SprayCan,
  FileBarChart2,
  KeyRound,
  Mail,
  FolderOpen,
  ClipboardList,
  LayoutTemplate,
  Star,
  ShoppingBag,
  Bell,
  BookOpen,
  Landmark,
  ClipboardCheck,
  Package,
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
      { href: "/etats-des-lieux", label: "États des lieux", icon: ClipboardCheck },
      { href: "/voyageurs", label: "Voyageurs", icon: UserCheck },
      { href: "/avis", label: "Avis voyageurs", icon: Star },
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
      { href: "/comptabilite", label: "Honoraires", icon: Wallet },
      { href: "/facturation", label: "Facturation", icon: Receipt },
      { href: "/crg", label: "CRG", icon: FileBarChart2 },
      { href: "/journal-comptable", label: "Journal comptable", icon: BookOpen },
      { href: "/rapprochement", label: "Rapprochement", icon: Landmark },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/prestataires", label: "Prestataires", icon: HardHat },
      { href: "/travaux", label: "Travaux", icon: Wrench },
      { href: "/devis", label: "Devis", icon: ClipboardList },
      { href: "/catalogue", label: "Catalogue services", icon: ShoppingBag },
      { href: "/commandes-services", label: "Commandes services", icon: Package },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/modeles", label: "Modèles PDF", icon: LayoutTemplate },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 hidden md:flex flex-col bg-[hsl(var(--sidebar-bg))] border-r border-border">
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border shrink-0">
        <div className="w-6 h-6 rounded-sm bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
          <KeyRound className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[hsl(var(--sidebar-text-active))] font-semibold text-sm leading-tight truncate">
            Entre Rhône et Alpilles
          </p>
          <p className="text-[hsl(var(--sidebar-label))] text-[11px] leading-tight">Back-office</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
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
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-100 cursor-pointer",
                      active
                        ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-text-active))] font-medium"
                        : "text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text-active))]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        active ? "opacity-100" : "opacity-70"
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: Admin */}
      <div className="px-2 py-2 border-t border-border shrink-0">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 cursor-pointer",
            pathname.startsWith("/admin")
              ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-text-active))] font-medium"
              : "text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text-active))]"
          )}
        >
          <Settings
            className={cn(
              "w-4 h-4 shrink-0",
              pathname.startsWith("/admin") ? "opacity-100" : "opacity-70"
            )}
          />
          <span>Administration</span>
        </Link>
      </div>
    </aside>
  )
}