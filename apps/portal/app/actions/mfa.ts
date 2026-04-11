"use server"

import { auth, unstable_update } from "@/auth"
import { db } from "@conciergerie/db"
import { authenticator } from "otplib"
import { redirect } from "next/navigation"

export async function verifyMfaAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const code = (formData.get("code") as string)?.trim().replace(/\s/g, "")
  if (!code || !/^\d{6}$/.test(code)) {
    return { error: "Le code doit contenir 6 chiffres" }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { mfa_secret: true, mfa_active: true },
  })

  if (!ownerUser?.mfa_secret || !ownerUser.mfa_active) {
    return { error: "MFA non configuré sur ce compte" }
  }

  const isValid = authenticator.check(code, ownerUser.mfa_secret)
  if (!isValid) {
    return { error: "Code incorrect ou expiré" }
  }

  await unstable_update({ user: { mfaVerified: true } })
  redirect("/dashboard")
}
