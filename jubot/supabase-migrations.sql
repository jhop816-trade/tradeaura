-- jubot — Google Business / Ads assistant for JuFade
-- Run these statements in a NEW Supabase project's SQL editor before starting jubot.
-- Keep this separate from GID/TradeAura's Supabase project.

-- Agent memory: persistent key-value store (same pattern as GID)
create table if not exists agent_memory (
  id           uuid primary key default gen_random_uuid(),
  agent_name   text not null,
  memory_key   text not null,
  memory_value jsonb not null,
  updated_at   timestamptz not null default now(),
  unique (agent_name, memory_key)
);

-- Ads performance snapshots — manually reported until Google Ads API access
-- is approved. Each row is one point-in-time reading you paste into Telegram.
create table if not exists ads_snapshots (
  id           uuid primary key default gen_random_uuid(),
  period_label text not null,        -- e.g. "last 30 days", "this week"
  clicks       integer,
  impressions  integer,
  avg_cpc      numeric(10,2),
  cost         numeric(10,2),
  conversions  numeric(10,2),
  raw_text     text not null,        -- what you actually pasted, kept for reference
  created_at   timestamptz not null default now()
);

-- Appointments — parsed from Booksy notifications you forward into Telegram.
-- No Booksy API involved; this is a manual-forward workflow until/unless
-- Booksy exposes one.
create table if not exists appointments (
  id             uuid primary key default gen_random_uuid(),
  client_name    text,
  service        text,
  appointment_at timestamptz,
  raw_text       text not null,      -- the forwarded Booksy notification text
  reminded       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- System alerts — errors, crashes, anything worth a Telegram ping
create table if not exists system_alerts (
  id          uuid primary key default gen_random_uuid(),
  alert_type  text not null,
  message     text not null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);
