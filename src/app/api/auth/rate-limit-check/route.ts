import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";
import { rateLimitConfig, type RateLimitKey } from "@/lib/rate-limit-config";

const limiters: Record<RateLimitKey, Ratelimit> = Object.fromEntries(
  Object.entries(rateLimitConfig).map(([key, config]) => [
    key,
    new Ratelimit({
      limiter: Ratelimit.slidingWindow(config.limit , config.window),
      prefix: `@ratelimit/api_ratelimit_${key}`,
      analytics: true,
    })
  ])
) as Record<RateLimitKey, Ratelimit>;

export async function POST(req: NextRequest) {
  const { identifier, key } = await req.json() as { identifier: string; key: RateLimitKey };

  if (!identifier || !key) {
    return NextResponse.json({ error: "Identifier and key are required" }, { status: 400 });
  }

  const limiter = limiters[key];
  if (!limiter) {
    return NextResponse.json({ error: "Invalid rate limit key" }, { status: 400 });
  }

  const rateLimitResult = await rateLimitMiddleware(limiter, identifier);


  if (rateLimitResult) {
    return NextResponse.json({ 
      error: "Rate limit exceeded. Please try again later." }, 
      { 
        status: 429, 
        headers: {
          "X-RateLimit-Success": rateLimitResult?.headers.get("X-RateLimit-Success") ?? "0",
          "X-RateLimit-Limit": rateLimitResult?.headers.get("X-RateLimit-Limit") ?? "0",
          "X-RateLimit-Remaining": rateLimitResult?.headers.get("X-RateLimit-Remaining") ?? "0",
          "X-RateLimit-Reset": rateLimitResult?.headers.get("X-RateLimit-Reset") ?? "0",
        }
      });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
