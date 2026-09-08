-- BBQCopilot Keepalive
-- Ping target for the scheduled GitHub Action (.github/workflows/keepalive.yml)
-- that prevents Supabase free-tier project pausing. Contains no user data.
-- Apply with `supabase db push`, or paste into the Supabase SQL Editor.

-- ===========================================
-- TABLE
-- ===========================================

CREATE TABLE keepalive (
  -- gen_random_uuid() is built into Postgres core, so this works regardless of
  -- which schema the uuid-ossp extension happens to live in.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note TEXT NOT NULL DEFAULT 'keepalive ping target',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE keepalive ENABLE ROW LEVEL SECURITY;

-- Deliberately world-readable: the row holds no data and the ping runs with the
-- public anon key. No INSERT/UPDATE/DELETE policies, so anon access is read-only.
CREATE POLICY "Anyone can read keepalive" ON keepalive FOR SELECT USING (true);

-- ===========================================
-- SEED
-- ===========================================

INSERT INTO keepalive DEFAULT VALUES;
