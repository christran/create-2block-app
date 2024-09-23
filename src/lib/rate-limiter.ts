import { Redis } from "ioredis";
import { RedisStore, SlideLimiter } from "slide-limiter";
import { NextResponse } from "next/server";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Create a RedisStore instance
const store = new RedisStore(redis);

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class Ratelimit {
  private limiter: SlideLimiter;
  private prefix: string;
  private analytics: boolean;

  constructor(config: {
    limiter: { windowMs: number; maxLimit: number };
    prefix?: string;
    analytics?: boolean;
  }) {
    // Lazy initialize Redis and RedisStore
    // const redis = new Redis(process.env.REDIS_URL!);
    // const store = new RedisStore(redis);

    this.limiter = new SlideLimiter(store, {
      windowMs: config.limiter.windowMs,
      maxLimit: config.limiter.maxLimit,
    });
    this.prefix = config.prefix ?? "default";
    this.analytics = config.analytics ?? false;
  }

  static slidingWindow(maxLimit: number, duration: string): { windowMs: number; maxLimit: number } {
    const durationMs = parseDuration(duration);
    return { windowMs: durationMs, maxLimit: maxLimit + 1};
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const remaining = await this.limiter.hit(this.prefix, identifier);
    const success = remaining > 0;
    const reset = Math.floor(Date.now() / 1000) + this.limiter.options.windowMs / 1000;

    if (this.analytics) {
      const resetDate = new Date(reset * 1000);
      const formattedReset = formatDate(resetDate);
      console.log(`[Rate Limiter]\nIdentifier: ${this.prefix}:${identifier}\nRemaining: ${remaining}\nReset: ${formattedReset}\nSuccess: ${success}`);
    }

    return {
      success,
      limit: this.limiter.options.maxLimit,
      remaining,
      reset,
    };
  }
}

// Helper function to parse duration string
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([a-zA-Z]+)$/);

  if (!match) {
    throw new Error("Invalid duration format. Use <value><unit> (e.g., 10s).");
  }

  const [, value, unit] = match;
  const numValue = parseInt(value ?? "0", 10);

  switch (unit?.toLowerCase()) {
    case "ms":
      return numValue;
    case "s":
      return numValue * 1000;
    case "m":
      return numValue * 60 * 1000;
    case "h":
      return numValue * 60 * 60 * 1000;
    case "d":
      return numValue * 24 * 60 * 60 * 1000;
    default:
      throw new Error("Invalid duration unit. Use ms, s, m, h, or d.");
  }
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

// Middleware helper
export async function rateLimitMiddleware(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  const result = await limiter.limit(identifier);

  if (!result.success) {
    return new NextResponse(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Success": result.success.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Cache-Control": "no-cache, no-store, max-age=0",
      },
    });
  }

  return null;
}