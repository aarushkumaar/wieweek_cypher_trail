/**
 * src/pages/AdminPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full admin dashboard for WIE2026 – The Cypher Trail.
 * Route: /admin
 *
 * Tabs: Players | Sessions | Scores | Audit Log | Scoreboard
 *
 * BUG FIX (empty Players tab):
 *   Any Supabase error is now shown as a visible red banner above the table
 *   instead of silently rendering an empty table. The root cause is almost
 *   always one of:
 *     1. Missing GRANT SELECT ON admin_player_summary TO anon, authenticated;
 *     2. RLS on the underlying `players` table blocking the view query.
 *   See supabase/migration_v2.sql for the exact fix.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAdminSummary,
  fetchAllSessions,
  fetchAllScores,
  fetchAuditLog,
  fetchScoreboardData,
} from '../lib/gameService.js';
import { exportToCsv, formatDuration } from '../lib/exportCsv.js';
import { ROUND_NAMES } from '../lib/scoringEngine.js';
import './AdminPanel.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const ROUND_ORDER = [
  { key: ROUND_NAMES.ROUND1, label: 'R1 · Clearance', max: 20 },
  { key: ROUND_NAMES.ROUND2, label: 'R2 · Anomaly', max: 10 },
  { key: ROUND_NAMES.ROUND3, label: 'R3 · Interface', max: 10 },
  { key: ROUND_NAMES.ROUND4, label: 'R4 · Echo', max: 10 },
  { key: ROUND_NAMES.ROUND5, label: 'R5 · Imposter', max: 10 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function trunc(str, maxLen = 60) {
  if (!str) return '—';
  const s = typeof str === 'object' ? JSON.stringify(str) : String(str);
  return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
}

function auditBadgeClass(eventType) {
  if (!eventType) return 'badge-grey';
  const t = eventType.toLowerCase();
  if (t.includes('join') || t.includes('login') || t.includes('insert')) return 'badge-green';
  if (t.includes('session')) return 'badge-blue';
  if (t.includes('impostor') || t.includes('error') || t.includes('delete')) return 'badge-red';
  if (t.includes('score') || t.includes('update')) return 'badge-amber';
  return 'badge-purple';
}

// ── Aggregate scoreboard rows from flat score records ─────────────────────────
function aggregateScoreboard(rawScores) {
  const map = new Map(); // player_id → { name, email, rounds: {}, totalTime }

  rawScores.forEach(row => {
    const pid = row.player_id;
    const name = row.players?.display_name ?? '—';
    const email = row.players?.email ?? '—';

    if (!map.has(pid)) {
      map.set(pid, { player_id: pid, name, email, rounds: {}, totalTime: 0 });
    }
    const entry = map.get(pid);
    const rnd = row.round ?? 'unknown';

    // Keep highest score per round (in case of multiple attempts)
    if (!(rnd in entry.rounds) || (row.score ?? 0) > entry.rounds[rnd]) {
      entry.rounds[rnd] = row.score ?? 0;
    }
    entry.totalTime += (row.time_taken_secs ?? 0);
  });

  return Array.from(map.values())
    .map(entry => ({
      ...entry,
      totalScore: Object.values(entry.rounds).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTime - b.totalTime; // tiebreaker: less time = better rank
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const correctPw = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === correctPw) {
      onUnlock();
    } else {
      setErr('Incorrect access code. Try again, Crewmate. 🔒');
      setPw('');
    }
  }

  return (
    <div className="ap-root">
      <div className="ap-gate">
        <div className="ap-gate-card">
          <span className="ap-gate-icon">🛡️</span>
          <h1 className="ap-gate-title">Admin Access</h1>
          <p className="ap-gate-sub">Enter the mission control password to continue.</p>
          <form className="ap-gate-form" onSubmit={handleSubmit}>
            <input type="password" className="ap-gate-input" value={pw}
              onChange={e => { setPw(e.target.value); setErr(''); }}
              placeholder="••••••••" autoFocus required />
            {err && <div className="ap-gate-error">{err}</div>}
            <button type="submit" className="ap-gate-btn">🚀 Enter Mission Control</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, desc }) {
  return (
    <div className="ap-stat-card">
      <span className="ap-stat-label">{label}</span>
      <span className="ap-stat-value">{value ?? '—'}</span>
      {desc && <span className="ap-stat-desc">{desc}</span>}
    </div>
  );
}

function Loading() {
  return <div className="ap-loading"><div className="ap-spinner" />Loading data…</div>;
}

function Empty({ msg = 'No records found.' }) {
  return <div className="ap-empty"><span className="ap-empty-icon">🌌</span>{msg}</div>;
}

/** Visible error banner — shown whenever a Supabase call fails */
function ErrBanner({ error }) {
  if (!error) return null;
  return (
    <div className="ap-error-banner" role="alert">
      <strong>⚠️ Data fetch failed:</strong> {error}
      <br />
      <small style={{ opacity: 0.75 }}>
        If Players tab is empty: check GRANT SELECT on admin_player_summary to anon, authenticated;
        and that RLS on the players table isn't blocking the view. See supabase/migration_v2.sql.
      </small>
    </div>
  );
}

// ── Tab: Players ──────────────────────────────────────────────────────────────
function PlayersTab({ players, loading, error }) {
  function handleExport() {
    const rows = players.map(p => ({
      Name: p.display_name ?? '—', Email: p.email ?? '—',
      Joined: fmtDate(p.created_at), Sessions: p.total_sessions ?? 0,
      'Last Seen': fmtDate(p.last_seen),
      'Time Played': formatDuration(p.total_time_secs),
      'Total Score': p.total_score ?? 0,
      'Avg Score': p.avg_score != null ? Number(p.avg_score).toFixed(1) : '—',
      Games: p.total_games ?? 0,
    }));
    exportToCsv('wie2026_players.csv', rows);
  }

  return (
    <div className="ap-pane">
      <div className="ap-pane-header">
        <span className="ap-pane-title">Players <span className="ap-pane-count">({players.length})</span></span>
        <button className="ap-export-btn" onClick={handleExport} disabled={players.length === 0}>⬇ Export CSV</button>
      </div>
      <ErrBanner error={error} />
      {loading ? <Loading /> : players.length === 0 ? <Empty msg="No players found. Check the error banner above if unexpected." /> : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              <th>Name</th><th>Email</th><th>Joined</th><th>Sessions</th>
              <th>Last Seen</th><th>Time Played</th><th>Total Score</th><th>Avg Score</th><th>Games</th>
            </tr></thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.player_id ?? i}>
                  <td>{p.display_name ?? '—'}</td>
                  <td className="ap-cell-secondary">{p.email ?? '—'}</td>
                  <td className="ap-cell-dim">{fmtDate(p.created_at)}</td>
                  <td>{p.total_sessions ?? 0}</td>
                  <td className="ap-cell-dim">{fmtDate(p.last_seen)}</td>
                  <td className="ap-cell-secondary">{formatDuration(p.total_time_secs)}</td>
                  <td><strong>{p.total_score ?? 0}</strong></td>
                  <td>{p.avg_score != null ? Number(p.avg_score).toFixed(1) : '—'}</td>
                  <td>{p.total_games ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Sessions ─────────────────────────────────────────────────────────────
function SessionsTab({ sessions, loading, error }) {
  function handleExport() {
    const rows = sessions.map(s => ({
      Player: s.players?.display_name ?? '—', Email: s.players?.email ?? '—',
      'Logged In': fmtDate(s.logged_in_at), 'Logged Out': fmtDate(s.logged_out_at),
      Duration: formatDuration(s.duration_secs), Status: s.logged_out_at ? 'Ended' : 'Active',
    }));
    exportToCsv('wie2026_sessions.csv', rows);
  }

  return (
    <div className="ap-pane">
      <div className="ap-pane-header">
        <span className="ap-pane-title">Sessions <span className="ap-pane-count">({sessions.length})</span></span>
        <button className="ap-export-btn" onClick={handleExport} disabled={sessions.length === 0}>⬇ Export CSV</button>
      </div>
      <ErrBanner error={error} />
      {loading ? <Loading /> : sessions.length === 0 ? <Empty /> : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              <th>Player</th><th>Email</th><th>Logged In</th><th>Logged Out</th><th>Duration</th><th>Status</th>
            </tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id ?? i}>
                  <td>{s.players?.display_name ?? '—'}</td>
                  <td className="ap-cell-secondary">{s.players?.email ?? '—'}</td>
                  <td className="ap-cell-dim">{fmtDate(s.logged_in_at)}</td>
                  <td className="ap-cell-dim">{fmtDate(s.logged_out_at)}</td>
                  <td className="ap-cell-secondary">{formatDuration(s.duration_secs)}</td>
                  <td>{s.logged_out_at
                    ? <span className="badge badge-grey">Ended</span>
                    : <span className="badge badge-green">● Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Scores ───────────────────────────────────────────────────────────────
function ScoresTab({ scores, loading, error }) {
  function handleExport() {
    const rows = scores.map(s => ({
      Player: s.players?.display_name ?? '—', Score: s.score ?? 0,
      Round: s.round ?? '—', Role: s.role ?? '—',
      Survived: s.survived ? 'Yes' : 'No', 'Tasks Done': s.tasks_done ?? 0,
      'Time (s)': s.time_taken_secs ?? '—',
      Evidence: s.evidence_text ?? '',
      'Recorded At': fmtDate(s.recorded_at),
    }));
    exportToCsv('wie2026_scores.csv', rows);
  }

  return (
    <div className="ap-pane">
      <div className="ap-pane-header">
        <span className="ap-pane-title">Scores <span className="ap-pane-count">({scores.length})</span></span>
        <button className="ap-export-btn" onClick={handleExport} disabled={scores.length === 0}>⬇ Export CSV</button>
      </div>
      <ErrBanner error={error} />
      {loading ? <Loading /> : scores.length === 0 ? <Empty /> : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              <th>Player</th><th>Round</th><th>Score</th><th>Role</th>
              <th>Survived</th><th>Tasks</th><th>Time</th><th>Evidence</th><th>Recorded At</th>
            </tr></thead>
            <tbody>
              {scores.map((s, i) => {
                const roleLC = (s.role ?? '').toLowerCase();
                return (
                  <tr key={s.id ?? i}>
                    <td>{s.players?.display_name ?? '—'}</td>
                    <td><span className="badge badge-purple" style={{ fontSize: '0.66rem' }}>{s.round ?? '—'}</span></td>
                    <td><strong>{s.score ?? 0}</strong></td>
                    <td>{s.role
                      ? <span className={`badge ${roleLC === 'impostor' ? 'badge-red' : 'badge-blue'}`}>
                        {roleLC === 'impostor' ? '🔪' : '🧑‍🚀'} {s.role}
                      </span>
                      : <span className="ap-cell-dim">—</span>}
                    </td>
                    <td>{s.survived === true ? '✅' : s.survived === false ? '💀' : <span className="ap-cell-dim">—</span>}</td>
                    <td>{s.tasks_done ?? 0}</td>
                    <td className="ap-cell-secondary">{s.time_taken_secs ? `${s.time_taken_secs}s` : '—'}</td>
                    <td className="ap-cell-mono" title={s.evidence_text ?? ''}>{trunc(s.evidence_text ?? '', 40)}</td>
                    <td className="ap-cell-dim">{fmtDate(s.recorded_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Audit Log ────────────────────────────────────────────────────────────
function AuditTab({ logs, loading, error }) {
  function handleExport() {
    const rows = logs.map((l, i) => ({
      '#': i + 1, 'Event Type': l.event_type ?? '—',
      Payload: typeof l.payload === 'object' ? JSON.stringify(l.payload) : (l.payload ?? ''),
      Time: fmtDate(l.occurred_at),
    }));
    exportToCsv('wie2026_audit_log.csv', rows);
  }

  return (
    <div className="ap-pane">
      <div className="ap-audit-note">
        🔒 This log is written by the database and <strong>cannot be modified</strong> from the frontend.
      </div>
      <div className="ap-pane-header">
        <span className="ap-pane-title">Audit Log <span className="ap-pane-count">({logs.length})</span></span>
        <button className="ap-export-btn" onClick={handleExport} disabled={logs.length === 0}>⬇ Export CSV</button>
      </div>
      <ErrBanner error={error} />
      {loading ? <Loading /> : logs.length === 0 ? <Empty msg="No audit events recorded yet." /> : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              <th style={{ width: 50 }}>#</th><th>Event Type</th><th>Payload</th><th>Time</th>
            </tr></thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id ?? i}>
                  <td className="ap-cell-dim">{i + 1}</td>
                  <td><span className={`badge ${auditBadgeClass(l.event_type)}`}>{l.event_type ?? '—'}</span></td>
                  <td>
                    <span className="ap-cell-mono"
                      title={typeof l.payload === 'object' ? JSON.stringify(l.payload) : l.payload}>
                      {trunc(typeof l.payload === 'object' ? JSON.stringify(l.payload) : l.payload)}
                    </span>
                  </td>
                  <td className="ap-cell-dim">{fmtDate(l.occurred_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Scoreboard ───────────────────────────────────────────────────────────
function ScoreboardTab({ rawScores, loading, error }) {
  const rows = aggregateScoreboard(rawScores);

  function handleExport() {
    const csv = rows.map((r, i) => {
      const obj = { Rank: i + 1, Player: r.name, Email: r.email };
      ROUND_ORDER.forEach(rd => { obj[rd.label] = r.rounds[rd.key] ?? '—'; });
      obj['Total Score'] = r.totalScore;
      obj['Total Time (s)'] = r.totalTime;
      return obj;
    });
    exportToCsv('wie2026_scoreboard.csv', csv);
  }

  function cellClass(roundKey, playerRounds) {
    if (!(roundKey in playerRounds)) return 'sb-cell-grey';
    return playerRounds[roundKey] > 0 ? 'sb-cell-green' : 'sb-cell-red';
  }

  return (
    <div className="ap-pane">
      <div className="ap-pane-header">
        <span className="ap-pane-title">
          Scoreboard <span className="ap-pane-count">({rows.length} players)</span>
        </span>
        <button className="ap-export-btn" onClick={handleExport} disabled={rows.length === 0}>⬇ Export CSV</button>
      </div>
      <ErrBanner error={error} />
      <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.75rem' }}>
        Sorted by Total Score ↓, then Total Time ↑ (tiebreaker).
        <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>Green</span> = scored &nbsp;
        <span className="badge badge-red" style={{ marginLeft: '0.25rem' }}>Red</span> = 0 &nbsp;
        <span className="badge badge-grey" style={{ marginLeft: '0.25rem' }}>Grey</span> = not attempted
      </p>
      {loading ? <Loading /> : rows.length === 0 ? <Empty msg="No score data yet. Scores appear after players complete rounds." /> : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Email</th>
                {ROUND_ORDER.map(r => <th key={r.key}>{r.label}<br /><span style={{ fontWeight: 400, opacity: 0.5 }}>(/{r.max})</span></th>)}
                <th>Total /60</th>
                <th>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.player_id}>
                  <td>
                    <span className={`badge ${i === 0 ? 'badge-amber' : i === 1 ? 'badge-grey' : i === 2 ? 'badge-amber' : ''}`}
                      style={{ minWidth: 24, justifyContent: 'center' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td><strong>{r.name}</strong></td>
                  <td className="ap-cell-secondary">{r.email}</td>
                  {ROUND_ORDER.map(rd => (
                    <td key={rd.key} className={`sb-round-cell ${cellClass(rd.key, r.rounds)}`}>
                      {rd.key in r.rounds ? r.rounds[rd.key] : '—'}
                    </td>
                  ))}
                  <td><strong style={{ color: '#a78bfa' }}>{r.totalScore}</strong></td>
                  <td className="ap-cell-secondary">{r.totalTime ? `${r.totalTime}s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [scores, setScores] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [sbScores, setSbScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});  // per-resource errors
  const [lastSync, setLastSync] = useState(null);
  const intervalRef = useRef(null);

  // Derived stats
  const totalPlayers = players.length;
  const activeNow = sessions.filter(s => !s.logged_out_at).length;
  const gamesPlayed = scores.length;
  const avgScore = scores.length > 0
    ? (scores.reduce((a, s) => a + (s.score ?? 0), 0) / scores.length).toFixed(1)
    : '—';

  const fetchAll = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);

    // Fetch all resources independently so one failure doesn't block others
    const results = await Promise.allSettled([
      fetchAdminSummary(),
      fetchAllSessions(),
      fetchAllScores(),
      fetchAuditLog(500),
      fetchScoreboardData(),
    ]);

    const [pRes, sRes, scRes, alRes, sbRes] = results;
    const newErrors = {};

    if (pRes.status === 'fulfilled') setPlayers(pRes.value);
    else newErrors.players = pRes.reason?.message ?? 'Failed to load players';

    if (sRes.status === 'fulfilled') setSessions(sRes.value);
    else newErrors.sessions = sRes.reason?.message ?? 'Failed to load sessions';

    if (scRes.status === 'fulfilled') setScores(scRes.value);
    else newErrors.scores = scRes.reason?.message ?? 'Failed to load scores';

    if (alRes.status === 'fulfilled') setAuditLog(alRes.value);
    else newErrors.audit = alRes.reason?.message ?? 'Failed to load audit log';

    if (sbRes.status === 'fulfilled') setSbScores(sbRes.value);
    else newErrors.scoreboard = sbRes.reason?.message ?? 'Failed to load scoreboard';

    setErrors(newErrors);
    setLastSync(new Date());
    if (isInitial) setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(true);
    intervalRef.current = setInterval(() => fetchAll(false), 30_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const TABS = [
    { id: 'players', label: '👥 Players' },
    { id: 'sessions', label: '🔗 Sessions' },
    { id: 'scores', label: '🏆 Scores' },
    { id: 'audit', label: '📋 Audit Log' },
    { id: 'scoreboard', label: '🥇 Scoreboard' },
  ];

  return (
    <div className="ap-root">
      <div className="ap-dashboard">
        {/* Top bar */}
        <header className="ap-topbar">
          <div className="ap-topbar-brand">
            <span className="ap-topbar-logo">🛸</span>
            <div>
              <div className="ap-topbar-title">Mission Control</div>
              <div className="ap-topbar-sub">WIE2026 · The Cypher Trail</div>
            </div>
          </div>
          <div className="ap-topbar-right">
            {lastSync && <span className="ap-sync-time">Last sync: {lastSync.toLocaleTimeString('en-IN')}</span>}
            <button className="ap-refresh-btn" onClick={() => fetchAll(false)} disabled={loading}>
              {loading ? '⟳ Syncing…' : '⟳ Refresh'}
            </button>
            <button className="ap-logout-btn" onClick={onLogout}>Sign Out</button>
          </div>
        </header>

        {/* Stat cards */}
        <section className="ap-stats-row">
          <StatCard label="Total Players" value={totalPlayers} desc="registered crewmates" />
          <StatCard label="Active Now" value={activeNow} desc="open sessions" />
          <StatCard label="Games Played" value={gamesPlayed} desc="score records" />
          <StatCard label="Average Score" value={avgScore} desc="across all rounds" />
        </section>

        {/* Global error (if all resources failed) */}
        {Object.keys(errors).length > 0 && (
          <div style={{ padding: '0 1.5rem' }}>
            <ErrBanner error={Object.values(errors)[0]} />
          </div>
        )}

        {/* Tabs */}
        <nav className="ap-tabs-row">
          {TABS.map(t => (
            <button key={t.id}
              className={`ap-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Panes */}
        {tab === 'players' && <PlayersTab players={players} loading={loading} error={errors.players} />}
        {tab === 'sessions' && <SessionsTab sessions={sessions} loading={loading} error={errors.sessions} />}
        {tab === 'scores' && <ScoresTab scores={scores} loading={loading} error={errors.scores} />}
        {tab === 'audit' && <AuditTab logs={auditLog} loading={loading} error={errors.audit} />}
        {tab === 'scoreboard' && <ScoreboardTab rawScores={sbScores} loading={loading} error={errors.scoreboard} />}
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <Dashboard onLogout={() => setUnlocked(false)} />;
}
