import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"
import { authenticator } from "otplib"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { code } = await request.json()
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code manquant" }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mfa_secret: true },
  })

  if (!user?.mfa_secret) {
    return NextResponse.json({ error: "MFA non configuré" }, { status: 400 })
  }

  const isValid = authenticator.verify({
    token: code,
    secret: user.mfa_secret,
  })

  if (!isValid) {
    return NextResponse.json({ error: "Code invalide" }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
