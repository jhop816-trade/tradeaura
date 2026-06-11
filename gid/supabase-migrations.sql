-- GID autonomous marketing system — Supabase migrations
-- Run these statements in the Supabase SQL editor before starting GID.

-- Agent memory: persistent key-value store per agent
create table if not exists agent_memory (
  id          uuid primary key default gen_random_uuid(),
  agent_name  text not null,
  memory_key  text not null,
  memory_value jsonb not null,
  updated_at  timestamptz not null default now(),
  unique (agent_name, memory_key)
);

-- Content drafts: TikTok scripts awaiting manual review (never auto-posted)
create table if not exists content_drafts (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null,
  content    text not null,
  status     text not null default 'pending', -- pending | approved | rejected
  created_at timestamptz not null default now()
);

-- Content log: record of every post published to X, Instagram, Facebook
create table if not exists content_log (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null,
  content    text not null,
  post_id    text,
  posted_at  timestamptz not null default now()
);

-- System alerts: website-down events and failed post errors
create table if not exists system_alerts (
  id          uuid primary key default gen_random_uuid(),
  alert_type  text not null,
  message     text not null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);
