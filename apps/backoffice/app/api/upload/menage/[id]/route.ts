import { NextRequest, NextResponse } from "next/server"
import { uploadFile, buildStorageKey, getPublicUrl } from "@conciergerie/storage"
import { db } from "@conciergerie/db"
import { auth } from "@/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })

  const task = await db.cleaningTask.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${Date.now()}.${ext}`
  const key = buildStorageKey({ entityType: "photos", entityId: `menage/${params.id}`, fileName })

  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadFile({ key, body: buffer, contentType: file.type })
  const url = getPublicUrl(key)

  await db.cleaningTask.update({
    where: { id: params.id },
    data: { photos: { push: url } },
  })

  return NextResponse.json({ url })
}
