-- 38 Exotics — Supabase schema
-- Run in the Supabase Dashboard → SQL Editor → New Query.
--
-- Extracted from the previous shared setup file; the trading-app tables that
-- lived alongside it are not part of this project.

-- ============================================================
-- Car Rentals Tables
-- ============================================================

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  make text not null,
  model text not null,
  year int not null,
  daily_rate numeric not null,
  deposit_amount numeric not null,
  mileage_limit int not null default 200,
  photos text[] not null default '{}',
  description text not null default '',
  slug text not null unique,
  active boolean not null default true
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed')),
  stripe_payment_id text,
  deposit_paid boolean not null default false,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  vehicle_id uuid references vehicles(id),
  preferred_dates text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

-- RLS: anon can insert bookings and inquiries, not read them
alter table bookings enable row level security;
alter table inquiries enable row level security;
alter table vehicles enable row level security;

create policy "anon insert bookings" on bookings for insert to anon with check (true);
create policy "service role all bookings" on bookings for all to service_role using (true);
create policy "anon insert inquiries" on inquiries for insert to anon with check (true);
create policy "service role all inquiries" on inquiries for all to service_role using (true);
create policy "public read vehicles" on vehicles for select using (active = true);
create policy "service role all vehicles" on vehicles for all to service_role using (true);

-- Seed vehicles
insert into vehicles (name, make, model, year, daily_rate, deposit_amount, mileage_limit, photos, description, slug)
values
  (
    'Tesla Model Y',
    'Tesla', 'Model Y', 2026,
    250, 500, 200,
    array[]::text[],
    'The 2026 Tesla Model Y — all-electric, zero emissions, and built for South Florida. Instant torque, autopilot-ready, and charged up before every rental. No gas stops. Just drive.',
    'tesla-model-y'
  ),
  (
    'CLA 35 AMG',
    'Mercedes-Benz', 'CLA 35 AMG', 2020,
    300, 600, 200,
    array[
      '/images/mercedes/mercedes-1.jpg',
      '/images/mercedes/mercedes-2.jpg',
      '/images/mercedes/mercedes-3.jpg',
      '/images/mercedes/mercedes-4.jpg',
      '/images/mercedes/mercedes-5.jpg',
      '/images/mercedes/mercedes-6.jpg',
      '/images/mercedes/mercedes-int-1.jpg',
      '/images/mercedes/mercedes-int-2.jpg',
      '/images/mercedes/mercedes-int-3.jpg'
    ],
    'The 2020 Mercedes-Benz CLA 35 AMG. 302 horsepower, AMG sport seats with red stitching, MBUX dual-screen cockpit, and quad exhaust tips. This is the car people stop and look at.',
    'mercedes-cla-35-amg'
  )
on conflict (slug) do nothing;

-- ============================================================
-- Phase 2: owner-managed blackout dates + availability indexes
-- ============================================================

create table if not exists vehicle_blackouts (
  id         uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  start_date date not null,
  end_date   date not null,
  reason     text not null default '',
  created_at timestamptz not null default now(),
  constraint blackout_dates_ordered check (end_date >= start_date)
);

alter table vehicle_blackouts enable row level security;

-- Blackouts are read and written only through the service role (server-side).
create policy "service role all blackouts" on vehicle_blackouts
  for all to service_role using (true);

-- Availability lookups filter by vehicle + overlapping date range.
create index if not exists bookings_vehicle_dates_idx
  on bookings (vehicle_id, start_date, end_date);
create index if not exists blackouts_vehicle_dates_idx
  on vehicle_blackouts (vehicle_id, start_date, end_date);
