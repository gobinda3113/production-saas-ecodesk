# EchoDesk Production Architecture

## 1. System Architecture

EchoDesk is a split SaaS system:
- **Frontend:** Vite + React SPA bundled as a single HTML file (deployed to Cloudflare Pages / Vercel)
- **API:** Node.js with Hono + Zod validation on request/response boundaries
- **Database:** PostgreSQL with Prisma ORM
- **Queue:** BullMQ backed by Redis for reply dispatch, retries, refunds
- **Cache:** Redis for duplicate suppression, rate limits, short-lived OAuth state, credit locking
- **Storage:** Cloudflare R2 signed upload policies for validated media files
- **Webhooks:** Cloudflare Workers verify platform signatures, deduplicate, forward to API

### Core Runtime Services

| Service | Tech | Role |
|---|---|---|
| Web app | Vite + React 19 | SPA with routing, auth, dashboards |
| API server | Hono + Zod | REST endpoints, validation, RBAC |
| Database | PostgreSQL + Prisma | All persistent data |
| Queue | BullMQ + Redis | Async reply dispatch |
| Cache | Redis | Rate limits, locks, dedup |
| Storage | Cloudflare R2 | Media uploads |
| Workers | Cloudflare Workers | Edge webhook ingestion |

## 2. Database Schema

Located in `prisma/schema.prisma`. 21 models covering:

- **Auth:** User, Session, Role, Permission, UserRole, RolePermission
- **Tenant:** Client, TeamMember
- **Business:** KeywordRule, PlatformConnection
- **Financial:** CreditWallet, CreditLedger, Transaction, PaymentEvent
- **Monitoring:** ActivityLog, Notification, WebhookLog, QueueJob
- **Storage:** MediaUpload
- **Config:** Setting
- **Audit:** AuditLog

### Key Constraints

- Client data scoped by `clientId` on every tenant-owned table
- Soft deletes via `deletedAt` for audit/history recovery
- Tokens encrypted at rest (`encryptedToken`, `encryptedRefresh`)
- Credit wallet + append-only ledger for auditability
- Duplicate suppression via `ActivityLog.duplicateKey` uniqueness
- Payment idempotency via `Transaction.idempotencyKey` uniqueness

## 3. Folder Structure

```
├── prisma/                 # Prisma schema + migrations
│   └── schema.prisma
├── server/                 # Hono API backend
│   └── src/
│       ├── index.ts        # App entry, middleware, routes
│       ├── routes/         # Route handlers per domain
│       ├── services/       # Business logic services
│       ├── middleware/     # Auth, rate-limit, error middleware
│       └── lib/            # Prisma client, utilities
├── src/                    # Vite React frontend
│   ├── App.tsx             # Router + providers
│   ├── main.tsx            # Entry point
│   ├── store.tsx           # Global UI state (Context)
│   ├── schemas/            # Zod schemas + API contracts
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components per route
│   ├── data/               # Mock data + domain types
│   └── utils/              # Helpers (cn, matcher)
├── tests/                  # Unit + integration tests
├── docs/                   # Architecture, deployment, runbooks
├── docker-compose.yml      # PostgreSQL + Redis + app
└── .env.example            # Environment variable template
```

## 4. API Design

All endpoints defined in `src/schemas/api-contracts.ts`. Every endpoint declares:

- Method, route, authentication mode
- Authorization check (RBAC)
- Rate limit
- Request/response schemas (Zod)
- Validation rules

### Route Groups

| Group | Prefix | Auth |
|---|---|---|
| Auth | `/api/auth/*` | Public (CSRF) |
| Rules | `/api/rules*` | Session (client) |
| Activity | `/api/activity*` | Session (client) |
| Connections | `/api/connections*` | Session (client) |
| Media | `/api/media/*` | Session (client) |
| Billing | `/api/billing/*` | Session (client) |
| Settings | `/api/settings` | Session (client) |
| Webhooks | `/api/webhooks/*` | Platform signature |
| Admin | `/api/admin/*` | Session (admin) |

## 5. Authentication & RBAC

- **Auth:** Credentials-based login, secure httpOnly cookies, CSRF on mutations
- **Roles:**
  - `SUPER_ADMIN` — Admin panel, client management, credit top-ups, queue inspection
  - `CLIENT` — Own rules, connections, billing, settings
- **Enforcement:** Server-side for every endpoint, never client-side

## 6. Keyword Matching Engine

4-layer matching in `src/utils/matcher.ts`:

1. **Exact** — case-insensitive equality
2. **Phonetic** — Romanized Nepali normalization
3. **Contains** — substring check
4. **Fuzzy** — token-level Levenshtein distance <= 2

### On Match Flow

1. Check duplicate suppression (same user+rule, 60 min window)
2. Debit 1 credit atomically
3. Persist activity + webhook logs with processing time
4. Enqueue platform reply job (BullMQ)
5. Retry 3x with exponential backoff on failure
6. Refund credit on final failure

## 7. Testing Strategy

| Layer | Scope |
|---|---|
| Unit | matcher layers, normalization, Levenshtein, RBAC, schemas, CSV export, credit math |
| Integration | Rule CRUD, payment idempotency, webhook verification, queue retry/refund |
| E2E | Login, dashboard, add rule, toggle, connect/disconnect, purchase, theme, admin |
| Security | CSRF rejection, rate-limit, tenant isolation, media MIME validation, XSS |

## 8. Deployment

| Service | Target |
|---|---|
| Frontend | Cloudflare Pages / Vercel |
| API server | Railway / Render |
| Database | Neon / Supabase (PostgreSQL) |
| Cache | Upstash Redis |
| Storage | Cloudflare R2 |
| Webhook workers | Cloudflare Workers |

### Release Process

1. Run typecheck, lint, tests in CI
2. Run Prisma migrations before web/API rollout
3. Deploy API and workers before frontend when contracts change
4. Use environment-scoped secrets for all credentials
5. Enable Sentry + structured logs + health checks
