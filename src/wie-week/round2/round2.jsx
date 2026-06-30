import { useState, useEffect, useRef } from 'react';
import { getRound2Modules } from '../api';
import './round2.css';
import electricalBg from './assets/electricalBg.png';
import crewBlue from '../round1/assets/crewmate_blue.png';
import crewRed from '../round1/assets/crewmate_red.png';

const GOLD_STARS = (count) => Array.from({ length: count }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  r: Math.random() * 1 + 0.3,
  delay: Math.random() * 3,
  dur: 2 + Math.random() * 2,
}));

const PANEL_STARS = {
  aria: GOLD_STARS(20),
  status: GOLD_STARS(15),
  overview: GOLD_STARS(15),
  modview: GOLD_STARS(12),
  qsel: GOLD_STARS(8),
  modtitle: GOLD_STARS(8),
  code: GOLD_STARS(25),
  answer: GOLD_STARS(10),
  warn: GOLD_STARS(10),
  obj: GOLD_STARS(12),
  crew: GOLD_STARS(10),
  aria2: GOLD_STARS(10),
};

function GoldStars({ stars }) {
  return (
    <svg className="r2-stars" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {stars.map(s => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="#c8960a">
          <animate attributeName="opacity" values="0.15;0.9;0.15" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

/* ── Sparks component ── */
const SPARK_DATA = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: `${20 + Math.random() * 60}%`,
  left: `${15 + Math.random() * 70}%`,
  sx: `${(Math.random() - 0.5) * 40}px`,
  sy: `${-20 - Math.random() * 40}px`,
  delay: `${Math.random() * 2.5}s`,
  dur: `${1.5 + Math.random() * 1.5}s`,
  bg: Math.random() > 0.5 ? '#ffcc00' : '#ff8800',
}));

function Sparks() {
  return (
    <div className="r2-sparks">
      {SPARK_DATA.map(s => (
        <div key={s.id} className="r2-spark" style={{
          top: s.top, left: s.left,
          '--sx': s.sx, '--sy': s.sy,
          animationDelay: s.delay,
          animationDuration: s.dur,
          background: s.bg,
        }} />
      ))}
    </div>
  );
}

/* ── Syntax highlight helper ── */
function CodeLine({ line, num }) {
  return (
    <div className="r2-code-line">
      <span className="r2-line-num">{String(num).padStart(2, '0')}</span>
      <span className="r2-line-code" style={line.c ? { color: line.c === 'cm' ? '#3a5560' : line.c === 'kw' ? '#cc8844' : line.c === 'fn' ? '#8ab4d8' : undefined } : {}}>
        {line.t}
      </span>
    </div>
  );
}

export default function Round2({ onComplete }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeQ, setActiveQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [input, setInput] = useState('');
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    getRound2Modules().then(data => {
      setModules(data);
      setActiveModule(data[0]?.id ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="r2-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Orbitron, monospace', color: '#5ac8e8', letterSpacing: '0.2em', fontSize: '0.9rem' }}>LOADING MODULES...</span>
    </div>
  );

  const mod = modules.find(m => m.id === activeModule) ?? modules[0];
  const qIdx = activeQ;
  const q = selectedModule && mod ? mod.questions[qIdx] : null;
  const key = `${activeModule}-${qIdx}`;
  const isCorrect = feedback[key] === 'ok';

  const solved = Object.values(feedback).filter(v => v === 'ok').length;
  const modSolved = (modId) =>
    (modules.find(m => m.id === modId)?.questions ?? [])
      .every((_, qi) => feedback[`${modId}-${qi}`] === 'ok');

  function selectModule(id) {
    if (selectedModule !== null) return;
    setSelectedModule(id);
    setActiveModule(id);
    setActiveQ(0);
    setInput(answers[`${id}-0`] || '');
  }

  function selectQ(qi) {
    setActiveQ(qi);
    setInput(answers[`${activeModule}-${qi}`] || '');
  }

  function submitAnswer() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const correct = trimmed === q.answer.trim();
    setAnswers(p => ({ ...p, [key]: trimmed }));
    setFeedback(p => ({ ...p, [key]: correct ? 'ok' : 'err' }));
    if (correct) {
      const allSolved = mod.questions.every((_, qi) => {
        const k = `${activeModule}-${qi}`;
        return qi === qIdx ? true : feedback[k] === 'ok';
      });
      if (allSolved) {
        setTimeout(() => setShowCode(true), 600);
      } else if (qIdx < mod.questions.length - 1) {
        setTimeout(() => { setActiveQ(qIdx + 1); setInput(''); }, 800);
      }
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); }
  }

  return (
    <>
      <div className="r2-root">

        {/* ══ MAIN ROW ══ */}
        <div className="r2-main">

          {/* ── LEFT SIDEBAR ── */}
          <div className="r2-left">

            {/* ARIA Alert */}
            <div className="r2-panel r2-panel--tl" style={{ flexShrink: 0 }}>
              <GoldStars stars={PANEL_STARS.aria} />
              <div className="r2-panel-inner">
                <div className="r2-panel-title">⚠ ARIA ALERT</div>
                <div className="r2-aria-alert">
                  <div className="r2-aria-header">
                    <div className="r2-aria-icon">⚠</div>
                    <div className="r2-aria-title">4 CORRUPTED MODULES<br />DETECTED</div>
                  </div>
                  <div className="r2-aria-body">
                    Someone sabotaged the ship's core systems before the blackout. Four code modules. Four bugs. All deliberate.
                    <br /><br />
                    Read each snippet carefully. Find the bug. Type exactly what's wrong.
                    <em>They made these hard to spot.<br />Don't let them win.</em>
                    <div className="r2-aria-sig">— ARIA, SKELD-9</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ship System Status */}
            <div className="r2-panel" style={{ flexShrink: 0 }}>
              <GoldStars stars={PANEL_STARS.status} />
              <div className="r2-panel-inner">
                <div className="r2-panel-title">SHIP SYSTEM STATUS</div>
                <div className="r2-status-list">
                  {modules.map(m => (
                    <div className="r2-status-row" key={m.id}>
                      <span className="r2-status-name">{m.lang === 'PYTHON' ? 'FUSE CTRL' : m.lang === 'JAVA' ? 'POWER DIST' : m.lang === 'C' ? 'CIRCUIT CAL' : 'POWER ROUTER'}</span>
                      <span className="r2-status-val" style={{ color: modSolved(m.id) ? '#39ff14' : m.col, animation: modSolved(m.id) ? 'none' : undefined }}>
                        {modSolved(m.id) ? 'RESTORED' : 'CORRUPTED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="r2-panel r2-panel--flex r2-panel--bl">
              <GoldStars stars={PANEL_STARS.overview} />
              <div className="r2-panel-inner">
                <div className="r2-panel-title r2-panel-title--blue">SYSTEM OVERVIEW</div>
                <div className="r2-overview">
                  <div className="r2-minimap">
                    <img src={electricalBg} alt="minimap" className="r2-minimap-img" />
                    <div className="r2-skull">💀</div>
                  </div>
                  <div className="r2-sector">SECTOR: ELECTRICAL</div>
                </div>
              </div>
            </div>

          </div>

          {/* ── CENTER ── */}
          <div className="r2-center">
            <div className="r2-center-title">
              <h1>ELECTRICAL</h1>
              <p>ENGINEERING LOG ACCESS</p>
            </div>

            <div className="r2-bg">
              <img src={electricalBg} alt="" className="r2-bg-img" />
            </div>

            <Sparks />

            {/* Module boxes */}
            <div className="r2-modules">
              {modules.map(m => {
                const isSolved = modSolved(m.id);
                const isSelected = selectedModule === m.id;
                const isLocked = selectedModule !== null && !isSelected;
                return (
                  <div
                    key={m.id}
                    className={`r2-module r2-mod-${m.id}${isSelected ? ' r2-module--active' : ''}${isLocked ? ' r2-module--locked' : ''}`}
                    style={{ '--color': m.col, '--glow': `rgba(${m.rgb},0.8)`, '--rgb': m.rgb }}
                    onClick={() => selectModule(m.id)}
                  >
                    <div className="r2-module-box" style={{ '--color': isLocked ? '#333' : m.col, '--rgb': isLocked ? '50,50,50' : m.rgb }}>
                      <div className="r2-mod-num" style={isLocked ? { color: '#333', textShadow: 'none' } : {}}>{String(m.id).padStart(2, '0')}</div>
                      <div className="r2-mod-icon" style={isLocked ? { opacity: 0.15 } : {}}>{m.icon}</div>
                      <div className="r2-mod-lang" style={isLocked ? { color: '#333' } : {}}>{m.lang}</div>
                      <div className={`r2-mod-status${isSolved ? ' r2-mod-status--solved' : ''}`} style={isLocked ? { color: '#2a2a2a', animation: 'none' } : {}}>
                        {isLocked ? 'LOCKED' : isSolved ? '✓ RESTORED' : 'CORRUPTED'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="r2-right">

            {/* Module Viewer header */}
            <div className="r2-panel r2-panel--tr" style={{ flexShrink: 0 }}>
              <GoldStars stars={PANEL_STARS.modview} />
              <div className="r2-panel-inner">
                <div className="r2-panel-title r2-panel-title--blue">MODULE VIEWER</div>
                <div style={{ fontSize: '0.55rem', color: '#3a5060', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em' }}>
                  {selectedModule ? `ACTIVE: ${mod.lang}` : 'SELECT A MODULE'}
                </div>
                <div className="r2-mod-tabs">
                  {modules.map(m => {
                    const isSelected = selectedModule === m.id;
                    const isLocked = selectedModule !== null && !isSelected;
                    return (
                      <div
                        key={m.id}
                        className={`r2-tab${isSelected ? ' r2-tab--active' : ''}${isLocked ? ' r2-tab--locked' : ''}`}
                        style={isSelected ? { borderColor: m.col, color: m.col } : {}}
                        onClick={() => selectModule(m.id)}
                      >
                        0{m.id}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── NO MODULE SELECTED: placeholder ── */}
            {!selectedModule && (
              <div className="r2-panel r2-panel--flex">
                <GoldStars stars={PANEL_STARS.code} />
                <div className="r2-panel-inner" style={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div className="r2-choose-icon">⚙</div>
                  <div className="r2-choose-title">CHOOSE A MODULE</div>
                  <div className="r2-choose-sub">TO START</div>
                  <div className="r2-choose-desc">
                    Select one of the 4 language modules from the center panel or the tabs above.
                    You will then solve all 4 bug-hunt questions for that module.
                  </div>
                  <div className="r2-choose-langs">
                    {modules.map(m => (
                      <div
                        key={m.id}
                        className="r2-choose-lang-chip"
                        style={{ '--col': m.col, '--rgb': m.rgb }}
                        onClick={() => selectModule(m.id)}
                      >
                        <span>{m.icon}</span>
                        <span>{m.lang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE SELECTED: question UI ── */}
            {selectedModule && (
              <>
                {/* Question selector */}
                <div className="r2-panel" style={{ flexShrink: 0 }}>
                  <GoldStars stars={PANEL_STARS.qsel} />
                  <div className="r2-panel-inner" style={{ gap: 4 }}>
                    <div className="r2-mod-title">
                      {mod.lang} — SELECT QUESTION
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {mod.questions.map((_, qi) => {
                        const qkey = `${activeModule}-${qi}`;
                        const st = feedback[qkey];
                        return (
                          <div
                            key={qi}
                            className={`r2-tab${activeQ === qi ? ' r2-tab--active' : ''}`}
                            style={{
                              flex: 1,
                              borderColor: st === 'ok' ? '#39ff14' : st === 'err' ? '#ff3030' : activeQ === qi ? mod.col : undefined,
                              color: st === 'ok' ? '#39ff14' : st === 'err' ? '#ff3030' : activeQ === qi ? mod.col : undefined,
                            }}
                            onClick={() => selectQ(qi)}
                          >
                            Q{qi + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Module title */}
                <div className="r2-panel" style={{ flexShrink: 0 }}>
                  <GoldStars stars={PANEL_STARS.modtitle} />
                  <div className="r2-panel-inner" style={{ padding: '6px 12px' }}>
                    <div className="r2-mod-title" style={{ color: mod.col }}>{q.title} — BUG HUNT Q{qIdx + 1}</div>
                  </div>
                </div>

                {/* Code viewer */}
                <div className="r2-panel r2-panel--flex">
                  <GoldStars stars={PANEL_STARS.code} />
                  <div className="r2-panel-inner" style={{ padding: '6px 8px' }}>
                    <div className="r2-code-wrap" style={{ flex: 1, minHeight: 0 }}>
                      <div className="r2-code-scroll">
                        {q.lines.map((line, i) => (
                          <CodeLine key={i} line={line} num={i + 1} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer section */}
                <div className="r2-panel r2-panel--br" style={{ flexShrink: 0 }}>
                  <GoldStars stars={PANEL_STARS.answer} />
                  <div className="r2-panel-inner" style={{ gap: 6 }}>
                    <div className="r2-answer-label">WHAT IS THE OUTPUT?</div>
                    <textarea
                      className="r2-answer-input"
                      rows={2}
                      placeholder="Enter the single-digit output..."
                      value={input}
                      readOnly={isCorrect}
                      onChange={e => { setInput(e.target.value); setFeedback(p => ({ ...p, [key]: undefined })); }}
                      onKeyDown={handleKey}
                    />
                    <button className="r2-submit-btn" onClick={submitAnswer} disabled={isCorrect}>
                      SUBMIT ANALYSIS
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* ══ BOTTOM BAR ══ */}
        <div className="r2-bottom">

          {/* Warning */}
          <div className="r2-bot-panel r2-bot-panel--warn">
            <GoldStars stars={PANEL_STARS.warn} />
            <div className="r2-bot-warn-row">
              <span className="r2-bot-warn-icon">⚠</span>
              <span className="r2-bot-title">WARNING</span>
            </div>
            <div className="r2-bot-body">
              UNAUTHORIZED ACCESS DETECTED<br />
              LOGS MAY BE MANIPULATED
            </div>
            <img src={crewRed} alt="" style={{ width: 28, position: 'absolute', bottom: 8, right: 10, imageRendering: 'pixelated', opacity: 0.6 }} />
          </div>

          {/* Mission Objective */}
          <div className="r2-bot-panel">
            <GoldStars stars={PANEL_STARS.obj} />
            <div className="r2-bot-title r2-bot-title--blue">MISSION OBJECTIVE</div>
            <div className="r2-bot-body">
              Identify the anomaly in each corrupted module.<br />
              <em>Fix one of four bugs to restore the system.</em>
            </div>
          </div>

          {/* Crew Status */}
          <div className="r2-bot-panel r2-bot-panel--prog">
            <GoldStars stars={PANEL_STARS.crew} />
            <div className="r2-bot-title r2-bot-title--blue">CREW STATUS</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <svg width="100%" height="32" viewBox="0 0 120 32">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <g key={i}>
                    <ellipse cx={6 + i * 12} cy="18" rx="4" ry="5" fill={i < 3 ? '#cc2010' : '#1a4a1a'} opacity={i < 3 ? 0.9 : 0.4} />
                    <ellipse cx={6 + i * 12} cy="13" rx="3" ry="3" fill={i < 3 ? '#dd2818' : '#1a4a1a'} opacity={i < 3 ? 0.9 : 0.4} />
                    <ellipse cx={6.5 + i * 12} cy="12.5" rx="1.8" ry="1.1" fill="rgba(160,220,255,0.5)" opacity={i < 3 ? 0.8 : 0.2} />
                  </g>
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.48rem', color: '#cc2010' }}>3 ELIMINATED</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.48rem', color: '#39ff14' }}>{solved}/16 BUGS</span>
            </div>
          </div>

          {/* Note from ARIA */}
          <div className="r2-bot-panel r2-bot-panel--note">
            <GoldStars stars={PANEL_STARS.aria2} />
            <div className="r2-bot-title r2-bot-title--amber">NOTE FROM ARIA</div>
            <div className="r2-bot-body">
              The impostor knew exactly how these systems worked.<br />
              <em>Every line is a clue. Stay sharp, Analyst.</em>
            </div>
            <img src={crewBlue} alt="" style={{ width: 28, position: 'absolute', bottom: 8, right: 10, imageRendering: 'pixelated', opacity: 0.7 }} />
          </div>

        </div>
      </div>

      {showCode && selectedModule && (
        <CodePopup
          mod={mod}
          answers={answers}
          activeModule={activeModule}
          onContinue={onComplete}
        />
      )}
    </>
  );
}

function CodePopup({ mod, answers, activeModule, onContinue }) {
  const digits = [0, 1, 2, 3].map(qi => answers[`${activeModule}-${qi}`] ?? '?');
  const code = digits.join('');

  const [entry, setEntry] = useState(['', '', '', '']);
  const [status, setStatus] = useState('idle');
  const inputRefs = useRef([]);

  const handleDigit = (i, val) => {
    if (!/^[A-Za-z0-9]?$/.test(val)) return;
    const next = [...entry];
    next[i] = val;
    setEntry(next);
    setStatus('idle');
    if (val && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !entry[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSubmit = () => {
    const attempt = entry.join('').toUpperCase();
    if (attempt.length < 4) return;
    if (attempt === code.toUpperCase()) {
      setStatus('ok');
    } else {
      setStatus('err');
      setTimeout(() => {
        setStatus('idle');
        setEntry(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 1200);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(4,5,15,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'linear-gradient(140deg, rgba(14,18,40,0.97), rgba(6,8,22,0.98))',
        border: `1px solid ${mod.col}`,
        borderRadius: '1rem',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        maxWidth: 480,
        width: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1.25rem',
        boxShadow: `0 0 60px ${mod.col}33, 0 0 30px rgba(0,0,0,0.6)`,
      }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 'clamp(0.5rem,1.5vw,0.8rem)', color: '#39ff14', letterSpacing: '0.3em' }}>MODULE RESTORED</div>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 'clamp(0.4rem,1.2vw,0.65rem)', color: mod.col, letterSpacing: '0.15em' }}>{mod.lang} — ALL 4 OUTPUTS FOUND</div>

        <div style={{
          background: 'rgba(255,200,0,0.07)',
          border: '1px solid rgba(255,200,0,0.25)',
          borderRadius: 10,
          padding: '14px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: '0.45rem', color: '#ffc800', letterSpacing: '0.15em', marginBottom: 8 }}>HINT</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
            Four outputs. Four locks. The ship gave them to you in sequence, and only the sequence matters now.
            <br />
            <strong style={{ color: '#ffc800' }}>Recall the answers you found, then place them back in the order that mattered to the system.</strong>
          </div>
        </div>

        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: '0.45rem', color: '#5ac8e8', letterSpacing: '0.2em' }}>
          ENTER ACCESS CODE
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {entry.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={status === 'ok'}
              style={{
                width: '52px', height: '64px',
                background: 'rgba(56,254,220,0.06)',
                border: `2px solid ${status === 'ok' ? '#39ff14' : status === 'err' ? '#ff3030' : 'rgba(56,254,220,0.4)'}`,
                borderRadius: '8px',
                color: status === 'ok' ? '#39ff14' : status === 'err' ? '#ff5050' : '#38fedc',
                fontSize: '1.6rem',
                textAlign: 'center',
                fontFamily: "'Press Start 2P', monospace",
                outline: 'none',
                boxShadow: status === 'ok' ? '0 0 20px rgba(57,255,20,0.5)' : status === 'err' ? '0 0 20px rgba(255,0,0,0.5)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
          ))}
        </div>

        {status === 'err' && <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: '0.45rem', color: '#ff3030', letterSpacing: '0.15em' }}>INCORRECT SEQUENCE</div>}
        {status === 'ok' && <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: '0.45rem', color: '#39ff14', letterSpacing: '0.15em' }}>ACCESS GRANTED</div>}

        {status !== 'ok' ? (
          <button
            onClick={handleSubmit}
            disabled={entry.join('').length < 4}
            style={{
              fontFamily: "'Press Start 2P',monospace", fontSize: '0.55rem',
              padding: '12px 32px',
              background: entry.join('').length === 4 ? 'rgba(56,254,220,0.15)' : 'rgba(100,100,100,0.1)',
              border: `2px solid ${entry.join('').length === 4 ? '#38fedc' : '#444'}`,
              borderRadius: 8,
              color: entry.join('').length === 4 ? '#38fedc' : '#555',
              cursor: entry.join('').length === 4 ? 'pointer' : 'not-allowed',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            SUBMIT
          </button>
        ) : (
          <button
            onClick={onContinue}
            style={{
              fontFamily: "'Press Start 2P',monospace", fontSize: '0.55rem',
              padding: '12px 32px',
              background: 'rgba(56,254,220,0.15)',
              border: '2px solid #38fedc',
              borderRadius: 8, color: '#38fedc',
              cursor: 'pointer', letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(56,254,220,0.3)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(56,254,220,0.15)'}
          >
            CONTINUE MISSION →
          </button>
        )}
      </div>
    </div>
  );
}
