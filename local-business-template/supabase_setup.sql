-- Run this in Supabase Dashboard → SQL Editor before launching the site.
-- Creates the leads table and allows anonymous inserts (contact form + chatbot).

CREATE TABLE IF NOT EXISTS leads (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_slug  TEXT NOT NULL,
  name           TEXT,
  phone          TEXT,
  email          TEXT,
  message        TEXT,
  requested_date TEXT,
  source         TEXT DEFAULT 'form', -- 'form' | 'chat'
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts — both the booking form and chatbot write here
CREATE POLICY "allow_anon_insert" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- No SELECT policy — anon users cannot read leads (view them in the Supabase table editor)
