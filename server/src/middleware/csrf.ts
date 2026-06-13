import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

export const requireCsrf = createMiddleware(async (c, next) => {
  if (c.req.method === "GET" || c.req.method === "HEAD") {
    return next();
  }

  const headerToken = c.req.header("x-csrf-token");
  const cookieToken = getCookie(c, "csrf_token");

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return c.json({ error: { code: "CSRF_FAILED", message: "Invalid CSRF token", requestId: crypto.randomUUID() } }, 403);
  }

  await next();
});
