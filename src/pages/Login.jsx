/**
 * src/pages/Login.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WIE Week 2026 — Google OAuth login page.
 *
 * Uses signInWithGoogle() from lib/auth.js which redirects to
 * /auth/callback after a successful Google sign-in.
 */

import { useState } from 'react';
import { signInWithGoogle } from '../lib/auth.js';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // Browser navigates away — nothing below runs on success
    } catch (err) {
      console.error('[Login] sign-in error:', err);
      setError(err.message ?? 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated background grid */}
      <div style={styles.grid} aria-hidden="true" />

      <div style={styles.card}>
        {/* Logo / icon */}
        <div style={styles.icon}>🚀</div>

        <h1 style={styles.title}>WIE Week 2026</h1>
        <p style={styles.sub}>The Cypher Trail — sign in to begin the challenge</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            ⚠️ {error}
          </div>
        )}

        <button
          id="btn-google-signin"
          onClick={handleSignIn}
          disabled={loading}
          style={{
            ...styles.btn,
            opacity: loading ? 0.7 : 1,
            cursor:  loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={styles.spinner} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing you in…' : 'Continue with Google'}
        </button>

        <p style={styles.hint}>
          Only registered participants may access the game.
        </p>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(74,222,128,0.05) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(74,222,128,0.05) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(15,23,42,0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(74,222,128,0.25)',
    borderRadius: '1.5rem',
    padding: '3rem 2.5rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.1)',
  },
  icon: {
    fontSize: '2.5rem',
    marginBottom: '0.25rem',
  },
  title: {
    margin: 0,
    fontSize: '1.9rem',
    fontWeight: 800,
    color: '#f0fdf4',
    letterSpacing: '-0.03em',
    textAlign: 'center',
  },
  sub: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: '0.5rem',
  },
  errorBox: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#fca5a5',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    width: '100%',
    padding: '0.85rem 1.5rem',
    background: '#fff',
    color: '#1e293b',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    fontWeight: 700,
    border: 'none',
    borderRadius: '0.875rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginTop: '0.5rem',
  },
  spinner: {
    display: 'inline-block',
    width: 18,
    height: 18,
    border: '3px solid rgba(30,41,59,0.25)',
    borderTopColor: '#1e293b',
    borderRadius: '50%',
    animation: 'login-spin 0.8s linear infinite',
  },
  hint: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#334155',
    textAlign: 'center',
    marginTop: '0.25rem',
  },
};

// Inject spinner keyframes once
if (typeof document !== 'undefined' && !document.getElementById('login-spin-kf')) {
  const el = document.createElement('style');
  el.id = 'login-spin-kf';
  el.textContent = '@keyframes login-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(el);
}
