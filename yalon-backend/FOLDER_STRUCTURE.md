# Yalon Backend — Production-Grade Folder Structure

```
yalon-backend/
├── src/
│   ├── config/
│   │   ├── env.ts                 # validates & exports typed env vars (zod-checked)
│   │   ├── supabase.ts            # Supabase client init (service_role, server-only)
│   │   └── mailer.ts              # nodemailer/Brevo transporter setup
│   │
│   ├── routes/
│   │   ├── index.ts                # mounts all routers onto the app
│   │   ├── health.route.ts         # GET /
│   │   ├── customerRequests.route.ts   # POST /api/customer-requests
│   │   └── employeeApplications.route.ts  # POST /api/employee-applications
│   │
│   ├── controllers/
│   │   ├── customerRequests.controller.ts
│   │   └── employeeApplications.controller.ts
│   │
│   ├── services/
│   │   ├── email.service.ts        # builds & sends notification emails
│   │   ├── storage.service.ts      # uploads files to Supabase Storage, generates signed URLs
│   │   └── customerRequests.service.ts   # DB insert logic, business rules
│   │   └── employeeApplications.service.ts
│   │
│   ├── validators/
│   │   ├── customerRequest.schema.ts   # zod schema — mirrors CustomerRequestInsert
│   │   └── employeeApplication.schema.ts
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts         # centralized error handling
│   │   ├── rateLimiter.ts          # express-rate-limit config
│   │   ├── validateRequest.ts      # generic zod-validation middleware
│   │   └── uploadHandler.ts        # multer config (memory storage, size/type limits)
│   │
│   ├── templates/
│   │   ├── customerRequestEmail.ts # HTML email builder (like your current inline template)
│   │   └── employeeApplicationEmail.ts
│   │
│   ├── types/
│   │   ├── database.types.ts       # ← the file we already generated
│   │   └── express.d.ts            # augment Express Request if needed
│   │
│   ├── utils/
│   │   ├── logger.ts               # pino logger setup
│   │   └── asyncHandler.ts         # wraps async route handlers for error catching
│   │
│   └── app.ts                      # Express app setup (middleware, routes) — NO app.listen here
│
├── server.ts                       # entry point: imports app.ts, calls app.listen()
├── assets/
│   └── yalon-logo-email.png
│
├── .env                             # never committed
├── .env.example                     # committed — documents required vars, no real values
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## Why this shape

- **`routes/` vs `controllers/` vs `services/`** — a route just wires a URL to a controller; a controller
  reads `req`/`res` and calls a service; a service holds the actual logic (DB writes, email sending) and has
  zero knowledge of Express. This means your services are testable without spinning up a server, and you
  could reuse them from a CLI script or a cron job later without touching Express at all.

- **`validators/`** — zod schemas separate from the route/controller, so the same schema can validate both
  the incoming request body *and* double as a source of truth for your TS types (`z.infer<typeof schema>`).

- **`app.ts` vs `server.ts` split** — `app.ts` exports the configured Express app but never calls `.listen()`.
  This is what lets you write integration tests with `supertest` against `app` directly, without binding a
  real port.

- **`templates/`** — pulls your HTML email string out of the controller/service, matching what your current
  `server.js` does inline. Once you have two forms (customer + employee), each needs its own email template,
  and inlining both in the service files gets unreadable fast.

- **`middleware/uploadHandler.ts`** — multer configured once, reused across the employee application route
  (which needs file uploads) without duplicating config.

- **`.env.example`** — critical for a "pro-grade" repo: documents every required env var (`SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `SENDER_EMAIL`, `RECEIVER_EMAIL`,
  `ALLOWED_ORIGIN`, `PORT`) without ever risking a real secret being committed.

## What's intentionally left out (for your scale)

- No `repositories/` layer on top of Supabase — Supabase's client already *is* your data-access layer;
  adding another abstraction on top is over-engineering for this project size.
- No `di-container/` (dependency injection framework) — unnecessary ceremony for an app this size.
- No `tests/` shown above, but you'd mirror `src/` under `tests/` (e.g. `tests/services/email.service.test.ts`)
  once you're ready to add Jest or Vitest — happy to scaffold that when you get there.

## package.json scripts you'll want

```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```
