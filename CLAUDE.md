# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

TradeAura is an AI-powered trading journal app. It lets traders log trades, get AI-graded feedback (A–F), track performance analytics, and chat with an AI trading coach.

## Commands

```bash
# Run the API server (port 5000, rebuilds TypeScript on start)
pnpm --filter @workspace/api-server run dev

# Run the frontend (Vite dev server, port from $PORT or 3000)
pnpm --filter @workspace/tradeaura run dev

# Run the GID marketing agent
pnpm --filter @workspace/gid run start

# Full typecheck across all packages
pnpm run typecheck

# Build everything (typecheck + build all packages except mockup-sandbox)
pnpm run build

# Build frontend only
pnpm --filter @workspace/tradeaura run build

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema to Postgres (dev only, requires DATABASE_URL)
pnpm --filter @workspace/db run push
```

There are no test commands — this repo has no test suite.

## Architecture

This is a pnpm workspace monorepo with four main parts:

```
artifacts/
  tradeaura/      # React SPA (frontend)
  api-server/     # Express 5 API server (backend)
lib/
  db/             # Drizzle ORM schema + db connection (source of truth for DB)
  api-spec/       # OpenAPI YAML (source of truth for API contract) + Orval codegen config
  api-client-react/  # Generated TanStack Query hooks (output of codegen)
  api-zod/           # Generated Zod validators (output of codegen)
gid/              # Standalone marketing AI agent (runs on Railway)
```

### Frontend — `artifacts/tradeaura/`

The entire application UI lives in a **single file**: `artifacts/tradeaura/src/App.tsx` (~2800+ lines). This is intentional — no routing library, no component files. All views are rendered conditionally via `useState`.

Key conventions in App.tsx:
- **All styles are inline** using a `C` constants object for brand colors (defined at top of file). Never use CSS classes or Tailwind in this file.
- **Color palette** — the actual values in App.tsx are: `bg:"#0f1117"`, `surf:"#161b27"`, `surf2:"#1c2333"`, `bord:"#232d40"`, `blue:"#4f8ef7"`, `green:"#34d399"`, `red:"#f87171"`, `gold:"#fbbf24"`, `purp:"#a78bfa"`, `txt:"#e2e8f0"`, `muted:"#64748b"`, `dim:"#94a3b8"`. (The colors listed in `.claude/agents/dev.md` are slightly outdated — trust the file.)
- Auth is handled via Supabase client directly; the app shows `<LandingPage>` when no user is authenticated.
- API calls go through the `apiCall()` helper in App.tsx (raw fetch, not the generated hooks from `lib/api-client-react`). The base URL is controlled by `VITE_API_URL` env var; in production it points to the separate Vercel deployment of the API server.
- `EducationCenter` and `TradingVisuals` are lazy-loaded JSX files alongside App.tsx.
- Font is Space Grotesk via Google Fonts (loaded in `index.html`).

### Backend — `artifacts/api-server/`

Express 5 server, built to a CJS bundle with esbuild and served from `dist/index.mjs`.

- All routes under `/api` require the `requireAuth` middleware **except** `/api/healthz` and `/api/billing/webhook`.
- Auth: extracts `Authorization: Bearer <token>`, validates against Supabase, sets `req.userId`.
- Route files: `trades.ts` (CRUD + stats), `ai.ts` (chat + grade + market-context), `billing.ts` (Stripe).
- Stats endpoints (`/stats/*`) load all user trades into memory and compute aggregates in JS — there's no SQL aggregation.
- The `/api/billing/webhook` route uses `express.raw()` (before `express.json()`) so Stripe signature verification works. This middleware order in `app.ts` is critical.
- Subscription status is stored in Supabase `user_metadata` (not in the Postgres DB). The trial is 7 days from `user.created_at`.

### Shared Libraries — `lib/`

**`lib/db/`** — the source of truth for the database schema. Has two tables:
- `tradesTable` — all trade fields. `rulesFollowed` and `aiFeedback` are stored as JSON strings in `text` columns (serialized/deserialized in route handlers). Numeric fields (prices, pnl) are stored as `numeric` strings and must be cast with `Number()` before arithmetic.
- `instrumentsTable` — user's saved instrument watchlist.

**`lib/api-spec/openapi.yaml`** — the source of truth for the REST API contract. This is the single file to edit when adding or modifying endpoints. After editing, run codegen to update the generated libraries.

**`lib/api-client-react/`** and **`lib/api-zod/`** — generated output, never edit directly. Re-generate with `pnpm --filter @workspace/api-spec run codegen`. The Zod schemas from `@workspace/api-zod` are imported into the API server to validate request/response shapes.

### Deployment

- **Frontend**: Vercel (`vercel.json` at repo root). Build output in `artifacts/tradeaura/dist/public`. The `dist/` directory is **committed to git** and must be kept up to date.
- **API server**: Vercel (`artifacts/api-server/vercel.json`). All requests route to the esbuild bundle. CORS is open (`*`).
- **Frontend → API**: In production, Vercel rewrites `/api/*` to `https://tradeaura-api-server.vercel.app/api/*`. In dev, set `VITE_API_URL` to point at the local server or leave empty to use same-origin.

### GID Marketing Agent — `gid/`

A separate Node.js process (deployed on Railway) that runs social media automation. It uses `node-cron` to schedule posts to X, Instagram, and Facebook, and responds to commands via a Telegram bot. Requires its own set of env vars (see `gid/.env.example`). Not part of the main app build.

## Key Gotchas

- **`dist/` must be committed.** When you build the frontend, `git add artifacts/tradeaura/dist/` before committing.
- **Numeric DB values are strings.** Drizzle returns `numeric` columns as strings. Always wrap with `Number()` or `toNum()` before math.
- **JSON fields in DB.** `rulesFollowed` and `aiFeedback` in `tradesTable` are plain `text` columns. The route handlers call `JSON.stringify`/`JSON.parse` manually.
- **Stripe webhook body.** The `/api/billing/webhook` route must receive the raw body. The order of `express.raw()` before `express.json()` in `app.ts` is load-bearing — do not reorder.
- **API contract change workflow.** Edit `lib/api-spec/openapi.yaml` → run codegen → update the Express route handler → update App.tsx `apiCall()` usage. Do all four steps.
- **pnpm only.** The `preinstall` script enforces this. Do not use npm or yarn.
- **New packages must be ≥1 day old** (supply-chain defense via `minimumReleaseAge: 1440` in `pnpm-workspace.yaml`). To bypass for trusted packages, add to `minimumReleaseAgeExclude`.

## Environment Variables

API server (`artifacts/api-server/`):
- `DATABASE_URL` — Postgres connection string
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — for auth middleware and billing
- `ANTHROPIC_API_KEY` — for `/api/ai/*` endpoints (uses `claude-haiku-4-5-20251001`)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — for billing
- `FRONTEND_URL` — used for Stripe redirect URLs (default: `https://tradeauraapp.com`)
- `NEWS_API_KEY` (optional) — for live news headlines in market context
- `TWELVE_DATA_KEY` (optional) — for live price data in market context
- `BETA_CODES` — comma-separated list of valid beta access codes

Frontend (`artifacts/tradeaura/`):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase client
- `VITE_API_URL` — API server base URL (empty = same-origin proxy)
