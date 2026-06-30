/**
 * src/pages/GameFlow.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the full authenticated game sequence:
 *   Lobby → Round 1 → Round 2 → Round 3 → Round 4 → Round 5 → Results
 *
 * - Each round only unlocks after the previous one is submitted to Supabase
 * - Progress persists in sessionStorage — a page refresh resumes where left off
 * - Reads auth user from Supabase, syncs player row, creates session
 * - Uses the existing transition pages (HackAmongUs, round1t–round5t) between rounds
 * - If no auth session found, redirects to /login
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../lib/auth.js';
import { joinGame, getStoredPlayer, leaveGame } from '../lib/gameService.js';
import {
  ROUND_NAMES,
  getCompletedRounds,
  clearProgress,
  calculateTotalScore,
} from '../lib/scoringEngine.js';

import Round1MCQ from './rounds/Round1MCQ.jsx';
import Round2Coding from './rounds/Round2Coding.jsx';
import Round3HiddenKey from './rounds/Round3HiddenKey.jsx';
import Round4DecodeEcho from './rounds/Round4DecodeEcho.jsx';
import Round5ImposterFiles from './rounds/Round5ImposterFiles.jsx';

// Existing transition / guidelines pages
import HackAmongUs from '../wie-week/Transition_pages/HackAmongUs.jsx';
import Round1T from '../wie-week/Transition_pages/round1t.jsx';
import Round2T from '../wie-week/Transition_pages/round2t.jsx';
import Round3T from '../wie-week/Transition_pages/round3t.jsx';
import Round4T from '../wie-week/Transition_pages/round4t.jsx';
import Round5T from '../wie-week/Transition_pages/round5t.jsx';
import Finish from '../wie-week/Transition_pages/finish.jsx';

// ── Stage ordering ─────────────────────────────────────────────────────────────
const STAGES = [
  'hack1', 'round1t', 'round1',
  'hack2', 'round2t', 'round2',
  'hack3', 'round3t', 'round3',
  'hack4', 'round4t', 'round4',
  'hack5', 'round5t', 'round5',
  'results',
];

function nextStage(s) {
  const i = STAGES.indexOf(s);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : 'results';
}

// Map round stage names to ROUND_NAMES keys
const ROUND_STAGE_TO_KEY = {
  round1: ROUND_NAMES.ROUND1,
  round2: ROUND_NAMES.ROUND2,
  round3: ROUND_NAMES.ROUND3,
  round4: ROUND_NAMES.ROUND4,
  round5: ROUND_NAMES.ROUND5,
};

// ── Results screen ─────────────────────────────────────────────────────────────
function Results({ player, sessionId, onRestart }) {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player?.id) { setLoading(false); return; }
    calculateTotalScore(player.id)
      .then(r => setTotals(r))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Close the session
    if (sessionId) leaveGame(sessionId);
    clearProgress();
  }, []); // eslint-disable-line

  const ROUND_LABELS = {
    [ROUND_NAMES.ROUND1]: 'Mission Clearance',
    [ROUND_NAMES.ROUND2]: 'Anomaly Detection',
    [ROUND_NAMES.ROUND3]: 'Beneath the Interface',
    [ROUND_NAMES.ROUND4]: 'Decode the Echo',
    [ROUND_NAMES.ROUND5]: 'The Imposter Files',
  };

  const S = {
    root: {
      minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%,#1a0640 0%,#0d0f1a 70%)',
      fontFamily: "'Space Grotesk','Segoe UI',sans-serif",
      color: '#f1f5f9', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem',
      textAlign: 'center',
    },
    icon: { fontSize: '4rem', marginBottom: '1rem' },
    title: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem' },
    sub: { fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2.5rem' },
    scoreCard: {
      background: 'rgba(22,25,39,0.95)', border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 480,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)', marginBottom: '2rem',
    },
    totalScore: {
      fontSize: '3.5rem', fontWeight: 800, color: '#a78bfa',
      textShadow: '0 0 32px rgba(167,139,250,0.4)', marginBottom: '0.25rem',
    },
    totalLabel: { fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem', textAlign: 'left' },
    th: {
      fontSize: '0.68rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(124,58,237,0.15)',
    },
    td: { padding: '0.5rem', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    scoreCell: (s) => ({
      padding: '0.5rem', fontWeight: 700, fontSize: '0.88rem',
      color: s > 0 ? '#4ade80' : '#64748b',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }),
    restartBtn: {
      padding: '0.9rem 2.5rem',
      background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
      color: '#fff', border: 'none', borderRadius: '0.75rem',
      fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
    },
  };

  return (
    <div style={S.root}>
      <div style={S.icon}>🏆</div>
      <h1 style={S.title}>Mission Complete</h1>
      <p style={S.sub}>
        Crewmate {player?.display_name ?? '#06'}, your final report has been filed.<br />
        SKELD-9 mission log updated.
      </p>

      <div style={S.scoreCard}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Calculating…</p>
        ) : (
          <>
            <div style={S.totalScore}>
              {totals?.total ?? 0}{' '}
              <span style={{ fontSize: '1.5rem', color: '#64748b' }}>/ 60</span>
            </div>
            <div style={S.totalLabel}>Total Score</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Round</th>
                  <th style={S.th}>Score</th>
                  <th style={S.th}>Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ROUND_LABELS).map(([key, label]) => {
                  const s = totals?.byRound?.[key] ?? 0;
                  const max = key === ROUND_NAMES.ROUND1 ? 20 : 10;
                  return (
                    <tr key={key}>
                      <td style={S.td}>{label}</td>
                      <td style={S.scoreCell(s)}>{s}</td>
                      <td style={{ ...S.td, color: '#475569' }}>{max}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      <button style={S.restartBtn} onClick={onRestart}>↩ Return to Lobby</button>
    </div>
  );
}

// ── Main GameFlow ──────────────────────────────────────────────────────────────
export default function GameFlow() {
  const navigate = useNavigate();

  // Lazy init: if AuthCallback set ?play=1 after OAuth, start at hack1.
  // Otherwise start at hack1 (GameFlow is only mounted after auth succeeds).
  const [stage, setStage] = useState(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('play') === '1') {
      window.history.replaceState({}, '', '/game');
      return 'hack1';
    }
    // Try to resume from sessionStorage progress
    const completed = getCompletedRounds();
    const roundStages = Object.keys(ROUND_STAGE_TO_KEY);
    const lastDone = roundStages.filter(rs => completed.includes(ROUND_STAGE_TO_KEY[rs])).pop();
    if (lastDone) return nextStage(lastDone);
    return 'hack1';
  });

  const [player, setPlayer]     = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const advance = useCallback(() => setStage(s => nextStage(s)), []);

  // Initialise: restore or create session
  useEffect(() => {
    async function init() {
      try {
        // 1. Check Supabase auth session
        const authUser = await getAuthUser();

        if (!authUser) {
          // No live session — redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // 2. Try to restore from localStorage (existing session)
        const { player: stored, sessionId: storedSess } = getStoredPlayer();
        if (stored && storedSess) {
          setPlayer(stored);
          setSessionId(storedSess);
        } else {
          // 3. Create new game session
          const result = await joinGame(authUser);
          setPlayer(result.player);
          setSessionId(result.sessionId);
        }
      } catch (err) {
        setError(err.message ?? 'Failed to start game session.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []); // eslint-disable-line

  function handleRestart() {
    clearProgress();
    navigate('/', { replace: true });
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0f1a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#64748b',
        fontFamily: "'Space Grotesk',sans-serif", flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: 28, height: 28, border: '3px solid rgba(124,58,237,0.3)',
          borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'gf-spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes gf-spin{to{transform:rotate(360deg)}}`}</style>
        Initialising SKELD-9 systems…
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0f1a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#f87171',
        fontFamily: "'Space Grotesk',sans-serif", textAlign: 'center', padding: '2rem',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div>⚠️ {error}</div>
        <button
          onClick={() => navigate('/login', { replace: true })}
          style={{
            padding: '0.6rem 1.5rem', background: '#7c3aed', color: '#fff',
            border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  const roundProps = { playerId: player?.id, sessionId };

  return (
    <>
      {stage === 'hack1'   && <HackAmongUs roundNum={1} onComplete={advance} />}
      {stage === 'round1t' && <Round1T onStart={advance} />}
      {stage === 'round1'  && <Round1MCQ {...roundProps} onComplete={advance} />}

      {stage === 'hack2'   && <HackAmongUs roundNum={2} onComplete={advance} />}
      {stage === 'round2t' && <Round2T onStart={advance} />}
      {stage === 'round2'  && <Round2Coding {...roundProps} onComplete={advance} />}

      {stage === 'hack3'   && <HackAmongUs roundNum={3} onComplete={advance} />}
      {stage === 'round3t' && <Round3T onStart={advance} />}
      {stage === 'round3'  && <Round3HiddenKey {...roundProps} onComplete={advance} />}

      {stage === 'hack4'   && <HackAmongUs roundNum={4} onComplete={advance} />}
      {stage === 'round4t' && <Round4T onStart={advance} />}
      {stage === 'round4'  && <Round4DecodeEcho {...roundProps} onComplete={advance} />}

      {stage === 'hack5'   && <HackAmongUs roundNum={5} onComplete={advance} />}
      {stage === 'round5t' && <Round5T onStart={advance} />}
      {stage === 'round5'  && <Round5ImposterFiles {...roundProps} onComplete={advance} />}

      {stage === 'results' && (
        <Results player={player} sessionId={sessionId} onRestart={handleRestart} />
      )}

      {/* Fallback finish screen if referenced */}
      {stage === 'finish'  && <Finish onRestart={handleRestart} />}
    </>
  );
}
