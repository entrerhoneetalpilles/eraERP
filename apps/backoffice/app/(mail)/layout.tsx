import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function MailLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
