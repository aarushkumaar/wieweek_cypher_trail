/**
 * src/lib/PlayerContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React context that makes player session state available throughout the
 * entire app tree without prop-drilling.
 *
 * Usage:
 *   // Wrap your app (done in App.jsx):
 *   <PlayerProvider>
 *     <YourApp />
 *   </PlayerProvider>
 *
 *   // Anywhere inside:
 *   const { player, join, leave, submitScore } = usePlayerContext();
 */

import { createContext, useContext } from 'react';
import usePlayer from '../hooks/usePlayer.js';

// ── Context ───────────────────────────────────────────────────────────────────
const PlayerContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
/**
 * Wrap the root of your app with this provider.
 * @param {{ children: import('react').ReactNode }} props
 */
export function PlayerProvider({ children }) {
  const playerState = usePlayer();
  return (
    <PlayerContext.Provider value={playerState}>
      {children}
    </PlayerContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
/**
 * Returns { player, sessionId, loading, error, join, leave, submitScore }.
 * Must be called inside a <PlayerProvider> tree.
 */
export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (ctx === null) {
    throw new Error(
      'usePlayerContext must be used inside a <PlayerProvider>. ' +
      'Make sure your App is wrapped with <PlayerProvider>.'
    );
  }
  return ctx;
}

export default PlayerContext;
