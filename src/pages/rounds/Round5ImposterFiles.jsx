/**
 * src/pages/rounds/Round5ImposterFiles.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 5 – The Imposter Files
 *
 * Flow:
 *  1. Player writes one line of evidence accusing their teammate
 *  2. Enters the same 4-digit code from Round 2 within a 3-minute countdown
 *  3. 10 pts if code is correct AND entered within the time limit
 *  4. evidence_text is persisted to Supabase for admin review
 *
 * The correct code is read from sessionStorage key 'wie2026_r2_code',
 * which Round2Coding.jsx saves on successful submission.
 * If not present (e.g. Round 2 was skipped/failed), falls back to a
 * configurable default below.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUND_NAMES, startRoundTimer, endRoundTimer, markRoundComplete, getRoundElapsed, formatSecondsDisplay } from '../../lib/scoringEngine.js';
import { submitRoundScore } from '../../lib/gameService.js';

const ROUND_NAME = ROUND_NAMES.ROUND5;
const ROUND_SECONDS = 3 * 60; // 3-minute countdown
const R2_CODE_KEY = 'wie2026_r2_code';

// Fallback if Round 2 code was never stored (set to a real default if needed)
const FALLBACK_CODE = '0000';

const S = {
    root: {
        minHeight: '100vh', background: '#0d0f1a',
        fontFamily: "'Space Grotesk','Segoe UI',sans-serif",
        color: '#f1f5f9', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '2rem 1rem 4rem',
    },
    topLabel: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
        color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem', textAlign: 'center',
    },
    heading: {
        fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em',
        color: '#f1f5f9', marginBottom: '0.4rem', textAlign: 'center',
    },
    narrative: {
        fontSize: '0.88rem', color: '#94a3b8', maxWidth: 520,
        lineHeight: 1.6, marginBottom: '2rem', textAlign: 'center',
    },
    card: {
        width: '100%', maxWidth: 540,
        background: 'rgba(22,25,39,0.95)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '1.25rem', padding: '2rem 1.75rem',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    },
    // Big countdown timer
    countdown: (urgency) => ({
        textAlign: 'center', marginBottom: '1.75rem',
    }),
    countdownNum: (urgency) => ({
        fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums',
        fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.02em',
        lineHeight: 1,
        color: urgency === 'critical' ? '#f87171' :
            urgency === 'warning' ? '#fbbf24' : '#a78bfa',
        textShadow: urgency === 'critical' ? '0 0 24px rgba(239,68,68,0.6)' :
            urgency === 'warning' ? '0 0 24px rgba(251,191,36,0.4)' :
                '0 0 24px rgba(167,139,250,0.3)',
        transition: 'color 0.5s, text-shadow 0.5s',
    }),
    countdownLabel: {
        fontSize: '0.7rem', letterSpacing: '0.12em', color: '#475569',
        textTransform: 'uppercase', marginTop: '0.25rem',
    },
    sectionLabel: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem',
    },
    evidenceTextarea: {
        width: '100%', padding: '0.85rem 0.9rem',
        background: 'rgba(15,17,26,0.8)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '0.65rem', color: '#f1f5f9', fontSize: '0.95rem',
        fontFamily: "'Space Grotesk',sans-serif", resize: 'none',
        outline: 'none', lineHeight: 1.5, marginBottom: '1.5rem',
        minHeight: 72,
    },
    codeInput: {
        width: '100%', padding: '0.9rem',
        background: 'rgba(15,17,26,0.8)', border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '0.65rem', color: '#f1f5f9',
        fontSize: '2rem', fontFamily: 'monospace', textAlign: 'center',
        outline: 'none', letterSpacing: '0.5em',
        marginBottom: '1rem',
    },
    submitBtn: (disabled) => ({
        width: '100%', padding: '0.9rem',
        background: disabled
            ? 'rgba(239,68,68,0.1)'
            : 'linear-gradient(135deg,#dc2626,#991b1b)',
        color: disabled ? '#64748b' : '#fff',
        border: `1px solid ${disabled ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
        borderRadius: '0.75rem',
        fontSize: '1rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(220,38,38,0.4)',
        transition: 'all 0.2s',
    }),
    expiredBanner: {
        textAlign: 'center', padding: '1.5rem',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '0.75rem', marginTop: '1rem',
        color: '#f87171', fontWeight: 600,
    },
    successBanner: {
        textAlign: 'center', padding: '1.5rem',
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: '0.75rem', marginTop: '1rem',
        color: '#4ade80', fontWeight: 600,
    },
    continueBtn: {
        marginTop: '1.25rem',
        padding: '0.85rem 2.5rem',
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        color: '#fff', border: 'none', borderRadius: '0.75rem',
        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
        display: 'block', margin: '1.25rem auto 0',
    },
    errorBox: {
        padding: '0.65rem 0.9rem', marginTop: '0.75rem',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.84rem',
    },
};

export default function Round5ImposterFiles({ playerId, sessionId, onComplete }) {
    const correctCode = sessionStorage.getItem(R2_CODE_KEY) || FALLBACK_CODE;

    const [evidence, setEvidence] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const [remaining, setRemaining] = useState(ROUND_SECONDS);
    const [expired, setExpired] = useState(false);
    const [phase, setPhase] = useState('input');  // input | done
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState('');
    const countdownRef = useRef(null);

    // Start timer
    useEffect(() => {
        startRoundTimer(ROUND_NAME);

        countdownRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    setExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownRef.current);
    }, []);

    // Auto-submit with 0 score on expiry if not already submitted
    useEffect(() => {
        if (expired && phase === 'input') {
            handleSubmit(true);
        }
    }, [expired]); // eslint-disable-line

    const urgency = remaining <= 30 ? 'critical' : remaining <= 60 ? 'warning' : 'normal';

    const handleSubmit = useCallback(async (timedOut = false) => {
        if (phase === 'done') return;
        clearInterval(countdownRef.current);

        const passed = !timedOut && codeInput.trim() === correctCode;
        const score = passed ? 10 : 0;

        setSubmitting(true);
        setSubmitErr('');
        try {
            const timeTaken = endRoundTimer(ROUND_NAME);
            await submitRoundScore(playerId, sessionId, {
                score, round: ROUND_NAME, time_taken_secs: timeTaken,
                role: 'crewmate', survived: passed,
                evidence_text: evidence.trim() || null,
            });
            markRoundComplete(ROUND_NAME);
            setResult(timedOut ? 'timeout' : passed ? 'pass' : 'fail');
            setPhase('done');
            if (passed) setTimeout(() => onComplete?.({ score, timeTaken }), 1800);
        } catch (err) {
            setSubmitErr(err.message ?? 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [phase, codeInput, correctCode, evidence, playerId, sessionId, onComplete]);

    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');

    return (
        <div style={S.root}>
            <p style={S.topLabel}>Round 5 · The Imposter Files</p>
            <h1 style={S.heading}>State Your Case</h1>
            <p style={S.narrative}>
                The crew needs answers. Write one line of evidence,<br />
                then enter the decryption code before time runs out.<br />
                <strong style={{ color: '#f87171' }}>You have 3 minutes.</strong>
            </p>

            <div style={S.card}>
                {/* ── Countdown ── */}
                <div style={S.countdown(urgency)}>
                    <div style={S.countdownNum(urgency)}>{mins}:{secs}</div>
                    <div style={S.countdownLabel}>
                        {expired ? '⚠️ Time expired' : urgency === 'critical' ? '⚠️ Final seconds!' : 'Time remaining'}
                    </div>
                </div>

                {phase === 'input' && !expired && (
                    <>
                        {/* Evidence */}
                        <div style={S.sectionLabel}>📋 Your Evidence Statement</div>
                        <textarea
                            style={S.evidenceTextarea}
                            value={evidence}
                            onChange={e => setEvidence(e.target.value)}
                            placeholder="In one sentence, state why you believe the imposter is your teammate…"
                            maxLength={280}
                            rows={3}
                            disabled={submitting}
                        />

                        {/* Code entry */}
                        <div style={S.sectionLabel}>🔐 Enter the Decryption Code</div>
                        <input
                            style={S.codeInput}
                            type="text" maxLength={4}
                            value={codeInput}
                            onChange={e => setCodeInput(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && !submitting && codeInput.length === 4 && handleSubmit(false)}
                            placeholder="____"
                            autoFocus
                            disabled={submitting}
                        />

                        {submitErr && <div style={S.errorBox}>⚠️ {submitErr}</div>}

                        <button
                            style={S.submitBtn(submitting || codeInput.length !== 4)}
                            onClick={() => handleSubmit(false)}
                            disabled={submitting || codeInput.length !== 4}
                        >
                            {submitting ? '📡 Transmitting…' : '🔴 FILE THE REPORT'}
                        </button>
                    </>
                )}

                {/* Results */}
                {phase === 'done' && (
                    <>
                        {result === 'pass' && (
                            <div style={S.successBanner}>
                                ✅ Code accepted. Imposter identified. +10 points.<br />
                                Mission complete — proceeding to final results…
                            </div>
                        )}
                        {result === 'fail' && (
                            <div style={S.expiredBanner}>
                                ❌ Incorrect code. 0 points recorded.
                                <button style={S.continueBtn} onClick={() => onComplete?.({ score: 0 })}>
                                    View Results →
                                </button>
                            </div>
                        )}
                        {result === 'timeout' && (
                            <div style={S.expiredBanner}>
                                ⏱ Time expired. Mission failed. 0 points recorded.
                                <button style={S.continueBtn} onClick={() => onComplete?.({ score: 0 })}>
                                    View Results →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}