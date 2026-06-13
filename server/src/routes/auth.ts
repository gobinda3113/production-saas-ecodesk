import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { hash, compare } from "bcryptjs";

const router = new Hono();

const LoginBody = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128).regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, "Password must contain uppercase, lowercase, and a number"),
  csrfToken: z.string().min(32),
});

router.post("/login", rateLimit("strict"), async (c) => {
  const body = await c.req.json();
  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", requestId: crypto.randomUUID(), fieldErrors: parsed.error.flatten().fieldErrors } }, 400);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, include: { userRoles: { include: { role: true } } } });

  if (!user || !user.passwordHash) {
    return c.json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password", requestId: crypto.randomUUID() } }, 401);
  }

  const { compare } = await import("bcryptjs");
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password", requestId: crypto.randomUUID() } }, 401);
  }

  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  setCookie(c, "session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    expires,
  });

  const isAdmin = user.userRoles.some((ur) => ur.role.code === "SUPER_ADMIN");

  return c.json({
    user: { id: user.id, email: user.email, name: user.name, role: isAdmin ? "SUPER_ADMIN" : "CLIENT" },
    expires: expires.toISOString(),
  });
});

router.get("/session", requireAuth, async (c) => {
  const user = c.get("user");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return c.json({ user, expires });
});

router.post("/logout", requireAuth, async (c) => {
  const sessionToken = c.req.header("cookie")?.match(/session_token=([^;]+)/)?.[1];
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
  }
  deleteCookie(c, "session_token", { path: "/" });
  return c.json({ success: true });
});

/* ── Forgot Password ── */
const ForgotBody = z.object({ email: z.string().email().max(254) });
router.post("/forgot-password", rateLimit("strict"), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ForgotBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid email", requestId: crypto.randomUUID() } }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.session.create({ data: { sessionToken: resetToken, userId: user.id, expires } });
    // In production: send email with reset link containing token
    console.log(`Reset token for ${user.email}: ${resetToken}`);
  }

  return c.json({ success: true });
});

/* ── Reset Password ── */
const ResetBody = z.object({
  token: z.string().uuid(),
  password: z.string().min(8).max(128).regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
});
router.post("/reset-password", rateLimit("strict"), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ResetBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", requestId: crypto.randomUUID() } }, 400);
  }

  const { token, password: newPassword } = parsed.data;
  const session = await prisma.session.findUnique({ where: { sessionToken: token } });
  if (!session || session.expires < new Date()) {
    return c.json({ error: { code: "INVALID_TOKEN", message: "Reset link is invalid or expired", requestId: crypto.randomUUID() } }, 400);
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });
  await prisma.session.deleteMany({ where: { sessionToken: token } });

  return c.json({ success: true });
});

export default router;
