import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@conciergerie/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const owners = await db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })
  return NextResponse.json(owners)
}

