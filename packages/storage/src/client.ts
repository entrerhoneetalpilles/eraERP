import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Upload } from "@aws-sdk/lib-storage"

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true, // Requis pour MinIO
})

const BUCKET = process.env.S3_BUCKET ?? "conciergerie-dev"
const ENDPOINT = process.env.S3_ENDPOINT ?? "http://localhost:9000"
// URL publique optionnelle (ex: R2 public bucket, CDN custom domain)
// Si défini, les fichiers sont servis via cette URL sans presigning
const PUBLIC_BASE = process.env.S3_PUBLIC_URL ?? null

interface StorageKeyOptions {
  entityType: string
  entityId: string
  folder?: string
  fileName: string
}

export function buildStorageKey({
  entityType,
  entityId,
  folder,
  fileName,
}: StorageKeyOptions): string {
  const parts = [entityType, entityId]
  if (folder) parts.push(folder)
  parts.push(fileName)
  return parts.join("/")
}

export function getPublicUrl(key: string): string {
  if (PUBLIC_BASE) return `${PUBLIC_BASE}/${key}`
  return `${ENDPOINT}/${BUCKET}/${key}`
}

export async function uploadFile({
  key,
  body,
  contentType,
}: {
  key: string
  body: Buffer | Uint8Array | Blob | ReadableStream
  contentType: string
}): Promise<string> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  })

  await upload.done()
  return getPublicUrl(key)
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

/**
 * Extract the storage key from a url_storage value.
 *
 * Handles three formats produced in the wild:
 *  1. MinIO path-style:  http://endpoint/bucket/key  → key
 *  2. R2 path-style:     https://account.r2.../bucket/key → key
 *  3. Double-bucket bug: https://account.r2.../bucket/bucket/key → key
 *     (caused by S3_ENDPOINT including the bucket path)
 *
 * Uses `lastIndexOf("/${BUCKET}/")` so a single pass resolves all cases.
 */
export function extractStorageKey(urlStorage: string): string {
  const marker = `/${BUCKET}/`
  // Try parsing as URL first; fall back to treating the value as a raw path
  let pathname: string
  try {
    pathname = new URL(urlStorage).pathname
  } catch {
    pathname = urlStorage
  }
  const idx = pathname.lastIndexOf(marker)
  if (idx !== -1) return pathname.slice(idx + marker.length)
  // Fallback: strip one leading path segment (original behaviour)
  return pathname.replace(/^\/[^/]+\//, "")
}
