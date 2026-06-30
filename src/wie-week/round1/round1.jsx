import { useState, useEffect, useRef } from 'react';
import { getRound1Questions } from '../api';
import './round1.css';
import adminRoom from './assets/admin_roombg.png';
import crewBlue from './assets/crewmate_blue.png';
import crewGreen from './assets/crewmate_green.png';
import crewRed from './assets/crewmate_red.png';
import crewYellow from './assets/crewmate_yellow.png';

const CREW = [crewBlue, crewGreen, crewRed, crewYellow];

/* ── Starfield ── */
function Stars({ count = 50 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const W = c.offsetWidth || 200, H = c.offsetHeight || 200;
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.1 + 0.2,
      o: Math.random(), d: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.o += s.d; if (s.o > 1 || s.o < 0) s.d *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,210,255,${Math.max(0, Math.min(1, s.o))})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw(); return () => cancelAnimationFrame(raf);
  }, [count]);
  return <canvas ref={ref} className="r1-stars" style={{ width: '100%', height: '100%' }} />;
}

/* ── Kill cooldown ── */
function KillCooldown({ seconds = 10 }) {
  const [rem, setRem] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRem(r => r <= 1 ? seconds : r - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const pct = ((seconds - rem) / seconds * 100).toFixed(0);
  const ready = rem === seconds;
  return (
    <div className="r1-kill">
      <div className="r1-kill-label">KILL COOLDOWN</div>
      <div className="r1-kill-track">
        <div className="r1-kill-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="r1-kill-val">{ready ? '— READY —' : `${rem}s remaining`}</div>
    </div>
  );
}

/* ── Navigating overlay — shown on round completion ── */
function NavigatingOverlay({ onDone, label = 'TASK COMPLETE' }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (count <= 0) onDone(); }, [count, onDone]);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(4,5,15,0.93)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1.5rem',
      animation: 'r1-nav-in 0.4s ease',
    }}>
      <style>{`@keyframes r1-nav-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 'clamp(0.6rem,2vw,1rem)', color: '#39ff14', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(57,255,20,0.7)' }}>
        ✓ {label}
      </div>
      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 'clamp(0.45rem,1.2vw,0.7rem)', color: '#38fedc', letterSpacing: '0.15em', opacity: 0.85 }}>
        NAVIGATING TO NEXT TASK...
      </div>
      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 'clamp(1.5rem,6vw,3.5rem)', color: '#38fedc', textShadow: '0 0 30px rgba(56,254,220,0.8)' }}>
        {count > 0 ? count : ''}
      </div>
    </div>
  );
}

export default function Round1({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getRound1Questions().then(data => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="r1-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Orbitron, monospace', color: '#3a8fc7', letterSpacing: '0.2em', fontSize: '0.9rem' }}>LOADING MISSION DATA...</span>
    </div>
  );

  const q = questions[cur];
  const total = questions.length;
  const done = Object.keys(answers).length;
  const allAnswered = done >= total && total > 0;

  function pick(i) { setSel(i); }
  function next() {
    if (sel === null) return;
    const updated = { ...answers, [cur]: sel };
    setAnswers(updated);
    if (cur < total - 1) { setCur(c => c + 1); setSel(updated[cur + 1] ?? null); }
  }
  function back() {
    if (cur === 0) return;
    setAnswers(p => ({ ...p, [cur]: sel }));
    setCur(c => c - 1); setSel(answers[cur - 1] ?? null);
  }

  return (
    <>
      <div className="r1-layout">

        {/* ══ TOP ROW ══ */}
        <div className="r1-row-top">

          {/* TL — Ship Vitals */}
          <div className="r1-glow"><div className="r1-box r1-box--tl">
            <Stars count={35} />
            <div className="r1-panel">
              <div className="r1-ptitle">⬡ SHIP VITALS</div>
              <div className="r1-vitals">
                {[
                  { label: 'O₂', cls: 'blue', val: '78%', vcls: 'ok' },
                  { label: 'REACTOR', cls: 'green', val: '91%', vcls: 'ok' },
                  { label: 'COMMS', cls: 'red', val: 'FAIL', vcls: 'crit' },
                  { label: 'SHIELDS', cls: 'amber', val: '55%', vcls: 'warn' },
                ].map(({ label, cls, val, vcls }) => (
                  <div className="r1-vrow" key={label}>
                    <span className="r1-vlabel">{label}</span>
                    <div className="r1-vbar"><div className={`r1-vfill r1-vfill--${cls}`} /></div>
                    <span className={`r1-vval r1-vval--${vcls}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div></div>

          <h1 className="r1-title">ADMIN TABLE</h1>

          {/* TR — Ship Position */}
          <div className="r1-glow"><div className="r1-box r1-box--tr">
            <Stars count={35} />
            <div className="r1-panel">
              <div className="r1-ptitle" style={{ textAlign: 'center' }}>⬡ SHIP POSITION</div>
              <div className="r1-tally">
                <svg style={{ width: '100%', flex: 1, minHeight: 0 }} viewBox="0 0 120 80" preserveAspectRatio="xMidYMid meet">
                  {[0, 20, 40, 60, 80, 100, 120].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="80" stroke="rgba(42,122,170,0.08)" strokeWidth="0.5" />
                  ))}
                  {[0, 20, 40, 60, 80].map(y => (
                    <line key={y} x1="0" y1={y} x2="120" y2={y} stroke="rgba(42,122,170,0.08)" strokeWidth="0.5" />
                  ))}
                  <ellipse cx="60" cy="40" rx="50" ry="30" fill="none" stroke="rgba(42,122,170,0.12)" strokeWidth="0.6" strokeDasharray="3,3" />
                  <ellipse cx="60" cy="40" rx="30" ry="18" fill="none" stroke="rgba(42,122,170,0.1)" strokeWidth="0.6" strokeDasharray="2,4" />
                  <circle cx="60" cy="40" r="6" fill="#0a2040" stroke="rgba(42,122,170,0.4)" strokeWidth="0.8" />
                  <circle cx="60" cy="40" r="3" fill="#1a4a70" />
                  <circle r="2.5" fill="#39ff14">
                    <animateMotion dur="6s" repeatCount="indefinite">
                      <mpath href="#orbit1" />
                    </animateMotion>
                  </circle>
                  <path id="orbit1" d="M110,40 A50,30 0 1,1 109.9,40" fill="none" />
                  <circle r="1.8" fill="#3a8fc7">
                    <animateMotion dur="4s" repeatCount="indefinite" begin="-2s">
                      <mpath href="#orbit2" />
                    </animateMotion>
                  </circle>
                  <path id="orbit2" d="M90,40 A30,18 0 1,1 89.9,40" fill="none" />
                  <polygon points="60,12 63,18 60,16 57,18" fill="#ffaa00" opacity="0.9">
                    <animateTransform attributeName="transform" type="rotate" from="0 60 40" to="360 60 40" dur="10s" repeatCount="indefinite" />
                  </polygon>
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexShrink: 0 }}>
                  <span className="r1-tsub">SECTOR: SKELD-7</span>
                  <span className="r1-tsub" style={{ color: '#ffaa00' }}>ORBIT ACTIVE</span>
                </div>
              </div>
            </div>
          </div></div>
        </div>

        {/* ══ MID ROW ══ */}
        <div className="r1-row-mid">

          {/* Left column */}
          <div className="r1-col-side">

            {/* LT — Crew Radar */}
            <div className="r1-glow"><div className="r1-box r1-box--sl-t">
              <Stars count={20} />
              <div className="r1-panel">
                <div className="r1-ptitle">⬡ CREW RADAR</div>
                <div className="r1-radar-wrap">
                  <svg className="r1-radar-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(42,122,170,0.15)" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(42,122,170,0.12)" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(42,122,170,0.1)" strokeWidth="0.8" />
                    <line x1="50" y1="4" x2="50" y2="96" stroke="rgba(42,122,170,0.08)" strokeWidth="0.5" />
                    <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(42,122,170,0.08)" strokeWidth="0.5" />
                    <g className="r1-rsweep">
                      <path d="M50,50 L50,4 A46,46 0 0,1 96,50 Z" fill="rgba(57,255,20,0.06)" />
                      <line x1="50" y1="50" x2="50" y2="4" stroke="rgba(57,255,20,0.45)" strokeWidth="0.8" />
                    </g>
                    <circle className="r1-rdot" cx="67" cy="28" r="3" fill="#39ff14" />
                    <circle className="r1-rdot" cx="33" cy="70" r="3" fill="#3a8fc7" style={{ animationDelay: '1s' }} />
                    <circle className="r1-rdot" cx="75" cy="66" r="3" fill="#ff4060" style={{ animationDelay: '2s' }} />
                    <circle className="r1-rdot" cx="26" cy="36" r="2.5" fill="#ffaa00" style={{ animationDelay: '0.5s' }} />
                    <circle cx="50" cy="50" r="3" fill="#e0f4ff" />
                  </svg>
                </div>
                <div className="r1-vrow" style={{ flexShrink: 0, gap: 6 }}>
                  <span className="r1-vlabel" style={{ width: 'auto' }}>CREW ALIVE</span>
                  <span className="r1-vval r1-vval--ok" style={{ marginLeft: 'auto' }}>7 / 10</span>
                </div>
              </div>
            </div></div>

            {/* LB — Sabotage Log */}
            <div className="r1-glow"><div className="r1-box r1-box--sl-b">
              <Stars count={18} />
              <div className="r1-panel">
                <div className="r1-ptitle">⬡ SABOTAGE LOG</div>
                <div className="r1-feed">
                  {[
                    { text: '!! COMMS DOWN', cls: 'crit' },
                    { text: '⚠ LIGHTS FLICKER', cls: 'warn' },
                    { text: 'O2 NOMINAL', cls: '' },
                    { text: '⚠ VENT OPENED', cls: 'warn' },
                    { text: 'REACTOR STABLE', cls: '' },
                    { text: 'MEDBAY SECURE', cls: '' },
                  ].map(({ text, cls }, i) => (
                    <div key={i} className={`r1-fitem${cls ? ` r1-fitem--${cls}` : ''}`}>{text}</div>
                  ))}
                </div>
              </div>
            </div></div>
          </div>

          {/* Center octagon */}
          <div className="r1-center" style={{ backgroundImage: `url(${adminRoom})` }}>
            <div className="r1-quiz">
              <div className="r1-header">
                <button className="r1-back-btn" onClick={back} disabled={cur === 0}>←</button>
                <div className="r1-badge">ROUND &nbsp; 1</div>
                <span className="r1-counter">{cur + 1}|{total}</span>
              </div>
              <div className="r1-qbox">
                <p className="r1-qtext">Q{cur + 1}. {q.q.toUpperCase()}</p>
              </div>
              <div className="r1-opts">
                {q.opts.map((opt, i) => (
                  <button key={i} className={`r1-opt${sel === i ? ' r1-opt--on' : ''}`} onClick={() => pick(i)}>
                    <img src={CREW[i]} alt="" className="r1-crew-icon" />
                    <span className="r1-opt-text">{opt}</span>
                  </button>
                ))}
              </div>
              <button className={`r1-next${sel !== null ? ' r1-next--on' : ''}`} onClick={next} disabled={sel === null}>
                {cur === total - 1 ? 'SUBMIT' : 'NEXT →'}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="r1-col-side">

            {/* RT — Impostor Scan */}
            <div className="r1-glow"><div className="r1-box r1-box--sr-t">
              <Stars count={20} />
              <div className="r1-panel">
                <div className="r1-ptitle">⬡ IMPOSTOR SCAN</div>
                <div className="r1-scan">
                  <div className="r1-scan-rings">
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(200,30,50,0.1)" strokeWidth="0.8" />
                      <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(200,30,50,0.08)" strokeWidth="0.8" />
                      <circle className="r1-pring" cx="50" cy="50" r="6" fill="none" stroke="rgba(255,32,64,0.8)" strokeWidth="1.2" />
                      <circle className="r1-pring" cx="50" cy="50" r="6" fill="none" stroke="rgba(255,32,64,0.5)" strokeWidth="1" style={{ animationDelay: '0.65s' }} />
                      <circle className="r1-pring" cx="50" cy="50" r="6" fill="none" stroke="rgba(255,32,64,0.25)" strokeWidth="0.8" style={{ animationDelay: '1.3s' }} />
                    </svg>
                    <img src={crewRed} alt="crewmate" className="r1-scan-crew" />
                  </div>
                  <div className="r1-vrow" style={{ flexShrink: 0, gap: 6, width: '100%' }}>
                    <span className="r1-vlabel" style={{ width: 'auto' }}>THREAT LVL</span>
                    <span className="r1-vval r1-vval--crit" style={{ marginLeft: 'auto' }}>HIGH</span>
                  </div>
                </div>
              </div>
            </div></div>

            {/* RB — Vent Activity */}
            <div className="r1-glow"><div className="r1-box r1-box--sr-b">
              <Stars count={18} />
              <div className="r1-panel">
                <div className="r1-ptitle">⬡ VENT ACTIVITY</div>
                <div className="r1-vents">
                  {[
                    { room: 'CAFETERIA', active: false },
                    { room: 'ELECTRICAL', active: true },
                    { room: 'MEDBAY', active: false },
                    { room: 'STORAGE', active: false },
                    { room: 'ADMIN', active: true },
                    { room: 'SHIELDS', active: false },
                  ].map(({ room, active }) => (
                    <div key={room} className={`r1-vitem${active ? ' r1-vitem--active' : ''}`}>
                      {room} — {active ? 'MOTION' : 'CLEAR'}
                    </div>
                  ))}
                </div>
              </div>
            </div></div>
          </div>
        </div>

        {/* ══ BOT ROW ══ */}
        <div className="r1-row-bot">

          {/* BL — Warning */}
          <div className="r1-glow"><div className="r1-box r1-box--b1">
            <Stars count={12} />
            <div className="r1-warn">
              <span className="r1-warn-icon">⚠</span>
              <span className="r1-warn-text">UNAUTHORISED ACCESS DETECTED — LOGS MAY BE COMPROMISED</span>
            </div>
          </div></div>

          {/* BC — Scrolling Guidelines */}
          <div className="r1-glow"><div className="r1-box">
            <Stars count={12} />
            <div className="r1-guide">
              <div className="r1-ticker-wrap">
                <div className="r1-ticker">
                  <span>◈ ROUND 1 OBJECTIVES &nbsp;—&nbsp; Answer all 20 questions to advance to Round 2 &nbsp;▸&nbsp; Use NEXT / ← to navigate freely between questions &nbsp;▸&nbsp; All 20 answers must be submitted before proceeding &nbsp;▸&nbsp; One answer per question — choose wisely, crewmate &nbsp;▸&nbsp;</span>
                  <span aria-hidden>◈ ROUND 1 OBJECTIVES &nbsp;—&nbsp; Answer all 20 questions to advance to Round 2 &nbsp;▸&nbsp; Use NEXT / ← to navigate freely between questions &nbsp;▸&nbsp; All 20 answers must be submitted before proceeding &nbsp;▸&nbsp; One answer per question — choose wisely, crewmate &nbsp;▸&nbsp;</span>
                </div>
              </div>
            </div>
          </div></div>

          {/* BR — Kill Cooldown */}
          <div className="r1-glow"><div className="r1-box r1-box--b3">
            <Stars count={12} />
            <KillCooldown seconds={10} />
          </div></div>

        </div>
      </div>

      {allAnswered && onComplete && <NavigatingOverlay onDone={onComplete} label="ROUND 1 COMPLETE" />}
    </>
  );
}