export const dynamic = "force-dynamic"; // prevents the Redis client from trying to connect during the build.

import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";

// Create a rate limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "5s"),
  prefix: "@ratelimit/api_ratelimit_test",
  analytics: true,
});

export async function GET(req: NextRequest) {
  // Use a constant string to limit all requests with a single ratelimit
  // Or use a userID, apiKey or ip address for individual limits.
  const identifier = req.ip ?? "127.0.0.1";
  const rateLimitResult = await rateLimitMiddleware(apiLimiter, identifier);

  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Your API logic here
  const response = NextResponse.json({ message: `Hello, ${identifier}` });
  // response.headers.set("Cache-Control", "public, no-cache, no-store, max-age=0");

  return response;
}