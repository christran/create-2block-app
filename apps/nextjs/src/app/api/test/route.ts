export const dynamic = "force-dynamic"; // prevents the Redis client from trying to connect during the build.

import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";
import { getClientIP } from "@/lib/utils";

// Create a rate limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "5s"),
  prefix: "@ratelimit/api_ratelimit_test",
  analytics: true,
});

export async function GET(req: NextRequest) {
  // Use a constant string to limit all requests with a single ratelimit
  // Or use a userID, apiKey or ip address for individual limits.

  // console.log("CF-Connecting-IP", req.headers.get("CF-Connecting-IP"));
  // console.log("Client_IP", req.headers.get("Client_IP"));
  // console.log("X-Forwarded-For", req.headers.get("X-Forwarded-For"));
  // console.log("X-Real-IP", req.headers.get("X-Real-IP"));

  const identifier = getClientIP(req);
  const rateLimitResult = await rateLimitMiddleware(apiLimiter, identifier);

  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Your API logic here
  const response = NextResponse.json({ message: `Hello, ${identifier}` });

  // Have to set cache control here because "force-dynamic" isn't enough
  response.headers.set("Cache-Control", "no-cache, no-store, max-age=0");

  return response;
}