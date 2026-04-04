import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req / 10s par IP
      analytics: false,
    })
  : null

export function getRateLimitKey(ip: string | null, route: string): string {
  return `rate:${ip ?? "unknown"}:${route}`
}

export async function checkRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!ratelimit) return null // Pas de rate limit en dev sans Upstash

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    "unknown"

  const key = getRateLimitKey(ip, request.nextUrl.pathname)
  const { success, limit, reset, remaining } = await ratelimit.limit(key)

  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null
}
