import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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
      <main className="pl-64 pt-14 min-h-screen">
        <div className="p-6 max-w-[1600px]">{children}</div>
      </main>
    </div>
  )
}
