import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.mfaRequired && !session.user.mfaVerified) {
    redirect("/login/mfa")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <MobileNav />
      <main className="md:pl-64 pt-14 pb-16 md:pb-0 min-h-screen">
        <div className="p-4 md:p-6 max-w-[1600px]">{children}</div>
      </main>
    </div>
  )
}

