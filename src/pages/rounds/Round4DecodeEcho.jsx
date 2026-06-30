/**
 * src/pages/rounds/Round4DecodeEcho.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 4 – Decode the Echo
 *
 * Flow:
 *  1. Map traversal — click 4 rooms on the ship map to collect puzzle pieces
 *  2. Puzzle assembly — collected pieces reveal a QR code image
 *  3. QR code leads to a reversed audio clip (displayed + playable inline)
 *  4. Player types the one-word answer from the reversed audio
 *  5. 10 pts if correct
 *
 * ⚠️  ASSETS NEEDED — place these in your /public folder:
 *     - /public/images/round4-qr.png      (the QR code image)
 *     - /public/audio/round4-reversed.mp3 (the reversed audio clip)
 *
 * ⚠️  REPLACE PLACEHOLDER:
 *     - AUDIO_ANSWER below: set this to the actual word the reversed audio spells
 *     - ROOM_PIECES: adjust room positions/names to match your ship image
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUND_NAMES, startRoundTimer, endRoundTimer, markRoundComplete, getRoundElapsed, formatSecondsDisplay } from '../../lib/scoringEngine.js';
import { submitRoundScore } from '../../lib/gameService.js';

const ROUND_NAME = ROUND_NAMES.ROUND4;

// ⚠️ Replace with the actual word answer from the reversed audio
const AUDIO_ANSWER = 'nebula';

// Map rooms — each must be visited to collect a puzzle piece
// Adjust top/left/label to match your ship map image
const ROOM_PIECES = [
    { id: 'cafeteria', label: 'Cafeteria', top: '12%', left: '8%', icon: '☕', pieceLabel: 'PIECE ALPHA' },
    { id: 'weapons', label: 'Weapons', top: '12%', left: '40%', icon: '🔫', pieceLabel: 'PIECE BETA' },
    { id: 'shields', label: 'Shields', top: '40%', left: '68%', icon: '🛡️', pieceLabel: 'PIECE GAMMA' },
    { id: 'reactor', label: 'Reactor', top: '70%', left: '40%', icon: '⚛️', pieceLabel: 'PIECE DELTA' },
];

const S = {
    root: {
        minHeight: '100vh', background: '#0d0f1a',
        fontFamily: "'Space Grotesk','Segoe UI',sans-serif",
        color: '#f1f5f9', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '2rem 1rem 4rem',
    },
    topLabel: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
        color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem',
        textAlign: 'center',
    },
    heading: {
        fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em',
        color: '#f1f5f9', marginBottom: '0.4rem', textAlign: 'center',
    },
    narrative: {
        fontSize: '0.88rem', color: '#94a3b8', maxWidth: 520,
        lineHeight: 1.6, marginBottom: '1.25rem', textAlign: 'center',
    },
    timerRow: {
        display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem',
    },
    timer: {
        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '0.5rem', padding: '0.3rem 0.75rem',
        fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa',
    },
    piecesBar: {
        display: 'flex', gap: '0.5rem', alignItems: 'center',
        marginBottom: '1.25rem',
    },
    pieceChip: (collected) => ({
        padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
        background: collected ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${collected ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: collected ? '#4ade80' : '#475569',
        transition: 'all 0.2s',
    }),

    // Map
    mapFrame: {
        position: 'relative', width: '100%', maxWidth: 680, aspectRatio: '16/9',
        background: '#0a0c16', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)', marginBottom: '1.5rem',
    },
    mapBg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 },
    roomBtn: (collected) => ({
        position: 'absolute',
        background: collected ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.18)',
        border: `1px solid ${collected ? 'rgba(34,197,94,0.6)' : 'rgba(124,58,237,0.5)'}`,
        borderRadius: '0.6rem', padding: '0.4rem 0.65rem',
        cursor: collected ? 'default' : 'pointer',
        fontSize: '0.72rem', fontWeight: 700, color: collected ? '#4ade80' : '#a78bfa',
        transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '0.2rem',
        boxShadow: collected ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
        animation: collected ? 'none' : 'roomPulse 2s ease-in-out infinite',
        transform: 'translate(-50%,-50%)',
    }),
    roomIcon: { fontSize: '1.2rem' },
    roomLabel: { fontSize: '0.6rem', letterSpacing: '0.06em' },

    // Puzzle / QR reveal
    puzzleWrap: {
        width: '100%', maxWidth: 480, textAlign: 'center',
        background: 'rgba(22,25,39,0.9)', border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '1.25rem', padding: '2rem 1.5rem', marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    qrImage: {
        width: '100%', maxWidth: 240, margin: '1rem auto',
        border: '3px solid rgba(124,58,237,0.3)', borderRadius: '0.75rem',
        display: 'block',
    },
    audioCard: {
        background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: '0.75rem', padding: '1rem', marginTop: '1rem',
    },
    audioLabel: {
        fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem',
    },
    audioPlayer: { width: '100%', outline: 'none' },
    answerInput: {
        width: '100%', padding: '0.85rem',
        background: 'rgba(30,34,53,0.9)', border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '0.75rem', color: '#f1f5f9', fontSize: '1.1rem',
        fontFamily: 'monospace', textAlign: 'center', outline: 'none',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        marginTop: '1rem', marginBottom: '0.75rem',
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

// CSS-drawn fallback schematic rooms
function MapFallback({ collected, onCollect }) {
    return (
        <>
            {/* Corridors */}
            <div style={{
                position: 'absolute', top: '35%', left: '5%', width: '90%', height: '5%',
                borderTop: '1px solid rgba(56,189,248,0.1)', background: 'rgba(56,189,248,0.02)'
            }} />
            <div style={{
                position: 'absolute', top: '5%', left: '48%', width: '4%', height: '90%',
                borderLeft: '1px solid rgba(56,189,248,0.1)', background: 'rgba(56,189,248,0.02)'
            }} />
            {/* Room buttons */}
            {ROOM_PIECES.map(r => (
                <button
                    key={r.id}
                    style={{ ...S.roomBtn(collected.includes(r.id)), top: r.top, left: r.left }}
                    onClick={() => !collected.includes(r.id) && onCollect(r.id)}
                    disabled={collected.includes(r.id)}
                >
                    <span style={S.roomIcon}>{r.icon}</span>
                    <span style={S.roomLabel}>{r.label}</span>
                    {collected.includes(r.id) && <span style={{ fontSize: '0.65rem' }}>✓ {r.pieceLabel}</span>}
                </button>
            ))}
        </>
    );
}

export default function Round4DecodeEcho({ playerId, sessionId, onComplete }) {
    const [collected, setCollected] = useState([]);
    const [phase, setPhase] = useState('map');    // map | puzzle | done
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState('');
    const [imgError, setImgError] = useState(false);
    const timerRef = useRef(null);
    const allPieces = ROOM_PIECES.map(r => r.id);

    useEffect(() => {
        startRoundTimer(ROUND_NAME);
        timerRef.current = setInterval(() => setElapsed(getRoundElapsed(ROUND_NAME)), 1000);
        if (!document.getElementById('r4-kf')) {
            const el = document.createElement('style');
            el.id = 'r4-kf';
            el.textContent = `
        @keyframes roomPulse { 0%,100%{box-shadow:0 0 0 rgba(124,58,237,0)} 50%{box-shadow:0 0 12px rgba(124,58,237,0.4)} }
        @keyframes r4fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `;
            document.head.appendChild(el);
        }
        return () => clearInterval(timerRef.current);
    }, []);

    function collectPiece(id) {
        const next = [...collected, id];
        setCollected(next);
        if (next.length === allPieces.length) {
            setTimeout(() => setPhase('puzzle'), 600);
        }
    }

    const handleSubmit = useCallback(async () => {
        const passed = answer.trim().toUpperCase() === AUDIO_ANSWER.toUpperCase();
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
    }, [answer, playerId, sessionId, onComplete]);

    return (
        <div style={S.root}>
            <p style={S.topLabel}>Round 4 · Decode the Echo</p>
            <h1 style={S.heading}>
                {phase === 'map' && 'Traverse the Ship'}
                {phase === 'puzzle' && 'Puzzle Assembled — Decode the Signal'}
                {phase === 'done' && (result === 'pass' ? 'Echo Decoded!' : 'Transmission Lost')}
            </h1>
            <p style={S.narrative}>
                {phase === 'map' && 'Visit all 4 rooms to collect the fragmented signal pieces. Each room holds one piece of the decryption puzzle.'}
                {phase === 'puzzle' && 'The puzzle reveals a QR code. Scan it to find the reversed audio clip. Listen carefully — then type the hidden word.'}
                {phase === 'done' && ''}
            </p>

            <div style={S.timerRow}>
                <div style={S.timer}>⏱ {formatSecondsDisplay(elapsed)}</div>
                {phase === 'map' && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {collected.length} / {allPieces.length} pieces collected
                    </span>
                )}
            </div>

            {/* Piece progress chips */}
            {phase === 'map' && (
                <div style={S.piecesBar}>
                    {ROOM_PIECES.map(r => (
                        <span key={r.id} style={S.pieceChip(collected.includes(r.id))}>
                            {collected.includes(r.id) ? '✓' : '○'} {r.pieceLabel}
                        </span>
                    ))}
                </div>
            )}

            {/* Map */}
            {phase === 'map' && (
                <div style={S.mapFrame}>
                    {!imgError && (
                        <img src="/images/ship-map.png" alt="SKELD-9" style={S.mapBg}
                            onError={() => setImgError(true)} />
                    )}
                    <MapFallback collected={collected} onCollect={collectPiece} />
                </div>
            )}

            {/* Puzzle / QR reveal */}
            {phase === 'puzzle' && (
                <div style={{ ...S.puzzleWrap, animation: 'r4fade 0.4s ease' }}>
                    <p style={{
                        fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem'
                    }}>
                        🧩 Puzzle Assembled — QR Code Revealed
                    </p>

                    {/* QR Code image — place at /public/images/round4-qr.png */}
                    <img
                        src="/images/round4-qr.png"
                        alt="Decryption QR Code"
                        style={S.qrImage}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.25rem 0 0' }}>
                        ⚠️ Place QR image at <code>/public/images/round4-qr.png</code>
                    </p>

                    {/* Audio player — place clip at /public/audio/round4-reversed.mp3 */}
                    <div style={S.audioCard}>
                        <div style={S.audioLabel}>🔊 Reversed Audio Signal</div>
                        <audio controls style={S.audioPlayer} preload="none">
                            <source src="/audio/round4-reversed.mp3" type="audio/mpeg" />
                            <source src="/audio/round4-reversed.ogg" type="audio/ogg" />
                            Your browser doesn't support the audio element.
                        </audio>
                        <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.5rem' }}>
                            Place audio at <code>/public/audio/round4-reversed.mp3</code>
                        </p>
                    </div>

                    <input
                        style={S.answerInput}
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !submitting && handleSubmit()}
                        placeholder="Type the hidden word…"
                        autoFocus
                        disabled={submitting}
                    />
                    {submitErr && <div style={S.errorBox}>⚠️ {submitErr}</div>}
                    <button style={S.submitBtn} onClick={handleSubmit}
                        disabled={submitting || !answer.trim()}>
                        {submitting ? 'Decoding…' : '📡 Transmit Answer'}
                    </button>
                </div>
            )}

            {/* Result */}
            {phase === 'done' && (
                <div style={{ textAlign: 'center', animation: 'r4fade 0.4s ease' }}>
                    {result === 'pass' && (
                        <>
                            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>✅</div>
                            <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.1rem' }}>
                                Echo decoded. +10 points. Proceeding to next task…
                            </p>
                        </>
                    )}
                    {result === 'fail' && (
                        <>
                            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>❌</div>
                            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                                Incorrect answer. 0 points recorded.
                            </p>
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