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
