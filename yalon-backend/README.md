# Yalon Backend

Production-grade Express + TypeScript backend for YALON Professional Staffing Solutions.

Handles two form submissions:
- **Customer Service Requests** (`POST /api/customer-requests`) — businesses requesting event/hospitality staffing
- **Casual Employee Applications** (`POST /api/employee-applications`, multipart) — job applicants, with document uploads

Stack: **Express + TypeScript**, **Supabase** (Postgres + Storage), **Brevo** (email via nodemailer), deployed on **Koyeb** (free tier, Frankfurt region).

## Setup

```bash
npm install
cp .env.example .env   # fill in real values
```

1. Run `schema.sql` in your Supabase project's SQL editor to create tables, enums, and RLS policies.
2. Create a **private** storage bucket named `employee-documents` in Supabase Storage (Settings > Storage).
3. Add `assets/yalon-logo-email.png` (used as the CID logo in notification emails).
4. Fill in `.env` — see `.env.example` for every required variable.

## Development

```bash
npm run dev        # tsx watch — hot reload
npm run typecheck   # tsc --noEmit
npm run build        # compiles to dist/
npm start             # runs compiled dist/server.js
```

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it must only ever live in this server's `.env`, never in frontend code.
- Uploaded documents (ID, medical info, CV) go to a **private** Supabase Storage bucket. Never make this bucket public; use `getSignedDocumentUrl()` in `storage.service.ts` to generate short-lived admin access links.
- All user input in emails is HTML-escaped (`templates/*.ts`) to prevent HTML injection into notification emails.
- Rate limiting (`middleware/rateLimiter.ts`) caps each IP to 20 submissions per 15 minutes on both form endpoints.
- File uploads are capped at 5MB and restricted to JPEG/PNG/WebP/PDF (`middleware/uploadHandler.ts`).

## Folder structure

See `FOLDER_STRUCTURE.md` for the full layout and rationale.

## Deployment (Koyeb, free tier)

1. Push this repo to GitHub.
2. In Koyeb, create a new Web Service from the repo, region **Frankfurt**.
3. Build command: `npm install && npm run build`
4. Run command: `npm start`
5. Add all `.env` variables as Koyeb environment variables/secrets (never commit `.env`).
