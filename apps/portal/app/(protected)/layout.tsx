import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PortalHeader } from "@/components/layout/portal-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { getOwnerUnreadCount } from "@/lib/dal/messagerie"
import { getPendingDevisForOwner } from "@/lib/dal/travaux"

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.mfaRequired && !session.user.mfaVerified) redirect("/login/mfa")

  const ownerId = session.user.ownerId ?? null

  const [unreadCount, pendingDevis] = await Promise.all([
    ownerId ? getOwnerUnreadCount(ownerId) : Promise.resolve(0),
    ownerId ? getPendingDevisForOwner(ownerId) : Promise.resolve([]),
  ])

  return (
    <div className="flex min-h-screen bg-calcaire-100">
      <SidebarNav
        userName={session.user.name ?? "Propriétaire"}
        userEmail={session.user.email ?? ""}
        unreadCount={unreadCount}
        pendingDevisCount={pendingDevis.length}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-safe-nav lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
