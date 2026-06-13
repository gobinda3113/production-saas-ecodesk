import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { prisma } from "../lib/prisma.js";

interface SessionUser {
  userId: string;
  clientId: string | null;
  role: "SUPER_ADMIN" | "CLIENT";
  email: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: SessionUser;
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, "session_token");
  if (!sessionToken) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "No session", requestId: crypto.randomUUID() } }, 401);
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: { include: { userRoles: { include: { role: true } } } } },
  });

  if (!session || session.expires < new Date()) {
    return c.json({ error: { code: "SESSION_EXPIRED", message: "Session expired", requestId: crypto.randomUUID() } }, 401);
  }

  const isAdmin = session.user.userRoles.some((ur) => ur.role.code === "SUPER_ADMIN");
  c.set("user", {
    userId: session.user.id,
    clientId: session.user.clientId,
    role: isAdmin ? "SUPER_ADMIN" : "CLIENT",
    email: session.user.email,
  });

  await next();
});

export const requireRole = (...roles: string[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: { code: "FORBIDDEN", message: "Insufficient permissions", requestId: crypto.randomUUID() } }, 403);
    }
    await next();
  });
