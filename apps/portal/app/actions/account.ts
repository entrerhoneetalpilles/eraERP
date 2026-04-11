"use server"

import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// ── Change password ──────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export async function changePasswordAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, success: false }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  })
  if (!ownerUser) return { error: "Compte introuvable", success: false }

  const valid = await bcrypt.compare(parsed.data.currentPassword, ownerUser.password_hash)
  if (!valid) return { error: "Mot de passe actuel incorrect", success: false }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { password_hash: newHash },
  })

  return { error: null, success: true }
}

// ── Generate MFA secret ──────────────────────────────────────────

export async function generateMfaSecretAction(): Promise<{
  secret: string | null
  otpauthUrl: string | null
  error: string | null
}> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { secret: null, otpauthUrl: null, error: "Session expirée" }
  }

  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(
    session.user.email,
    "ERA Entre Rhône et Alpilles",
    secret
  )

  try {
    // Temporarily store the pending secret (not activated yet)
    await db.ownerUser.update({
      where: { id: session.user.id },
      data: { mfa_secret: secret }, // saved but mfa_active stays false until verified
    })
    return { secret, otpauthUrl, error: null }
  } catch {
    return { secret: null, otpauthUrl: null, error: "Erreur lors de la sauvegarde du secret" }
  }
}

// ── Enable MFA (verify + activate) ──────────────────────────────

export async function enableMfaAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const code = (formData.get("code") as string)?.trim()
  if (!code || !/^\d{6}$/.test(code)) {
    return { error: "Code invalide (6 chiffres requis)", success: false }
  }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { mfa_secret: true },
  })
  if (!ownerUser?.mfa_secret) {
    return { error: "Veuillez d'abord générer un secret", success: false }
  }

  const isValid = authenticator.check(code, ownerUser.mfa_secret)
  if (!isValid) return { error: "Code incorrect ou expiré", success: false }

  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { mfa_active: true },
  })

  revalidatePath("/parametres")
  return { error: null, success: true }
}

// ── Disable MFA ──────────────────────────────────────────────────

export async function disableMfaAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Session expirée", success: false }

  const password = formData.get("password") as string
  if (!password) return { error: "Mot de passe requis pour désactiver le MFA", success: false }

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  })
  if (!ownerUser) return { error: "Compte introuvable", success: false }

  const valid = await bcrypt.compare(password, ownerUser.password_hash)
  if (!valid) return { error: "Mot de passe incorrect", success: false }

  await db.ownerUser.update({
    where: { id: session.user.id },
    data: { mfa_active: false, mfa_secret: null },
  })

  revalidatePath("/parametres")
  return { error: null, success: true }
}
