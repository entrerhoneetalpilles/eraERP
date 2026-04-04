import { NextResponse } from "next/server"
import { db } from "@conciergerie/db"

export async function GET() {
  const owners = await db.owner.findMany({
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  })
  return NextResponse.json(owners)
}
