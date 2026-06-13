import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { requireCsrf } from "../middleware/csrf.js";

const router = new Hono();

router.get("/clients", requireAuth, requireRole("SUPER_ADMIN"), rateLimit("admin"), async (c) => {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { keywordRules: true, platformConnections: true } },
      creditWallet: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(clients);
});

router.patch("/clients/:id", requireAuth, requireRole("SUPER_ADMIN"), rateLimit("admin"), requireCsrf, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const { status, plan, creditTopUp, reason } = body;

  const client = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!client) return c.json({ error: { code: "NOT_FOUND", message: "Client not found", requestId: crypto.randomUUID() } }, 404);

  if (status || plan) {
    await prisma.client.update({ where: { id }, data: { ...(status && { status }), ...(plan && { plan }) } });
  }

  if (creditTopUp) {
    await prisma.creditWallet.upsert({
      where: { clientId: id },
      create: { clientId: id, balance: creditTopUp },
      update: { balance: { increment: creditTopUp } },
    });
  }

  return c.json({ success: true, reason });
});

router.get("/webhooks", requireAuth, requireRole("SUPER_ADMIN"), rateLimit("admin"), async (c) => {
  const logs = await prisma.webhookLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return c.json(logs);
});

router.get("/system/queues", requireAuth, requireRole("SUPER_ADMIN"), rateLimit("admin"), async (c) => {
  const byStatus = await prisma.queueJob.groupBy({ by: ["status"], _count: true });
  const avgRetries = await prisma.queueJob.aggregate({ _avg: { attempts: true }, where: { status: "FAILED" } });
  return c.json({ byStatus, avgRetries: avgRetries._avg.attempts });
});

export default router;
