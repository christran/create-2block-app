import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";

// Create a limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(2, "5 s"),
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
  return NextResponse.json({ message: "Hello, World!" });
}