import { NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";

// Create a rate limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  prefix: "@ratelimit/api_ratelimit_requestMagicLink",
  analytics: true,
});


export async function POST(request: NextRequest) {
  const identifier = request.ip ?? "127.0.0.1";
  const rateLimitResult = await rateLimitMiddleware(apiLimiter, identifier);

  if (rateLimitResult) {
    return {
      error: "You're requesting too many magic links. Please try again later."
    };
  }
}