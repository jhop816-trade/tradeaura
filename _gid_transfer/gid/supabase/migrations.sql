-- GID 2.0 — Phase 1 schema. One real table: the activity log.
-- Everything else in Phase 1 (ads/business/reviews numbers) is mock data
-- in code, not the database, until real API access replaces it.

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,
  category text not null check (category in ('ads', 'business', 'reviews', 'website', 'system')),
  status text not null check (status in ('success', 'failure', 'pending_approval')),
  details jsonb,
  approval_required boolean not null default false,
  approved_at timestamptz
);

alter table activity_log enable row level security;

-- The app only ever talks to this table through the server-side service
-- role client (see lib/supabase/server.ts createServiceSupabase), which
-- bypasses RLS entirely. This policy exists as a backstop in case the
-- anon/browser client is ever pointed at this table by mistake — it locks
-- reads to logged-in sessions and denies all direct writes.
create policy "authenticated can read" on activity_log
  for select using (auth.role() = 'authenticated');
