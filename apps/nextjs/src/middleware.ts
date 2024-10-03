// middleware.ts
import { verifyRequestOrigin } from "lucia";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";
import { rateLimitConfig, type RateLimitKey } from "@/lib/rate-limit-config";

// Workaround because nextjs middleware doesn't support redis/crypto yet
import { Paths } from "@2block/shared/shared-constants";

// Rate limiting for configured paths see /lib/rate-limit-config.ts
async function checkRateLimit(identifier: string, key: RateLimitKey): Promise<{ success: boolean; limit: string; remaining: string; reset: string; }> {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/rate-limit-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, key }),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 429) {
      return { 
        success: false, 
        limit: response.headers.get("X-RateLimit-Limit") ?? "0", 
        remaining: response.headers.get("X-RateLimit-Remaining") ?? "0", 
        reset: response.headers.get("X-RateLimit-Reset") ?? "0"
      };
    }
    throw new Error("Failed to check rate limit");
  }

  return { 
    success: true, 
    limit: response.headers.get("X-RateLimit-Limit") ?? "0", 
    remaining: response.headers.get("X-RateLimit-Remaining") ?? "0", 
    reset: response.headers.get("X-RateLimit-Reset") ?? "0" 
  };
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Rate limiting for configured paths
  const path = req.nextUrl.pathname;
  const rateLimitKey = Object.keys(rateLimitConfig).find(
    (key) => rateLimitConfig[key]?.path === path
  );

  // Only check rate limit if path is configured see /lib/rate-limit-config.ts
  if (rateLimitKey) {
    const ip = req.headers.get("CF-Connecting-IP") ?? req.headers.get("X-Forwarded-For")?.split(",")[0] ?? req.headers.get("X-Real-IP") ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await checkRateLimit(ip, rateLimitKey);
    
    const response = success 
      ? NextResponse.next() 
      : NextResponse.redirect(new URL(Paths.Blocked, req.url));

    response.headers.set("X-RateLimit-Success", success.toString());
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    response.headers.set("Cache-Control", "no-cache, no-store, max-age=0");

    return response;
  }

  if (req.nextUrl.pathname === "/api/send") {
    const response = NextResponse.rewrite(new URL("https://analytics.2block.co/api/send", req.url));
    
    const cfHeaders = [
      "CF-IPCity",
      "CF-IPCountry",
      "CF-IPContinent",
      "CF-IPLongitude",
      "CF-IPLatitude",
      "CF-Region",
      "CF-RegionCode",
      "CF-MetroCode",
      "CF-PostalCode",
      "CF-Timezone"
    ];

    cfHeaders.forEach(header => {
      const value = req.headers.get(header);
      if (value) {
        response.headers.set(header, value);
      }
    });

    return response;
  }

  if (req.method === "GET") {
    return NextResponse.next();
  }

  const originHeader = req.headers.get("Origin");
  const hostHeader = req.headers.get("Host");
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
    "/census.js",
    "/api/send",
    // Rate limiting for configured paths see /lib/rate-limit-config.ts
    // "/login",
    // "/api/upload/cleanup",
    // "/login/verify",
  ],
};