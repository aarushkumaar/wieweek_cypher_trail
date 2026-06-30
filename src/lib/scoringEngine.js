/**
 * src/lib/scoringEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared scoring constants and helpers for WIE2026 – The Cypher Trail.
 *
 * Consumed by:
 *   - AdminPanel.jsx (ROUND_NAMES, ROUND_MAX_SCORES)
 *   - Round components (MAX_SCORE_* constants)
 */

// ── Round identifier strings ──────────────────────────────────────────────────
// These must match the `round` column values stored in Supabase `scores` table.
export const ROUND_NAMES = {
  ROUND1: 'round1',
  ROUND2: 'round2',
  ROUND3: 'round3',
  ROUND4: 'round4',
  ROUND5: 'round5',
};

// ── Maximum achievable score per round ───────────────────────────────────────
export const ROUND_MAX_SCORES = {
  [ROUND_NAMES.ROUND1]: 20,
  [ROUND_NAMES.ROUND2]: 10,
  [ROUND_NAMES.ROUND3]: 10,
  [ROUND_NAMES.ROUND4]: 10,
  [ROUND_NAMES.ROUND5]: 10,
};

// Total max score across all rounds
export const TOTAL_MAX_SCORE = Object.values(ROUND_MAX_SCORES).reduce(
  (a, b) => a + b,
  0
);

// ── Score calculation helpers ─────────────────────────────────────────────────

/**
 * Clamp a score to its round's maximum.
 * @param {string} roundName - One of ROUND_NAMES values
 * @param {number} raw       - Raw computed score
 * @returns {number}
 */
export function clampScore(roundName, raw) {
  const max = ROUND_MAX_SCORES[roundName] ?? Infinity;
  return Math.max(0, Math.min(raw, max));
}

/**
 * Calculate a time-bonus multiplier (1.0 → 1.5) based on how quickly the
 * round was completed relative to the par time.
 *
 * @param {number} timeTakenSecs  - Actual time the player took
 * @param {number} parSecs        - Expected/average completion time
 * @returns {number} multiplier between 1.0 and 1.5
 */
export function timeBonusMultiplier(timeTakenSecs, parSecs) {
  if (!timeTakenSecs || !parSecs || timeTakenSecs >= parSecs) return 1.0;
  const ratio = timeTakenSecs / parSecs;          // 0 → 1
  return Math.min(1.5, 1 + (1 - ratio) * 0.5);
}

// ── Per-round timer tracking (in-memory) ──────────────────────────────────────
// Stores { startMs } for each round while it's in progress.
const _roundTimers = {};

/**
 * Start the wall-clock timer for a round.
 * Safe to call multiple times — subsequent calls are no-ops if timer is already running.
 * @param {string} roundName - One of ROUND_NAMES values
 */
export function startRoundTimer(roundName) {
  if (!_roundTimers[roundName]) {
    _roundTimers[roundName] = { startMs: Date.now() };
  }
}

/**
 * Stop the timer and return elapsed seconds since startRoundTimer was called.
 * Clears the timer entry so the round can be re-timed if restarted.
 * @param {string} roundName
 * @returns {number} elapsed seconds (integer)
 */
export function endRoundTimer(roundName) {
  const entry = _roundTimers[roundName];
  if (!entry) return 0;
  const elapsedSecs = Math.round((Date.now() - entry.startMs) / 1000);
  delete _roundTimers[roundName];
  return elapsedSecs;
}

/**
 * Returns the number of seconds elapsed since startRoundTimer was called,
 * without stopping the timer. Used to update the live timer display.
 * @param {string} roundName
 * @returns {number} elapsed seconds (integer)
 */
export function getRoundElapsed(roundName) {
  const entry = _roundTimers[roundName];
  if (!entry) return 0;
  return Math.round((Date.now() - entry.startMs) / 1000);
}

// ── sessionStorage progress tracking ─────────────────────────────────────────
const PROGRESS_KEY = 'wie2026_progress';

/** Mark a round as completed in sessionStorage. */
export function markRoundComplete(roundName) {
  const completed = getCompletedRounds();
  if (!completed.includes(roundName)) {
    completed.push(roundName);
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }
}

/** Returns array of completed round names from sessionStorage. */
export function getCompletedRounds() {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Returns true if the given round has been completed. */
export function isRoundComplete(roundName) {
  return getCompletedRounds().includes(roundName);
}

/** Clears all round progress from sessionStorage. */
export function clearProgress() {
  sessionStorage.removeItem(PROGRESS_KEY);
}

// ── Score aggregation (fetches from Supabase) ─────────────────────────────────
import { supabase } from './supabase.js';

/**
 * Fetches all scores for a player and returns { total, byRound }.
 * @param {string} playerId
 * @returns {Promise<{ total: number, byRound: Record<string, number> }>}
 */
export async function calculateTotalScore(playerId) {
  const { data, error } = await supabase
    .from('scores')
    .select('score, round')
    .eq('player_id', playerId);

  if (error) throw error;

  const byRound = {};
  let total = 0;
  for (const row of (data ?? [])) {
    const r = row.round ?? 'unknown';
    byRound[r] = (byRound[r] ?? 0) + (row.score ?? 0);
    total += row.score ?? 0;
  }
  return { total, byRound };
}

/**
 * Formats seconds → "Mm Ss" string.
 * @param {number} secs
 * @returns {string}
 */
export function formatSecondsDisplay(secs) {
  if (!secs && secs !== 0) return '--';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
