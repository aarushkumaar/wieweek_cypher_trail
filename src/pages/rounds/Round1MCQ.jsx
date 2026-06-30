/**
 * src/pages/rounds/Round1MCQ.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 1 – Mission Clearance
 * 20 MCQ questions (5 per category), 1 pt each, 2 attempts per question.
 * Score is hidden during the round. Red flash = wrong, green flash = correct.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { buildRound1Questions } from '../../data/mcqQuestions.js';
import { ROUND_NAMES, startRoundTimer, endRoundTimer, markRoundComplete, getRoundElapsed, formatSecondsDisplay } from '../../lib/scoringEngine.js';
import { submitRoundScore } from '../../lib/gameService.js';

const ROUND_NAME = ROUND_NAMES.ROUND1;
const MAX_ATTEMPTS = 2;

// ── Inline styles ─────────────────────────────────────────────────────────────
const S = {
    root: {
        minHeight: '100vh',
        background: '#0d0f1a',
        fontFamily: "'Space Grotesk','Segoe UI',sans-serif",
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 1rem 3rem',
    },
    header: {
        width: '100%', maxWidth: 680,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '1rem',
    },
    roundLabel: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#64748b',
    },
    timer: {
        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '0.5rem', padding: '0.3rem 0.75rem',
        fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa',
        fontVariantNumeric: 'tabular-nums',
    },
    progressWrap: {
        width: '100%', maxWidth: 680,
        height: 4, background: 'rgba(255,255,255,0.06)',
        borderRadius: 2, marginBottom: '2rem', overflow: 'hidden',
    },
    progressBar: (pct) => ({
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
        transition: 'width 0.3s ease',
    }),
    card: (flash) => ({
        width: '100%', maxWidth: 680,
        background: flash === 'correct'
            ? 'rgba(34,197,94,0.08)'
            : flash === 'wrong'
                ? 'rgba(239,68,68,0.08)'
                : 'rgba(22,25,39,0.9)',
        border: `1px solid ${flash === 'correct' ? 'rgba(34,197,94,0.5)' : flash === 'wrong' ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.2)'}`,
        borderRadius: '1.25rem',
        padding: '2rem 1.75rem',
        transition: 'background 0.25s, border-color 0.25s',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }),
    catBadge: (color) => ({
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        background: `rgba(${hexToRgb(color)},0.1)`,
        border: `1px solid rgba(${hexToRgb(color)},0.35)`,
        borderRadius: '999px', padding: '0.2rem 0.65rem',
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em',
        color, marginBottom: '1rem',
    }),
    qNum: {
        fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem',
    },
    qText: {
        fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5,
        color: '#f1f5f9', marginBottom: '1.5rem',
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
    },
    optBtn: (state) => ({
        padding: '0.8rem 1rem',
        borderRadius: '0.65rem',
        border: `1px solid ${state === 'correct' ? 'rgba(34,197,94,0.7)' :
            state === 'wrong' ? 'rgba(239,68,68,0.7)' :
                state === 'reveal' ? 'rgba(34,197,94,0.5)' :
                    'rgba(124,58,237,0.25)'
            }`,
        background: state === 'correct' ? 'rgba(34,197,94,0.18)' :
            state === 'wrong' ? 'rgba(239,68,68,0.15)' :
                state === 'reveal' ? 'rgba(34,197,94,0.08)' :
                    'rgba(30,34,53,0.8)',
        color: state === 'correct' ? '#4ade80' :
            state === 'wrong' ? '#f87171' :
                state === 'reveal' ? '#86efac' :
                    '#cbd5e1',
        fontSize: '0.9rem', fontWeight: 500,
        cursor: state ? 'default' : 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left', lineHeight: 1.4,
    }),
    attemptsRow: {
        marginTop: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.78rem', color: '#64748b',
    },
    dot: (used) => ({
        width: 8, height: 8, borderRadius: '50%',
        background: used ? '#f87171' : 'rgba(255,255,255,0.15)',
    }),
    nextBtn: {
        marginTop: '1.5rem',
        padding: '0.8rem 2rem',
        background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
        color: '#fff', border: 'none', borderRadius: '0.65rem',
        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
        display: 'block', marginLeft: 'auto',
    },
    result: {
        textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '3rem 1rem',
    },
    resultIcon: { fontSize: '4rem', marginBottom: '1rem' },
    resultTitle: {
        fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem',
    },
    resultSub: { fontSize: '0.95rem', color: '#94a3b8', marginBottom: '2rem' },
    continueBtn: {
        padding: '0.9rem 2.5rem',
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        color: '#fff', border: 'none', borderRadius: '0.75rem',
        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
    },
    errorBox: {
        marginTop: '1rem', padding: '0.7rem 1rem',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.84rem',
    },
};

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Round1MCQ({ playerId, sessionId, onComplete }) {
    const [questions] = useState(() => buildRound1Questions());
    const [qIndex, setQIndex] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [flash, setFlash] = useState(null); // null | 'correct' | 'wrong'
    const [locked, setLocked] = useState(false); // question exhausted
    const [score, setScore] = useState(0);
    const [optState, setOptState] = useState({}); // idx→'correct'|'wrong'|'reveal'
    const [elapsed, setElapsed] = useState(0);
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState('');
    const timerRef = useRef(null);

    // Start timer
    useEffect(() => {
        startRoundTimer(ROUND_NAME);
        timerRef.current = setInterval(() => {
            setElapsed(getRoundElapsed(ROUND_NAME));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const current = questions[qIndex];
    const total = questions.length;

    function handleAnswer(optIdx) {
        if (locked || flash) return;
        const isCorrect = optIdx === current.ans;

        if (isCorrect) {
            setScore(s => s + 1);
            setFlash('correct');
            setOptState({ [optIdx]: 'correct' });
            setLocked(true);
            setTimeout(advance, 900);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setFlash('wrong');
            setOptState(prev => ({ ...prev, [optIdx]: 'wrong' }));
            setTimeout(() => setFlash(null), 600);

            if (newAttempts >= MAX_ATTEMPTS) {
                // Reveal correct answer
                setOptState(prev => ({ ...prev, [current.ans]: 'reveal' }));
                setLocked(true);
                setTimeout(advance, 1200);
            }
        }
    }

    function advance() {
        setFlash(null);
        setOptState({});
        setAttempts(0);
        setLocked(false);

        if (qIndex + 1 >= total) {
            // Round complete
            clearInterval(timerRef.current);
            setDone(true);
        } else {
            setQIndex(i => i + 1);
        }
    }

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setSubmitErr('');
        try {
            const timeTaken = endRoundTimer(ROUND_NAME);
            await submitRoundScore(playerId, sessionId, {
                score,
                round: ROUND_NAME,
                time_taken_secs: timeTaken,
                role: 'crewmate',
                survived: true,
                tasks_done: score,
            });
            markRoundComplete(ROUND_NAME);
            onComplete?.({ score, timeTaken });
        } catch (err) {
            setSubmitErr(err.message ?? 'Failed to submit score. Please try again.');
            setSubmitting(false);
        }
    }, [playerId, sessionId, score, onComplete]);

    if (done) {
        return (
            <div style={S.root}>
                <div style={S.result}>
                    <div style={S.resultIcon}>✅</div>
                    <h1 style={S.resultTitle}>Mission Clearance — Complete</h1>
                    <p style={S.resultSub}>
                        SKELD-9 registry updated.<br />
                        You answered <strong style={{ color: '#a78bfa' }}>{score} / {total}</strong> correctly<br />
                        in <strong style={{ color: '#a78bfa' }}>{formatSecondsDisplay(elapsed)}</strong>.
                    </p>
                    {submitErr && <div style={S.errorBox}>⚠️ {submitErr}</div>}
                    <button style={S.continueBtn} disabled={submitting} onClick={handleSubmit}>
                        {submitting ? 'Transmitting…' : 'Submit & Continue →'}
                    </button>
                </div>
            </div>
        );
    }

    const pct = ((qIndex) / total) * 100;

    return (
        <div style={S.root}>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <div style={S.roundLabel}>Round 1 · Mission Clearance</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>
                        Question {qIndex + 1} of {total}
                    </div>
                </div>
                <div style={S.timer}>⏱ {formatSecondsDisplay(elapsed)}</div>
            </div>

            {/* Progress bar */}
            <div style={S.progressWrap}>
                <div style={S.progressBar(pct)} />
            </div>

            {/* Question card */}
            <div style={S.card(flash)}>
                <div style={S.catBadge(current.categoryColor)}>
                    {current.categoryIcon} {current.category}
                </div>
                <div style={S.qNum}>Q{qIndex + 1}</div>
                <div style={S.qText}>{current.q}</div>

                <div style={S.optionsGrid}>
                    {current.opts.map((opt, i) => (
                        <button
                            key={i}
                            style={S.optBtn(optState[i])}
                            onClick={() => handleAnswer(i)}
                            disabled={locked || !!flash}
                        >
                            <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>
                                {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                        </button>
                    ))}
                </div>

                <div style={S.attemptsRow}>
                    <span>Attempts:</span>
                    {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                        <div key={i} style={S.dot(i < attempts)} />
                    ))}
                    <span style={{ marginLeft: '0.25rem' }}>
                        {attempts} / {MAX_ATTEMPTS}
                    </span>
                </div>
            </div>
        </div>
    );
}