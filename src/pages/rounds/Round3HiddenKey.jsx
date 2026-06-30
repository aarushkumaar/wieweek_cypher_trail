/**
 * src/pages/rounds/Round3HiddenKey.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 3 – Beneath the Interface
 *
 * Mechanic: "Same logic as Among Us hidden key"
 * A SKELD-9 ship map is displayed. A tiny hidden crewmate is tucked in a
 * specific room. When the player clicks it, an access key is revealed.
 * Player types the key to proceed. 10 pts if correct.
 *
 * ⚠️  REPLACE PLACEHOLDER VALUES:
 *     - HIDDEN_KEY below: set this to the actual key from the Google Doc
 *     - The crewmate's position: adjust `hiddenStyle` top/left percentages
 *       to match wherever your team decides to hide it on the ship image
 *     - The ship background image: place it at public/images/ship-map.png
 *       (currently falls back to a CSS-drawn schematic if the image is missing)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUND_NAMES, startRoundTimer, endRoundTimer, markRoundComplete, getRoundElapsed, formatSecondsDisplay } from '../../lib/scoringEngine.js';
import { submitRoundScore } from '../../lib/gameService.js';

const ROUND_NAME = ROUND_NAMES.ROUND3;

// ⚠️ Replace with the actual key from the Google Doc
const HIDDEN_KEY = 'SKELD9';

// Position of the hidden crewmate on the map (percentage of container)
const HIDDEN_TOP = '62%';   // ⚠️ Adjust to match your ship image
const HIDDEN_LEFT = '34%';   // ⚠️ Adjust to match your ship image

const S = {
    root: {
        minHeight: '100vh', background: '#0d0f1a',
        fontFamily: "'Space Grotesk','Segoe UI',sans-serif",
        color: '#f1f5f9', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '2rem 1rem',
    },
    topLabel: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
        color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem',
    },
    heading: {
        fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9',
        marginBottom: '0.4rem', textAlign: 'center', letterSpacing: '-0.02em',
    },
    narrative: {
        fontSize: '0.88rem', color: '#94a3b8', textAlign: 'center',
        maxWidth: 500, lineHeight: 1.6, marginBottom: '1.5rem',
    },
    timerRow: {
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
    },
    timer: {
        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '0.5rem', padding: '0.3rem 0.75rem',
        fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa',
    },
    mapFrame: {
        position: 'relative', width: '100%', maxWidth: 680, aspectRatio: '16/9',
        background: '#0a0c16',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        marginBottom: '1.5rem', cursor: 'crosshair',
    },
    mapBg: {
        width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0.85,
    },
    // CSS-drawn ship schematic rooms (shown when no image is available)
    room: (top, left, w, h, label) => ({
        position: 'absolute', top, left, width: w, height: h,
        border: '1px solid rgba(56,189,248,0.25)',
        background: 'rgba(56,189,248,0.04)',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.55rem', color: 'rgba(56,189,248,0.4)',
        letterSpacing: '0.06em', textTransform: 'uppercase',
    }),
    hidden: (found) => ({
        position: 'absolute',
        top: HIDDEN_TOP, left: HIDDEN_LEFT,
        width: found ? 20 : 14,
        height: found ? 24 : 18,
        cursor: 'pointer',
        transition: 'all 0.2s',
        filter: found ? 'drop-shadow(0 0 8px #22c55e)' : 'opacity(0.08)',
        zIndex: 5,
    }),
    revealBox: {
        width: '100%', maxWidth: 480, textAlign: 'center',
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)',
        borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem',
        animation: 'fadeIn 0.4s ease',
    },
    keyDisplay: {
        fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 800,
        letterSpacing: '0.4em', color: '#4ade80',
        margin: '0.75rem 0', textShadow: '0 0 20px rgba(34,197,94,0.5)',
    },
    inputArea: { width: '100%', maxWidth: 420, textAlign: 'center' },
    keyInput: {
        width: '100%', padding: '0.9rem',
        background: 'rgba(30,34,53,0.9)', border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '0.75rem', color: '#f1f5f9', fontSize: '1.4rem',
        fontFamily: 'monospace', textAlign: 'center', outline: 'none',
        letterSpacing: '0.3em', textTransform: 'uppercase',
        marginBottom: '0.75rem',
    },
    submitBtn: {
        width: '100%', padding: '0.85rem',
        background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
        color: '#fff', border: 'none', borderRadius: '0.75rem',
        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    },
    continueBtn: {
        padding: '0.9rem 2.5rem',
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        color: '#fff', border: 'none', borderRadius: '0.75rem',
        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
    },
    errorBox: {
        padding: '0.65rem 0.9rem', marginTop: '0.75rem',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.84rem',
    },
};

// SVG crewmate silhouette
function CrewSVG({ found }) {
    return (
        <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}>
            <ellipse cx="20" cy="32" rx="14" ry="12" fill={found ? '#22c55e' : '#1e293b'} />
            <ellipse cx="20" cy="16" rx="11" ry="11" fill={found ? '#1e293b' : '#0f172a'} />
            <ellipse cx="20" cy="16" rx="8" ry="7" fill={found ? '#38bdf8' : '#1e293b'} opacity="0.9" />
            <ellipse cx="16" cy="13" rx="2.5" ry="2" fill="white" opacity={found ? 0.4 : 0} />
            <rect x="30" y="24" width="7" height="9" rx="3" fill={found ? '#16a34a' : '#0f172a'} />
        </svg>
    );
}

// Simple rooms drawn with CSS (replace with ship-map.png for production)
function ShipSchematic() {
    const rooms = [
        { top: '5%', left: '5%', w: '28%', h: '35%', label: 'CAFETERIA' },
        { top: '5%', left: '38%', w: '24%', h: '20%', label: 'WEAPONS' },
        { top: '5%', left: '67%', w: '28%', h: '20%', label: 'NAVIGATION' },
        { top: '30%', left: '67%', w: '28%', h: '30%', label: 'SHIELDS' },
        { top: '45%', left: '38%', w: '24%', h: '30%', label: 'ADMIN' },
        { top: '45%', left: '5%', w: '28%', h: '45%', label: 'STORAGE' },
        { top: '65%', left: '38%', w: '55%', h: '25%', label: 'REACTOR' },
    ];
    return (
        <>
            {rooms.map((r, i) => (
                <div key={i} style={S.room(r.top, r.left, r.w, r.h, r.label)}>
                    {r.label}
                </div>
            ))}
            {/* Corridors */}
            <div style={{
                position: 'absolute', top: '35%', left: '5%', width: '57%', height: '10%',
                borderTop: '1px solid rgba(56,189,248,0.15)', borderBottom: '1px solid rgba(56,189,248,0.15)',
                background: 'rgba(56,189,248,0.02)'
            }} />
            <div style={{
                position: 'absolute', top: '30%', left: '62%', width: '5%', height: '35%',
                borderLeft: '1px solid rgba(56,189,248,0.15)', borderRight: '1px solid rgba(56,189,248,0.15)',
                background: 'rgba(56,189,248,0.02)'
            }} />
            <div style={{
                position: 'absolute', top: '60%', left: '33%', width: '5%', height: '30%',
                borderLeft: '1px solid rgba(56,189,248,0.15)', borderRight: '1px solid rgba(56,189,248,0.15)',
                background: 'rgba(56,189,248,0.02)'
            }} />
        </>
    );
}

export default function Round3HiddenKey({ playerId, sessionId, onComplete }) {
    const [found, setFound] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [phase, setPhase] = useState('search'); // search | enter | done
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState('');
    const timerRef = useRef(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        startRoundTimer(ROUND_NAME);
        timerRef.current = setInterval(() => setElapsed(getRoundElapsed(ROUND_NAME)), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    // Inject fadeIn keyframe
    useEffect(() => {
        if (!document.getElementById('r3-kf')) {
            const el = document.createElement('style');
            el.id = 'r3-kf';
            el.textContent = '@keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }';
            document.head.appendChild(el);
        }
    }, []);

    function handleCrewClick(e) {
        e.stopPropagation();
        if (!found) {
            setFound(true);
            setPhase('enter');
        }
    }

    async function handleKeySubmit() {
        const passed = keyInput.trim().toUpperCase() === HIDDEN_KEY.toUpperCase();
        const score = passed ? 10 : 0;

        setSubmitting(true);
        setSubmitErr('');
        try {
            const timeTaken = endRoundTimer(ROUND_NAME);
            await submitRoundScore(playerId, sessionId, {
                score, round: ROUND_NAME, time_taken_secs: timeTaken,
                role: 'crewmate', survived: passed,
            });
            markRoundComplete(ROUND_NAME);
            setResult(passed ? 'pass' : 'fail');
            setPhase('done');
            if (passed) setTimeout(() => onComplete?.({ score, timeTaken }), 1600);
        } catch (err) {
            setSubmitErr(err.message ?? 'Submission failed. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={S.root}>
            <p style={S.topLabel}>Round 3 · Beneath the Interface</p>
            <h1 style={S.heading}>Find the Hidden Key</h1>
            <p style={S.narrative}>
                A rogue process has hidden an access key somewhere aboard SKELD-9.<br />
                Search the ship's systems carefully. <strong style={{ color: '#a78bfa' }}>
                    {found ? 'You found it! Enter the key below.' : 'Click to investigate each area.'}
                </strong>
            </p>

            <div style={S.timerRow}>
                <div style={S.timer}>⏱ {formatSecondsDisplay(elapsed)}</div>
                {!found && <span style={{ fontSize: '0.8rem', color: '#475569' }}>Search every room…</span>}
            </div>

            {/* Ship map */}
            <div style={S.mapFrame}>
                {!imgError && (
                    <img
                        src="/images/ship-map.png"
                        alt="SKELD-9 ship map"
                        style={S.mapBg}
                        onError={() => setImgError(true)}
                    />
                )}
                {imgError && <ShipSchematic />}

                {/* Hidden crewmate */}
                <div style={S.hidden(found)} onClick={handleCrewClick} title={found ? 'Found!' : ''}>
                    <CrewSVG found={found} />
                </div>
            </div>

            {/* Key reveal */}
            {found && phase !== 'done' && (
                <div style={S.revealBox}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        🔑 Access Key Recovered
                    </p>
                    <div style={S.keyDisplay}>{HIDDEN_KEY}</div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        Memorise or note this key. Enter it below.
                    </p>
                </div>
            )}

            {/* Key entry */}
            {phase === 'enter' && (
                <div style={S.inputArea}>
                    <input
                        style={S.keyInput}
                        type="text"
                        value={keyInput}
                        onChange={e => setKeyInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !submitting && handleKeySubmit()}
                        placeholder="______"
                        maxLength={10}
                        autoFocus
                    />
                    {submitErr && <div style={S.errorBox}>⚠️ {submitErr}</div>}
                    <button style={S.submitBtn} onClick={handleKeySubmit} disabled={submitting || !keyInput.trim()}>
                        {submitting ? 'Verifying…' : '🔐 Verify Key'}
                    </button>
                </div>
            )}

            {/* Result */}
            {phase === 'done' && (
                <div style={{ textAlign: 'center' }}>
                    {result === 'pass' && (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                            <p style={{ color: '#4ade80', fontWeight: 700 }}>Access Granted. +10 points. Proceeding…</p>
                        </>
                    )}
                    {result === 'fail' && (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❌</div>
                            <p style={{ color: '#f87171', fontWeight: 700 }}>Incorrect key. 0 points recorded.</p>
                            <button style={S.continueBtn} onClick={() => onComplete?.({ score: 0 })}>
                                Continue →
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}