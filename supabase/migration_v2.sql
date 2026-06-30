-- ============================================================================
-- supabase/migration_v2.sql
-- WIE2026 – The Cypher Trail  ·  Schema Migration v2
-- ============================================================================
-- HOW TO RUN:
--   Option A (recommended): Supabase Dashboard → SQL Editor → paste & run.
--   Option B: supabase db push  (if using Supabase CLI with local dev)
--
-- This migration is IDEMPOTENT — safe to re-run. Every statement uses
-- IF NOT EXISTS / IF EXISTS / ON CONFLICT guards where possible.
-- ============================================================================

-- ── 0. Extensions ─────────────────────────────────────────────────────────────
-- uuid-ossp is usually pre-enabled in Supabase; kept here for completeness.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. players  — add auth_id column to link with Supabase auth.users
-- ============================================================================

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS auth_id   UUID     UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index for fast lookup during login (upsertPlayerFromAuth)
CREATE INDEX IF NOT EXISTS idx_players_auth_id ON players (auth_id);

-- ============================================================================
-- 2. scores  — add round-specific columns
-- ============================================================================

ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS round           TEXT,          -- e.g. 'mission_clearance'
  ADD COLUMN IF NOT EXISTS time_taken_secs INTEGER,       -- seconds the round took
  ADD COLUMN IF NOT EXISTS evidence_text   TEXT;          -- Round 5 accusation text

-- Index to make per-player score queries fast
CREATE INDEX IF NOT EXISTS idx_scores_player_id  ON scores (player_id);
CREATE INDEX IF NOT EXISTS idx_scores_round       ON scores (round);

-- ============================================================================
-- 3. admin_player_summary view  — recreate to expose new columns
--    (DROP + CREATE is atomic inside a transaction in Supabase SQL editor)
-- ============================================================================

DROP VIEW IF EXISTS admin_player_summary;

CREATE VIEW admin_player_summary
  WITH (security_invoker = false)   -- runs as postgres, bypasses caller RLS
AS
SELECT
  p.id                                                        AS player_id,
  p.display_name,
  p.email,
  p.avatar_url,
  p.created_at,
  p.auth_id,

  -- Session stats
  COUNT(DISTINCT s.id)                                        AS total_sessions,
  MAX(s.logged_in_at)                                         AS last_seen,
  COALESCE(SUM(s.duration_secs), 0)                          AS total_time_secs,

  -- Score stats
  COUNT(sc.id)                                                AS total_games,
  COALESCE(SUM(sc.score), 0)                                 AS total_score,
  ROUND(AVG(sc.score)::numeric, 1)                           AS avg_score

FROM players p
LEFT JOIN sessions s  ON s.player_id  = p.id
LEFT JOIN scores  sc  ON sc.player_id = p.id
GROUP BY p.id, p.display_name, p.email, p.avatar_url, p.created_at, p.auth_id;

-- ============================================================================
-- 4. Row-Level Security fixes
-- ============================================================================
-- The most common cause of "empty Players tab" is RLS blocking anon reads.
-- The two approaches below handle it; choose ONE per table.
--
-- APPROACH A (recommended for this event): disable RLS on read-only tables
--   since all data is event-scoped and non-sensitive.
--
-- APPROACH B (more secure): keep RLS enabled, add a policy that allows
--   the admin service-role to read all rows.
--
-- ── Approach A — disable RLS (simplest, fine for a closed event) ────────────

ALTER TABLE players   DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores    DISABLE ROW LEVEL SECURITY;
-- Keep audit_log RLS enabled (write-only from triggers, read by admin only)
-- ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- ── Approach B — if you prefer to keep RLS, comment out Approach A above
--    and run the policies below instead ──────────────────────────────────────
--
-- -- Players: anyone can insert their own row; only service_role reads all
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "players_insert_own" ON players
--   FOR INSERT WITH CHECK (auth.uid() = auth_id);
-- CREATE POLICY "players_read_own" ON players
--   FOR SELECT USING (auth.uid() = auth_id);
--
-- -- Scores: authenticated user inserts own scores; service_role reads all
-- ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "scores_insert_own" ON scores
--   FOR INSERT WITH CHECK (
--     player_id IN (SELECT id FROM players WHERE auth_id = auth.uid())
--   );
-- CREATE POLICY "scores_read_own" ON scores
--   FOR SELECT USING (
--     player_id IN (SELECT id FROM players WHERE auth_id = auth.uid())
--   );

-- ============================================================================
-- 5. Grant SELECT on the view to anon + authenticated roles
--    (Supabase's auto-api uses anon for unauthenticated queries)
-- ============================================================================

GRANT SELECT ON admin_player_summary TO anon;
GRANT SELECT ON admin_player_summary TO authenticated;
GRANT SELECT ON admin_player_summary TO service_role;

-- Also ensure the underlying tables are readable through the view
GRANT SELECT ON players  TO anon, authenticated;
GRANT SELECT ON sessions TO anon, authenticated;
GRANT SELECT ON scores   TO anon, authenticated;

-- Write grants for game flow (inserts)
GRANT INSERT, UPDATE ON players  TO anon, authenticated;
GRANT INSERT, UPDATE ON sessions TO anon, authenticated;
GRANT INSERT         ON scores   TO anon, authenticated;

-- ============================================================================
-- 6. audit_log trigger (create if not already present)
--    Fires on INSERT to players / sessions / scores and logs the event.
-- ============================================================================

-- Make sure audit_log exists with at least these columns
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  TEXT      NOT NULL,
  payload     JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON audit_log TO anon, authenticated;
GRANT INSERT ON audit_log TO anon, authenticated;

-- Function called by each trigger
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_log (event_type, payload, occurred_at)
  VALUES (
    TG_TABLE_NAME || '_' || LOWER(TG_OP),
    to_jsonb(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- players
DROP TRIGGER IF EXISTS trg_audit_players ON players;
CREATE TRIGGER trg_audit_players
  AFTER INSERT OR UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- sessions
DROP TRIGGER IF EXISTS trg_audit_sessions ON sessions;
CREATE TRIGGER trg_audit_sessions
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- scores
DROP TRIGGER IF EXISTS trg_audit_scores ON scores;
CREATE TRIGGER trg_audit_scores
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================================
-- 7. Google OAuth — Supabase callback URL checklist (NOT SQL, just notes)
-- ============================================================================
-- Run these steps OUTSIDE of SQL:
--
--  A. Supabase Dashboard → Authentication → Providers → Google
--     - Enable Google provider
--     - Paste Google OAuth Client ID + Secret
--     - Copy the "Callback URL" shown (looks like https://<ref>.supabase.co/auth/v1/callback)
--
--  B. Google Cloud Console → APIs & Services → Credentials
--     - Open your OAuth 2.0 Client
--     - Add the Supabase callback URL to "Authorized redirect URIs"
--     - Also add your frontend origin to "Authorized JavaScript origins"
--       e.g.  http://localhost:5173  AND  https://your-production-domain.com
--
--  C. Supabase Dashboard → Authentication → URL Configuration
--     - Site URL:        http://localhost:5173  (or your prod URL)
--     - Redirect URLs:   http://localhost:5173/auth/callback
--                        https://your-production-domain.com/auth/callback
--
--  D. Your .env file must have:
--     VITE_SUPABASE_URL=https://<ref>.supabase.co
--     VITE_SUPABASE_ANON_KEY=<anon-key>
--     VITE_ADMIN_PASSWORD=<your-admin-pw>
-- ============================================================================

-- Done. Verify with:
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'players';
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'scores';
--   SELECT * FROM admin_player_summary LIMIT 5;
