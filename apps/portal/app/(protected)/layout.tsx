import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function PortalProtectedLayout({
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

  return <>{children}</>
}
