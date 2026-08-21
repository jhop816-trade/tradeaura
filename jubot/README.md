# jubot

A Claude-powered assistant for managing JuFaded's Google Ads and Google
Business Profile — built as a separate, parallel service to
[`gid`](../gid), which keeps handling TradeAura's Instagram on its own.

You talk to it through **Telegram**, same pattern as GID.

## What it does right now

- **Ads digest** — paste your Google Ads numbers (clicks, impressions, cost,
  conversions) and it stores them, compares to the last snapshot, and gives
  you a plain-language read on the trend + suggestions.
- **Appointment reminders** — forward a Booksy booking notification and it
  extracts the client/service/time, then pings you ~1 hour before the
  appointment.

## What it doesn't do yet

Auto-replying to Google reviews and pulling live Google Ads / Business
Profile data both require applying for API access from Google — similar to
how GID needed a Meta developer app approved before it could post to
Instagram. That takes real lead time (days, sometimes longer), not
something available same-day. The `.env.example` has commented-out
placeholders for once that access is approved.

Booksy has no known public API, so appointment tracking works by you
forwarding Booksy's own notifications — there's no client-facing SMS/text
reminder here, this only reminds *you*.

## Setup

1. **Telegram bot** — message [@BotFather](https://t.me/BotFather) in
   Telegram, `/newbot`, follow the prompts, copy the token into
   `TELEGRAM_BOT_TOKEN`. Message your new bot once, then hit
   `https://api.telegram.org/bot<token>/getUpdates` in a browser to find
   your chat id for `TELEGRAM_CHAT_ID`.

2. **Supabase** — create a **new** Supabase project (separate from
   GID/TradeAura's). In the SQL editor, run everything in
   `supabase-migrations.sql`. Copy the project URL and **service role**
   key (not the anon key) into `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.

3. **Anthropic** — reuse or create an API key for `ANTHROPIC_API_KEY`.

4. Copy `.env.example` to `.env` and fill in the four things above.

5. **Run locally:**
   ```bash
   pnpm install
   pnpm --filter @workspace/jubot run start
   ```

6. **Deploy** — same pattern as GID: `Dockerfile` + `nixpacks.toml` are
   already set up for a Railway-style deploy. Point a new service at this
   `jubot/` directory, set the same env vars there, deploy.

## Roadmap (once Google API access is approved)

- Auto-reply drafts for new Google reviews, sent to you in Telegram for
  approval before posting (matches GID's `AUTO_POST=false` pattern — never
  auto-sends anything you haven't seen).
- Pull real Google Ads performance automatically instead of manual paste.
- Pull Business Profile insights (views, searches, actions) automatically.
