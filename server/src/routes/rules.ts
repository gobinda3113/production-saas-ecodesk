import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { requireCsrf } from "../middleware/csrf.js";

const router = new Hono();

const CreateRuleBody = z.object({
  keyword: z.string().trim().min(2).max(80),
  matchMode: z.enum(["EXACT", "CONTAINS_ANY", "ALL_WORDS"]),
  platforms: z.array(z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK"])).min(1).max(3),
  applyToAllPosts: z.boolean(),
  replyMessage: z.string().trim().min(5).max(500),
});

router.get("/", requireAuth, rateLimit(), async (c) => {
  const user = c.get("user");
  const rules = await prisma.keywordRule.findMany({
    where: { clientId: user.clientId!, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activityLogs: true } } },
  });
  return c.json(rules);
});

router.post("/", requireAuth, rateLimit("strict"), requireCsrf, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = CreateRuleBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", requestId: crypto.randomUUID(), fieldErrors: parsed.error.flatten().fieldErrors } }, 400);
  }

  const rule = await prisma.keywordRule.create({
    data: {
      clientId: user.clientId!,
      keyword: parsed.data.keyword,
      normalizedKeyword: parsed.data.keyword.toLowerCase().trim(),
      matchMode: parsed.data.matchMode,
      replyMessage: parsed.data.replyMessage,
      applyToAllPosts: parsed.data.applyToAllPosts,
      createdById: user.userId,
    },
  });

  return c.json(rule, 201);
});

router.patch("/:id/toggle", requireAuth, requireCsrf, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const { active } = await c.req.json<{ active: boolean }>();

  const rule = await prisma.keywordRule.findFirst({
    where: { id, clientId: user.clientId!, deletedAt: null },
  });
  if (!rule) return c.json({ error: { code: "NOT_FOUND", message: "Rule not found", requestId: crypto.randomUUID() } }, 404);

  const updated = await prisma.keywordRule.update({
    where: { id },
    data: { active },
  });

  return c.json(updated);
});

router.delete("/:id", requireAuth, requireCsrf, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const rule = await prisma.keywordRule.findFirst({
    where: { id, clientId: user.clientId!, deletedAt: null },
  });
  if (!rule) return c.json({ error: { code: "NOT_FOUND", message: "Rule not found", requestId: crypto.randomUUID() } }, 404);

  await prisma.keywordRule.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return c.json({ deleted: true });
});

export default router;
