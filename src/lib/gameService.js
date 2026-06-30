/**
 * src/lib/gameService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All Supabase DB interaction functions for WIE2026 – The Cypher Trail.
 *
 * NOTE on admin_player_summary "empty Players" bug:
 *   Most common causes (check in order):
 *   1. The VIEW does not have SELECT granted to the `anon` role.
 *      Fix: GRANT SELECT ON admin_player_summary TO anon, authenticated;
 *   2. RLS on the underlying `players` table blocks the view.
 *      Supabase pre-v15 views do NOT use security_invoker; they run as
 *      the view definer (postgres). If RLS forces row-filtering, the view
 *      returns 0 rows. Fix: set the view's security_definer, or disable RLS
 *      on players and use auth.uid()-scoped policies instead.
 *   3. Column names mismatch — this file uses `player_id`, `display_name`,
 *      `total_score`, `last_seen`, `total_sessions`, `avg_score`,
 *      `total_time_secs`, `total_games`. Verify against your real view schema.
 *   All of the above are addressed in supabase/migration_v2.sql.
 */

import { supabase } from './supabase.js';

// ── localStorage keys ─────────────────────────────────────────────────────────
const PLAYER_KEY = 'wie2026_player';
const SESSION_KEY = 'wie2026_session';

// ─────────────────────────────────────────────────────────────────────────────
// upsertPlayerFromAuth
// Called immediately after Google OAuth. Creates the player row on first login,
// or updates display_name / email if the Google profile changed.
// ─────────────────────────────────────────────────────────────────────────────
export async function upsertPlayerFromAuth(authUser) {
  if (!authUser?.id) throw new Error('upsertPlayerFromAuth: no auth user provided.');

  const display_name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    'Crewmate';

  const email = authUser.email ?? null;

  const { data, error } = await supabase
    .from('players')
    .upsert(
      { auth_id: authUser.id, display_name, email, updated_at: new Date().toISOString() },
      { onConflict: 'auth_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// joinGame (Auth-based)
// After Google OAuth, the player row already exists (upserted by upsertPlayerFromAuth).
// This function creates a new session row and persists the IDs to localStorage.
//
// Pass the Supabase auth user object. The player row is looked up by auth_id.
// ─────────────────────────────────────────────────────────────────────────────
export async function joinGame(authUser) {
  if (!authUser?.id) throw new Error('joinGame: no authenticated user provided.');

  try {
    // 1. Fetch the player row that was created during OAuth callback ----------
    const { data: player, error: playerErr } = await supabase
      .from('players')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (playerErr) throw playerErr;
    if (!player) throw new Error('joinGame: player record not found for this auth user. Was upsertPlayerFromAuth called?');

    // 2. Insert session -------------------------------------------------------
    const { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .insert({ player_id: player.id, logged_in_at: new Date().toISOString() })
      .select()
      .single();

    if (sessionErr) throw sessionErr;
    if (!sessionRow) throw new Error('joinGame: no session row returned after insert.');

    const sessionId = sessionRow.id;

    // 3. Persist to localStorage ----------------------------------------------
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
    localStorage.setItem(SESSION_KEY, sessionId);

    return { player, sessionId };
  } catch (err) {
    console.error('[gameService] joinGame failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// leaveGame
// Stamps logged_out_at + computes duration_secs. Clears localStorage.
// ─────────────────────────────────────────────────────────────────────────────
export async function leaveGame(sessionId) {
  if (!sessionId) return;

  try {
    const { data: sessionRow, error: fetchErr } = await supabase
      .from('sessions')
      .select('logged_in_at')
      .eq('id', sessionId)
      .single();

    if (fetchErr) throw fetchErr;

    const loggedInAt = sessionRow?.logged_in_at ? new Date(sessionRow.logged_in_at) : new Date();
    const loggedOutAt = new Date();
    const durationSecs = Math.round((loggedOutAt - loggedInAt) / 1000);

    const { error: updateErr } = await supabase
      .from('sessions')
      .update({ logged_out_at: loggedOutAt.toISOString(), duration_secs: durationSecs })
      .eq('id', sessionId);

    if (updateErr) throw updateErr;
  } catch (err) {
    // Best-effort on tab close — don't block teardown
    console.error('[gameService] leaveGame failed:', err);
  } finally {
    localStorage.removeItem(PLAYER_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getStoredPlayer
// Restores player + sessionId from localStorage.
// ─────────────────────────────────────────────────────────────────────────────
export function getStoredPlayer() {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    const player = raw ? JSON.parse(raw) : null;
    const sessionId = localStorage.getItem(SESSION_KEY) || null;
    return { player, sessionId };
  } catch {
    return { player: null, sessionId: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordScore  (legacy — kept for compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export async function recordScore(playerId, sessionId, { score, role, survived, tasks_done }) {
  return submitRoundScore(playerId, sessionId, { score, role, survived, tasks_done });
}

// ─────────────────────────────────────────────────────────────────────────────
// submitRoundScore
// Inserts a score row for a specific game round.
// New fields (added via migration_v2.sql): round, time_taken_secs, evidence_text
// ─────────────────────────────────────────────────────────────────────────────
export async function submitRoundScore(playerId, sessionId, {
  score,
  round = null,
  role = null,
  survived = null,
  tasks_done = 0,
  time_taken_secs = null,
  evidence_text = null,
}) {
  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        player_id: playerId,
        session_id: sessionId,
        score,
        round,
        role,
        survived: survived != null ? !!survived : null,
        tasks_done: tasks_done ?? 0,
        time_taken_secs,
        evidence_text,
        recorded_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (err) {
    console.error('[gameService] submitRoundScore failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchLeaderboard
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchLeaderboard(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('admin_player_summary')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[gameService] fetchLeaderboard error:', error);
      throw error;
    }
    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchLeaderboard failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchAdminSummary
// BUG NOTE: If this returns empty even though players exist, the most likely
// cause is missing GRANT SELECT on admin_player_summary to anon/authenticated,
// OR RLS on the underlying players table. See migration_v2.sql.
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAdminSummary() {
  try {
    const { data, error } = await supabase
      .from('admin_player_summary')
      .select('*')
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('[gameService] fetchAdminSummary error (code:', error.code, '):', error.message);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('[gameService] fetchAdminSummary returned 0 rows. Check: (1) VIEW grants, (2) RLS on players table, (3) view column names match query. See migration_v2.sql.');
    }

    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchAdminSummary failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchAllSessions
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAllSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, logged_in_at, logged_out_at, duration_secs, players ( display_name, email )')
      .order('logged_in_at', { ascending: false });

    if (error) {
      console.error('[gameService] fetchAllSessions error:', error);
      throw error;
    }
    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchAllSessions failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchAllScores
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAllScores() {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, round, role, survived, tasks_done, time_taken_secs, evidence_text, recorded_at, players ( display_name, email )')
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('[gameService] fetchAllScores error:', error);
      throw error;
    }
    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchAllScores failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchScoreboardData
// Returns all score rows joined with player names, for the admin scoreboard.
// Aggregation (per-round breakdown, totals) is done client-side.
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchScoreboardData() {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id, player_id, score, round, time_taken_secs, recorded_at,
        players ( id, display_name, email )
      `)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('[gameService] fetchScoreboardData error:', error);
      throw error;
    }
    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchScoreboardData failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchAuditLog
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAuditLog(limit = 500) {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[gameService] fetchAuditLog error:', error);
      throw error;
    }
    return data ?? [];
  } catch (err) {
    console.error('[gameService] fetchAuditLog failed:', err);
    throw err;
  }
}
