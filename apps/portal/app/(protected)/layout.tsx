import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PortalHeader } from "@/components/layout/portal-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarNav } from "@/components/layout/sidebar-nav"

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.mfaRequired && !session.user.mfaVerified) redirect("/login/mfa")

  return (
    <div className="flex min-h-screen bg-calcaire-100">
      <SidebarNav />
      <div className="flex flex-col flex-1 min-w-0">
        <PortalHeader />
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
