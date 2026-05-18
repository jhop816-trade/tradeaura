-- TradeAura: Run this in your Supabase Dashboard → SQL Editor → New Query

-- ── ACCOUNTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT 'Main Account',
  type              TEXT NOT NULL DEFAULT 'Live',
  starting_balance  NUMERIC(14,2) NOT NULL DEFAULT 25000,
  max_daily_trades  INT NOT NULL DEFAULT 5,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts: own rows" ON accounts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── TRADES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  instrument     TEXT NOT NULL,
  direction      TEXT NOT NULL,
  entry          NUMERIC(14,4),
  exit           NUMERIC(14,4),
  contracts      INT DEFAULT 1,
  stop_loss      NUMERIC(14,4),
  manual_pnl     TEXT,
  pnl            NUMERIC(14,2) DEFAULT 0,
  session        TEXT,
  setup          TEXT,
  mood           TEXT,
  rules_followed JSONB NOT NULL DEFAULT '[]',
  notes          TEXT,
  screenshot     TEXT,
  account_type   TEXT DEFAULT 'Live',
  ai_grade       TEXT,
  ai_feedback    JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trades: own rows" ON trades
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── FEEDBACK ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'general',
  message    TEXT NOT NULL,
  rating     INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback: own rows" ON feedback
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
