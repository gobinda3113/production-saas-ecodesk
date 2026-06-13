import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { requireCsrf } from "../middleware/csrf.js";

const router = new Hono();

const plans: Record<string, { price: number; credits: number }> = {
  FREE_TRIAL: { price: 0, credits: 5 },
  STARTER: { price: 100, credits: 90 },
  GROWTH: { price: 2000, credits: 2300 },
  PRO: { price: 5000, credits: 6000 },
};

const PurchaseBody = z.object({
  plan: z.enum(["FREE_TRIAL", "STARTER", "GROWTH", "PRO"]),
  gateway: z.enum(["ESEWA", "KHALTI"]),
  idempotencyKey: z.string().uuid(),
  csrfToken: z.string().min(32),
});

router.post("/purchase", requireAuth, rateLimit("strict"), requireCsrf, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = PurchaseBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", requestId: crypto.randomUUID(), fieldErrors: parsed.error.flatten().fieldErrors } }, 400);
  }

  const plan = plans[parsed.data.plan];
  if (!plan) return c.json({ error: { code: "INVALID_PLAN", message: "Invalid plan", requestId: crypto.randomUUID() } }, 400);

  const existing = await prisma.transaction.findUnique({ where: { idempotencyKey: parsed.data.idempotencyKey } });
  if (existing) return c.json(existing);

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        clientId: user.clientId!,
        gateway: parsed.data.gateway,
        status: "COMPLETED",
        plan: parsed.data.plan,
        amountNpr: plan.price,
        credits: plan.credits,
        idempotencyKey: parsed.data.idempotencyKey,
      },
    }),
    prisma.creditWallet.upsert({
      where: { clientId: user.clientId! },
      create: { clientId: user.clientId!, balance: plan.credits },
      update: { balance: { increment: plan.credits } },
    }),
    prisma.creditLedger.create({
      data: {
        clientId: user.clientId!,
        type: "CREDIT_PURCHASE",
        amount: plan.credits,
        balanceAfter: 0,
        reason: `Purchased ${parsed.data.plan} plan`,
      },
    }),
  ]);

  return c.json(transaction, 201);
});

router.get("/transactions", requireAuth, rateLimit(), async (c) => {
  const user = c.get("user");
  const transactions = await prisma.transaction.findMany({
    where: { clientId: user.clientId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return c.json(transactions);
});

export default router;
