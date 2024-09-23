// middleware.ts
import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "./env";
import { rateLimitConfig, type RateLimitKey } from "@/lib/rate-limit-config";

async function checkRateLimit(identifier: string, key: RateLimitKey): Promise<boolean> {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/rate-limit-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, key }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return false; // Rate limit exceeded
    }
    throw new Error("Failed to check rate limit");
  }

  return true; // Rate limit not exceeded
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Rate limiting for configured paths
  const path = request.nextUrl.pathname;
  const rateLimitKey = Object.keys(rateLimitConfig).find(
    (key) => rateLimitConfig[key]?.path === path
  );

  if (rateLimitKey && request.method === "POST") {
    const ip = request.ip ?? "127.0.0.1";
    const isAllowed = await checkRateLimit(ip, rateLimitKey);
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Rate limit check passed for ${rateLimitKey}:${ip}`);
    return NextResponse.next();
  }

  if (request.method === "GET") {
    return NextResponse.next();
  }
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return NextResponse.next();
}

// Updated config without spread operator
export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)",

    // Rate limiting for configured paths see /lib/rate-limit-config.ts
    // "/login",
    // "/login/verify",
  ],
};