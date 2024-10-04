import { NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";
import { getClientIP } from "@/lib/utils";

// Create a rate limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "10s"),
  prefix: "@ratelimit/api_ratelimit_requestMagicLink",
  analytics: true,
});


export async function POST(req: NextRequest) {
  const identifier = getClientIP(req);
  const rateLimitResult = await rateLimitMiddleware(apiLimiter, identifier);

  if (rateLimitResult) {
    return {
      error: "You're requesting too many magic links. Please try again later."
    };
  }
}