/**
 * src/components/JoinGame.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Board the Ship" screen — Google OAuth entry point.
 *
 * Flow:
 *   1. On mount — if player is already in context (restored from localStorage
 *      after a previous OAuth cycle), call onJoined() immediately.
 *   2. Otherwise — show the "Sign in with Google" button which triggers
 *      signInWithGoogle() → browser redirects to Google → returns to
 *      /auth/callback → AuthCallback.jsx handles the rest.
 *
 * Props:
 *   onJoined() — called when a valid player session already exists.
 */

import { useEffect, useRef, useState } from 'react';
import { usePlayerContext } from '../lib/PlayerContext.jsx';
import { signInWithGoogle, getAuthUser } from '../lib/auth.js';

/* ── Tiny inline starfield ───────────────────────────────────────────── */
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2, a: Math.random(), speed: Math.random() * 0.005 + 0.002,
    }));
    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.a += s.speed;
        const alpha = (Math.sin(s.a) + 1) / 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${alpha * 0.8})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Google "G" logo SVG ────────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.2z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.5 42.9 14.7 48 24 48z"/>
      <path fill="#FBBC05" d="M10.8 28.8C10.3 27.4 10 25.7 10 24s.3-3.4.8-4.8v-6.2H2.6C.9 16.3 0 20 0 24s.9 7.7 2.6 11l8.2-6.2z"/>
      <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.1 30.5 0 24 0 14.7 0 6.5 5.1 2.6 13l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
    </svg>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function JoinGame({ onJoined }) {
  const { player, leave } = usePlayerContext();
  const [signingIn, setSigningIn] = useState(false);
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(true); // verifying live session
  const advancedRef = useRef(false);

  // Verify there is a live Supabase auth session before auto-advancing.
  // localStorage can hold a stale player from a previous session — we must
  // confirm the OAuth token is still valid before skipping the login screen.
  useEffect(() => {
    if (!player) {
      setChecking(false);
      return;
    }
    getAuthUser().then((authUser) => {
      if (authUser && !advancedRef.current) {
        // Live session confirmed — skip straight into the game
        advancedRef.current = true;
        onJoined?.();
      } else if (!authUser) {
        // Stale localStorage data — clear it and show the sign-in button
        leave?.();
      }
      setChecking(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    setErr('');
    try {
      await signInWithGoogle();
      // Browser navigates away — nothing runs after this
    } catch (e) {
      setErr(e.message ?? 'Sign-in failed. Please try again.');
      setSigningIn(false);
    }
  }

  // Show a spinner while we verify the live Supabase session
  if (checking) {
    return (
      <div style={{ ...styles.wrapper, flexDirection: 'column', gap: '1rem' }}>
        <span style={styles.spinner} />
        <span style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          Checking your session…
        </span>
      </div>
    );
  }

  // Session confirmed and valid — component will unmount as onJoined() advances stage
  if (player) return null;

  return (
    <div style={styles.wrapper}>
      <Starfield />
      <div style={styles.card}>

        {/* Crewmate icon */}
        <div style={styles.iconRow}>
          <svg viewBox="0 0 64 80" style={styles.crewIcon} fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="52" rx="22" ry="20" fill="#4ade80" />
            <ellipse cx="32" cy="25" rx="18" ry="18" fill="#1e293b" />
            <ellipse cx="32" cy="25" rx="14" ry="13" fill="#38bdf8" opacity="0.85" />
            <ellipse cx="26" cy="20" rx="4" ry="3" fill="white" opacity="0.3" />
            <rect x="50" y="38" width="10" height="14" rx="4" fill="#22c55e" />
          </svg>
        </div>

        <h1 style={styles.title}>Board the Ship 🚀</h1>
        <p style={styles.subtitle}>
          Sign in with your Google account to join the<br />
          <span style={styles.accent}>Crewmate Protocol</span> mission.
        </p>

        {err && (
          <div style={styles.errorBox} role="alert">⚠️ {err}</div>
        )}

        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          style={signingIn ? { ...styles.googleBtn, ...styles.googleBtnDisabled } : styles.googleBtn}
        >
          {signingIn ? (
            <><span style={styles.spinner} /> Redirecting to Google…</>
          ) : (
            <><GoogleLogo /> Sign in with Google</>
          )}
        </button>

        <p style={styles.note}>
          Your Google name and email are used only for this session's scoreboard.
        </p>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    position: 'relative', minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    overflow: 'hidden', padding: '1rem',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(74, 222, 128, 0.25)',
    borderRadius: '1.5rem',
    padding: '2.5rem 2rem',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 0 60px rgba(74,222,128,0.08), 0 24px 64px rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  iconRow: { marginBottom: '1rem' },
  crewIcon: { width: 72, height: 72, filter: 'drop-shadow(0 0 12px rgba(74,222,128,0.5))' },
  title: { margin: '0 0 0.25rem', fontSize: '1.9rem', fontWeight: 700, color: '#f0fdf4', letterSpacing: '-0.02em' },
  subtitle: { margin: '0 0 1.75rem', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 },
  accent: { color: '#4ade80', fontWeight: 600 },
  errorBox: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '0.5rem', padding: '0.65rem 0.85rem',
    color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem',
  },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', width: '100%',
    padding: '0.85rem 1.25rem',
    background: '#ffffff', color: '#1e293b',
    border: 'none', borderRadius: '0.75rem',
    fontSize: '0.95rem', fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.01em',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  googleBtnDisabled: { opacity: 0.65, cursor: 'not-allowed', transform: 'none' },
  spinner: {
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(30,41,59,0.3)', borderTopColor: '#1e293b',
    borderRadius: '50%', animation: 'jg-spin 0.8s linear infinite',
  },
  note: { marginTop: '1.25rem', fontSize: '0.72rem', color: '#334155' },
};

// Inject spinner keyframe
if (typeof document !== 'undefined' && !document.getElementById('jg-spin-kf')) {
  const el = document.createElement('style');
  el.id = 'jg-spin-kf';
  el.textContent = '@keyframes jg-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(el);
}
