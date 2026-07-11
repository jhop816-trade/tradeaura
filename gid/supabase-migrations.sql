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

-- Content calendar: pre-scheduled content for Instagram and TikTok
CREATE TABLE IF NOT EXISTS content_calendar (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number     INTEGER NOT NULL,
  scheduled_date DATE,
  platform       TEXT NOT NULL,
  slot           TEXT,
  title          TEXT,
  content        TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'scheduled',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS pillar TEXT;
ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS format TEXT;
ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS utm_link TEXT;
ALTER TABLE content_log ADD COLUMN IF NOT EXISTS pillar TEXT;
ALTER TABLE content_log ADD COLUMN IF NOT EXISTS format TEXT;
ALTER TABLE content_log ADD COLUMN IF NOT EXISTS utm_link TEXT;

-- Instagram post insights (fetched at 24h and 7d post-publish)
CREATE TABLE IF NOT EXISTS post_insights (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_post_id   text NOT NULL,
  pillar              text,
  format              text,
  window              text NOT NULL,        -- '24h' | '7d'
  reach               integer NOT NULL DEFAULT 0,
  likes               integer NOT NULL DEFAULT 0,
  comments_count      integer NOT NULL DEFAULT 0,
  saves               integer NOT NULL DEFAULT 0,
  shares              integer NOT NULL DEFAULT 0,
  score               numeric(10,4) NOT NULL DEFAULT 0,
  fetched_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instagram_post_id, window)
);

-- Rolling pillar+format performance scores (recomputed weekly)
CREATE TABLE IF NOT EXISTS pillar_scores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar       text NOT NULL,
  format       text NOT NULL,
  avg_score    numeric(10,4) NOT NULL DEFAULT 0,
  post_count   integer NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pillar, format)
);

-- Track which comments we've already alerted on
CREATE TABLE IF NOT EXISTS seen_comments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_post_id   text NOT NULL,
  comment_id          text NOT NULL UNIQUE,
  text_preview        text,
  alerted             boolean NOT NULL DEFAULT false,
  seen_at             timestamptz NOT NULL DEFAULT now()
);
