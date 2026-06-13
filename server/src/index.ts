import "dotenv/config";
import * as Sentry from "@sentry/node";
import { z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { errorHandler } from "./middleware/error.js";
import auth from "./routes/auth.js";
import rules from "./routes/rules.js";
import billing from "./routes/billing.js";
import admin from "./routes/admin.js";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  CSRF_SECRET: z.string().min(32, "CSRF_SECRET must be at least 32 characters"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of envResult.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const app = new Hono();

app.use("*", cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use("*", logger());
app.use("*", secureHeaders());

app.onError(errorHandler);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api/auth", auth);
app.route("/api/rules", rules);
app.route("/api/billing", billing);
app.route("/api/admin", admin);

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Route not found", requestId: crypto.randomUUID() } }, 404));

const port = parseInt(process.env.PORT || "3001", 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`EchoDesk API running on http://localhost:${info.port}`);
});

export default app;
