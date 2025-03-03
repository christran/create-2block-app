// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";
import { rateLimitConfig, type RateLimitKey } from "@/lib/rate-limit-config";
import { Paths } from "@2block/shared/shared-constants";
import { getClientIP } from "./lib/utils";
import { verifyRequestOrigin } from "oslo/request";

// Workaround because nextjs middleware doesn't support redis/crypto yet

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
    const ip = getClientIP(req);
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

  if (req.method === "GET") {
    const response = NextResponse.next();
    const token = req.cookies.get("session")?.value ?? null;
    if (token !== null) {
			// Only extend cookie expiration on GET requests since we can be sure
			// a new session wasn't set when handling the request.
			response.cookies.set("session", token, {
        httpOnly: true,
				path: "/",
				maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
				sameSite: "lax"
			});
		}
		return response;
	}

  // CSRF Protection
	const originHeader = req.headers.get("Origin");
	// NOTE: You may need to use `X-Forwarded-Host` instead
	const hostHeader = req.headers.get("Host");

	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403
		});
	}

	let origin: URL;

	try {
		origin = new URL(originHeader);
	} catch {
		return new NextResponse(null, {
			status: 403
		});
	}

	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403
		});
	}

	return NextResponse.next();
}

// Updated config without spread operator
export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)",
    // "/api/send",
    // Rate limiting for configured paths see /lib/rate-limit-config.ts
    // "/login",
    // "/api/upload/cleanup",
    // "/login/verify",
  ],
};