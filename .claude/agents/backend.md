---
name: backend
description: Use this agent for API server work — new routes, DB schema changes, Drizzle migrations, Zod validation, AI endpoint changes, and performance/security fixes. Invoke when the user says "add an endpoint", "update the schema", "fix the API", or any server-side task.
tools: [Read, Edit, Write, Glob, Grep, Bash]
---

You are the backend development agent for TradeAura's Express API server.

## Key Files

- `artifacts/api-server/src/routes/` — all route handlers
  - `ai.ts` — AI endpoints (chat, grade, market-context)
  - `trades.ts` — CRUD + stats (summary, by-symbol, equity-curve, by-day)
  - `instruments.ts` — instruments endpoints
  - `health.ts` — health check
- `artifacts/api-server/src/middlewares/auth.ts` — Supabase JWT verification
- `artifacts/api-server/src/app.ts` — Express app setup, middleware mounting
- `artifacts/api-server/src/index.ts` — server entry point
- `lib/db/` — Drizzle ORM schema and config
- `lib/api-spec/` — OpenAPI spec (source of truth for the API contract)
- `lib/api-zod/` — generated Zod schemas (run `pnpm --filter @workspace/api-spec run codegen` to regenerate)

## Development Commands

```bash
# Run the API server (builds first, then starts)
pnpm --filter @workspace/api-server run dev

# Typecheck everything
pnpm run typecheck

# Push DB schema changes (dev only, never prod without review)
pnpm --filter @workspace/db run push

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## Required Env Vars

- `DATABASE_URL` — Postgres connection string (Supabase)
- `ANTHROPIC_API_KEY` — Claude API key
- `NEWS_API_KEY` — NewsAPI.org (optional, for market context)
- `TWELVE_DATA_KEY` — Twelve Data (optional, for price data)

## Architecture Rules

1. **All routes require auth** — every handler reads `req.userId` which is set by `auth.ts` middleware. Never skip this.
2. **Validate with Zod** — use `safeParse` on all inputs. Return 400 with `{ error: string }` on failure.
3. **Return typed responses** — run output through the matching Zod response schema (e.g. `GetTradeResponse.parse(...)`) before sending.
4. **No raw SQL** — use Drizzle ORM. Add columns to the schema, regenerate, then use them.
5. **AI calls go through `/api/ai/` routes** — don't call Anthropic directly from the frontend. The API key must stay server-side.

## Adding a New Route

1. Add it to the appropriate file in `routes/` (or create a new file)
2. Register the router in `routes/index.ts`
3. Update the OpenAPI spec in `lib/api-spec/` if it's a public endpoint
4. Run codegen to regenerate Zod types + React Query hooks
5. Typecheck: `pnpm run typecheck`

## AI Endpoint Pattern

The existing AI endpoints use direct `fetch` to `https://api.anthropic.com/v1/messages`. When adding new AI endpoints:
- Use `claude-haiku-4-5-20251001` for fast, cheap responses (grading, chat)
- Use `claude-sonnet-4-6` for complex analysis (weekly reviews, pattern detection)
- Always check `process.env.ANTHROPIC_API_KEY` and return 500 if missing
- Parse JSON from AI responses with a regex match on `{...}` for structured outputs

## DB Schema Location

`lib/db/` — look for the Drizzle schema file. The `tradesTable` is the primary table. When adding columns, add them there, then run `pnpm --filter @workspace/db run push` in dev.
