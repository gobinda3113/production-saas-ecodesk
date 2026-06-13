import { z } from "zod";

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const PlatformSchema = z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK"]);
export const MatchModeSchema = z.enum(["EXACT", "CONTAINS_ANY", "ALL_WORDS"]);
export const PlanSchema = z.enum(["FREE_TRIAL", "STARTER", "GROWTH", "PRO"]);
export const GatewaySchema = z.enum(["ESEWA", "KHALTI"]);

export const LoginRequestSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  csrfToken: z.string().min(32),
});

export const SessionResponseSchema = z.object({
  user: z.object({ id: z.string(), email: z.string().email(), name: z.string().nullable(), role: z.enum(["SUPER_ADMIN", "CLIENT"]) }),
  expires: z.string().datetime(),
});

export const KeywordRuleRequestSchema = z.object({
  keyword: z.string().trim().min(2).max(80),
  matchMode: MatchModeSchema,
  platforms: z.array(PlatformSchema).min(1).max(3),
  applyToAllPosts: z.boolean(),
  postUrls: z.object({ instagram: z.string().url().optional(), facebook: z.string().url().optional(), tiktok: z.string().url().optional() }).optional(),
  replyMessage: z.string().trim().min(5).max(500),
  perPlatformReplies: z.record(PlatformSchema, z.string().min(1).max(500)).optional(),
  mediaUploadIds: z.array(z.string()).max(4).default([]),
});

export const KeywordRuleResponseSchema = KeywordRuleRequestSchema.extend({
  id: z.string(),
  active: z.boolean(),
  hitCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ConnectionResponseSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  status: z.enum(["CONNECTED", "DISCONNECTED", "EXPIRED", "REVOKED"]),
  accountName: z.string().nullable(),
  tokenExpiresAt: z.string().datetime().nullable(),
});

export const PurchaseRequestSchema = z.object({
  plan: PlanSchema,
  gateway: GatewaySchema,
  idempotencyKey: z.string().uuid(),
  csrfToken: z.string().min(32),
});

export const TransactionResponseSchema = z.object({
  id: z.string(),
  plan: PlanSchema,
  gateway: GatewaySchema,
  amountNpr: z.number().int().nonnegative(),
  credits: z.number().int().nonnegative(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
  transactionId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const ActivityLogResponseSchema = z.object({
  id: z.string(),
  platform: PlatformSchema.nullable(),
  messagePreview: z.string(),
  matchedKeyword: z.string().nullable(),
  matchStatus: z.enum(["REPLIED", "NO_MATCH", "ERROR", "SUPPRESSED_DUPLICATE"]),
  processingMs: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const SettingsRequestSchema = z.object({
  businessName: z.string().min(2).max(120),
  notifications: z.object({ lowCredits: z.boolean(), platformDisconnect: z.boolean(), weeklySummary: z.boolean() }),
  appearance: z.enum(["light", "dark", "system"]),
});

export const AdminClientPatchSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  plan: PlanSchema.optional(),
  creditTopUp: z.number().int().min(1).max(100000).optional(),
  reason: z.string().min(8).max(500),
});

export const WebhookReceiverRequestSchema = z.object({
  platform: PlatformSchema,
  eventType: z.string().min(1).max(80),
  accountId: z.string().min(1),
  externalUserId: z.string().min(1),
  postUrl: z.string().url().optional(),
  message: z.string().min(1).max(2000),
  signature: z.string().min(32),
  receivedAt: z.string().datetime(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
export type KeywordRuleRequest = z.infer<typeof KeywordRuleRequestSchema>;
export type KeywordRuleResponse = z.infer<typeof KeywordRuleResponseSchema>;
export type ConnectionResponse = z.infer<typeof ConnectionResponseSchema>;
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type ActivityLogResponse = z.infer<typeof ActivityLogResponseSchema>;
export type SettingsRequest = z.infer<typeof SettingsRequestSchema>;
export type AdminClientPatch = z.infer<typeof AdminClientPatchSchema>;

export interface EndpointDef {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  route: string;
  authentication: "public" | "session" | "platform-signature";
  authorization: string;
  rateLimit: string;
  requestSchema: string;
  responseSchema: string;
  validationRules: string[];
}

export const API_ENDPOINTS: EndpointDef[] = [
  { method: "POST", route: "/api/auth/login", authentication: "public", authorization: "CSRF token required", rateLimit: "5/min/IP", requestSchema: "LoginRequestSchema", responseSchema: "SessionResponseSchema", validationRules: ["email normalized", "password length bounded", "secure httpOnly cookies"] },
  { method: "GET", route: "/api/session", authentication: "session", authorization: "authenticated user", rateLimit: "60/min/user", requestSchema: "none", responseSchema: "SessionResponseSchema", validationRules: ["never return password hash"] },
  { method: "GET", route: "/api/rules", authentication: "session", authorization: "client:rules:read", rateLimit: "120/min/user", requestSchema: "PaginationQuerySchema", responseSchema: "KeywordRuleResponseSchema[]", validationRules: ["scope by clientId", "exclude soft deleted"] },
  { method: "POST", route: "/api/rules", authentication: "session", authorization: "client:rules:create", rateLimit: "30/min/user", requestSchema: "KeywordRuleRequestSchema", responseSchema: "KeywordRuleResponseSchema", validationRules: ["sanitize reply", "validate media ownership", "validate platform URLs"] },
  { method: "PATCH", route: "/api/rules/:id", authentication: "session", authorization: "client:rules:update", rateLimit: "60/min/user", requestSchema: "KeywordRuleRequestSchema.partial", responseSchema: "KeywordRuleResponseSchema", validationRules: ["rule must belong to client", "audit before/after"] },
  { method: "PATCH", route: "/api/rules/:id/toggle", authentication: "session", authorization: "client:rules:update", rateLimit: "60/min/user", requestSchema: "{ active: boolean }", responseSchema: "KeywordRuleResponseSchema", validationRules: ["optimistic concurrency version check"] },
  { method: "DELETE", route: "/api/rules/:id", authentication: "session", authorization: "client:rules:delete", rateLimit: "20/min/user", requestSchema: "none", responseSchema: "{ deleted: true }", validationRules: ["soft delete", "audit log required"] },
  { method: "GET", route: "/api/activity", authentication: "session", authorization: "client:activity:read", rateLimit: "120/min/user", requestSchema: "PaginationQuerySchema", responseSchema: "ActivityLogResponseSchema[]", validationRules: ["scope by clientId"] },
  { method: "GET", route: "/api/activity/export", authentication: "session", authorization: "client:activity:export", rateLimit: "10/hour/user", requestSchema: "date range query", responseSchema: "text/csv", validationRules: ["max 90 day range"] },
  { method: "GET", route: "/api/connections", authentication: "session", authorization: "client:connections:read", rateLimit: "120/min/user", requestSchema: "none", responseSchema: "ConnectionResponseSchema[]", validationRules: ["redact tokens"] },
  { method: "POST", route: "/api/connections/:platform/oauth/start", authentication: "session", authorization: "client:connections:connect", rateLimit: "20/min/user", requestSchema: "{ redirectUri: url }", responseSchema: "{ authorizationUrl: url, state: string }", validationRules: ["signed state", "PKCE verifier stored server-side"] },
  { method: "POST", route: "/api/connections/:platform/oauth/callback", authentication: "session", authorization: "client:connections:connect", rateLimit: "20/min/user", requestSchema: "{ code: string, state: string }", responseSchema: "ConnectionResponseSchema", validationRules: ["verify state", "encrypt tokens"] },
  { method: "DELETE", route: "/api/connections/:platform", authentication: "session", authorization: "client:connections:disconnect", rateLimit: "20/min/user", requestSchema: "{ csrfToken: string }", responseSchema: "ConnectionResponseSchema", validationRules: ["revoke upstream token", "pause platform rules"] },
  { method: "POST", route: "/api/billing/purchase", authentication: "session", authorization: "client:billing:purchase", rateLimit: "10/min/user", requestSchema: "PurchaseRequestSchema", responseSchema: "TransactionResponseSchema", validationRules: ["NPR only", "idempotency required", "server-side price lookup"] },
  { method: "GET", route: "/api/billing/transactions", authentication: "session", authorization: "client:billing:read", rateLimit: "120/min/user", requestSchema: "PaginationQuerySchema", responseSchema: "TransactionResponseSchema[]", validationRules: ["scope by clientId", "newest first"] },
  { method: "PATCH", route: "/api/settings", authentication: "session", authorization: "client:settings:update", rateLimit: "30/min/user", requestSchema: "SettingsRequestSchema", responseSchema: "SettingsRequestSchema", validationRules: ["sanitize business name", "audit log required"] },
  { method: "POST", route: "/api/webhooks/platform", authentication: "platform-signature", authorization: "platform app signature", rateLimit: "600/min/platform", requestSchema: "WebhookReceiverRequestSchema", responseSchema: "{ accepted: true }", validationRules: ["verify HMAC", "deduplicate requestId", "enqueue reply job"] },
  { method: "GET", route: "/api/admin/clients", authentication: "session", authorization: "admin:clients:read", rateLimit: "120/min/admin", requestSchema: "PaginationQuerySchema + filters", responseSchema: "AdminClient[]", validationRules: ["super admin only"] },
  { method: "PATCH", route: "/api/admin/clients/:id", authentication: "session", authorization: "admin:clients:update", rateLimit: "30/min/admin", requestSchema: "AdminClientPatchSchema", responseSchema: "ClientAccount", validationRules: ["transaction for top-up", "audit reason required"] },
  { method: "GET", route: "/api/admin/payments", authentication: "session", authorization: "admin:payments:read", rateLimit: "120/min/admin", requestSchema: "filters", responseSchema: "TransactionResponseSchema[]", validationRules: ["super admin only"] },
  { method: "GET", route: "/api/admin/webhooks", authentication: "session", authorization: "admin:webhooks:read", rateLimit: "120/min/admin", requestSchema: "filters", responseSchema: "WebhookLog[]", validationRules: ["raw payload returned only to admin"] },
  { method: "GET", route: "/api/admin/system/queues", authentication: "session", authorization: "admin:system:read", rateLimit: "60/min/admin", requestSchema: "none", responseSchema: "QueueHealth", validationRules: ["super admin only"] },
];
