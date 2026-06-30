/**
 * src/pages/AuthCallback.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the OAuth redirect that Supabase sends back to /auth/callback after
 * a successful Google sign-in.
 *
 * Steps:
 *   1. handleAuthCallback() — exchanges the code/token in the URL for a session
 *   2. upsertPlayerFromAuth() — creates or updates the players table row
 *   3. joinGame() — creates a session row and stores player in localStorage
 *   4. navigate('/') — sends the user back into the game
 *
 * On any error the user sees a clear message with a retry link.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../lib/auth.js';
import { upsertPlayerFromAuth, joinGame } from '../lib/gameService.js';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'error'
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        // 1. Get the auth user from the current Supabase session
        const authUser = await handleAuthCallback();
        if (!authUser) throw new Error('No authenticated user returned from Google. Please try again.');

        // 2. Create / update the player row in our DB
        await upsertPlayerFromAuth(authUser);

        // 3. Create a game session row + persist to localStorage
        await joinGame(authUser);

        // 4. Navigate back into the game
        if (!cancelled) navigate('/game?play=1', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] failed:', err);
        if (!cancelled) {
          setErrMsg(err.message ?? 'Something went wrong during sign-in.');
          setStatus('error');
        }
      }
    }

    finish();
    return () => { cancelled = true; };
  }, [navigate]);

  /* ── Loading state ─────────────────────────────────────────────────────── */
  if (status === 'loading') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <div style={styles.title}>Boarding the Ship…</div>
          <div style={styles.sub}>Setting up your crew profile. Please wait.</div>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────────── */
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
        <div style={styles.title}>Sign-In Failed</div>
        <div style={{ ...styles.sub, color: '#fca5a5', marginBottom: '1.5rem' }}>{errMsg}</div>
        <a href="/" style={styles.retryBtn}>← Try Again</a>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
  },
  card: {
    background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(74,222,128,0.2)', borderRadius: '1.5rem',
    padding: '3rem 2.5rem', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  spinner: {
    width: 48, height: 48, marginBottom: '1rem',
    border: '4px solid rgba(74,222,128,0.15)',
    borderTopColor: '#4ade80', borderRadius: '50%',
    animation: 'ac-spin 0.9s linear infinite',
  },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#f0fdf4', letterSpacing: '-0.02em' },
  sub: { fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 },
  retryBtn: {
    marginTop: '0.5rem', display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
    color: '#fff', textDecoration: 'none',
    borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem',
    boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
  },
};

// Spinner keyframe
if (typeof document !== 'undefined' && !document.getElementById('ac-spin-kf')) {
  const el = document.createElement('style');
  el.id = 'ac-spin-kf';
  el.textContent = '@keyframes ac-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(el);
}
