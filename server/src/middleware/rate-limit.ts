import { createMiddleware } from "hono/factory";
import { redis } from "../lib/redis.js";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const defaults: Record<string, RateLimitConfig> = {
  default: { windowMs: 60_000, max: 120 },
  strict: { windowMs: 60_000, max: 10 },
  admin: { windowMs: 60_000, max: 60 },
};

export function rateLimit(profile: keyof typeof defaults = "default") {
  return createMiddleware(async (c, next) => {
    const config = defaults[profile] || defaults.default;
    const key = `ratelimit:${c.req.path}:${c.req.header("x-forwarded-for") || "unknown"}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.pexpire(key, config.windowMs);
    }

    if (current > config.max) {
      return c.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests", requestId: crypto.randomUUID() } },
        429,
        { "Retry-After": String(Math.ceil(config.windowMs / 1000)) }
      );
    }

    await next();
  });
}
