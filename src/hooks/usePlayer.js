/**
 * src/hooks/usePlayer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook that manages the full player session lifecycle for
 * WIE2026 – Crewmate Protocol.
 *
 * Exposes:
 *   { player, sessionId, loading, error, join, leave, submitScore }
 *
 * Usage:
 *   const { player, join, leave, submitScore } = usePlayer();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { joinGame, leaveGame, getStoredPlayer, recordScore, upsertPlayerFromAuth } from '../lib/gameService.js';
import { onAuthChange } from '../lib/auth.js';

export default function usePlayer() {
  const [player,    setPlayer]    = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading,   setLoading]   = useState(true);   // true during initial restore
  const [error,     setError]     = useState(null);

  // Keep a ref to sessionId so the beforeunload listener always sees latest value
  const sessionRef = useRef(sessionId);
  useEffect(() => { sessionRef.current = sessionId; }, [sessionId]);

  // ── Restore from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const { player: storedPlayer, sessionId: storedSession } = getStoredPlayer();
    if (storedPlayer && storedSession) {
      setPlayer(storedPlayer);
      setSessionId(storedSession);
    }
    setLoading(false);
  }, []);

  // ── React to live Supabase auth session (handles post-OAuth-callback state) ──
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      // Only act if we have a Google auth user but no game player yet
      if (!authUser) return;
      const { player: storedPlayer } = getStoredPlayer();
      if (storedPlayer) return; // already have a player, nothing to do

      try {
        await upsertPlayerFromAuth(authUser);
        const result = await joinGame(authUser);
        setPlayer(result.player);
        setSessionId(result.sessionId);
      } catch (err) {
        console.error('[usePlayer] auto-join from auth session failed:', err);
        // Non-fatal: the JoinGame screen will still show the Google button
      }
    });
    return unsubscribe;
  }, []);

  // ── Call leaveGame when the browser tab/window closes ────────────────────
  useEffect(() => {
    function handleBeforeUnload() {
      if (sessionRef.current) {
        // Use sendBeacon for a best-effort fire-and-forget on page unload.
        // Since Supabase uses fetch (which may be cancelled), we call leaveGame
        // synchronously but accept that it may not always complete.
        leaveGame(sessionRef.current);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── join ──────────────────────────────────────────────────────────────────
  // Accepts either:
  //   join(authUser)              — new Google OAuth flow (authUser.id is present)
  //   join(displayName, email)    — legacy manual flow (not used in new GameFlow)
  const join = useCallback(async (authUserOrName, email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await joinGame(authUserOrName);
      setPlayer(result.player);
      setSessionId(result.sessionId);
      return result;
    } catch (err) {
      setError(err.message ?? 'Failed to join game.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── leave ─────────────────────────────────────────────────────────────────
  const leave = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await leaveGame(sessionId);
    } catch (err) {
      setError(err.message ?? 'Failed to leave game.');
    } finally {
      setPlayer(null);
      setSessionId(null);
      setLoading(false);
    }
  }, [sessionId]);

  // ── submitScore ───────────────────────────────────────────────────────────
  /**
   * @param {{ score: number, role: string, survived: boolean, tasks_done: number }} opts
   */
  const submitScore = useCallback(async (opts) => {
    if (!player?.id || !sessionId) {
      throw new Error('Cannot submit score: no active player/session.');
    }
    setError(null);
    try {
      await recordScore(player.id, sessionId, opts);
    } catch (err) {
      setError(err.message ?? 'Failed to submit score.');
      throw err;
    }
  }, [player, sessionId]);

  return { player, sessionId, loading, error, join, leave, submitScore };
}
