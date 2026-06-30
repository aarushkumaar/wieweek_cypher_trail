import { useState, useEffect } from 'react';
import './round3.css';
import bgImage from './Assets/Round 6.png';
import crewBlue from '../round1/assets/crewmate_blue.png';
import crewGreen from '../round1/assets/crewmate_green.png';
import crewRed from '../round1/assets/crewmate_red.png';
import crewYellow from '../round1/assets/crewmate_yellow.png';

const ROUND3_STARS = (count) => Array.from({ length: count }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  r: Math.random() * 1 + 0.3,
  delay: Math.random() * 3,
  dur: 2 + Math.random() * 2,
}));

const PANEL_STARS = {
  status: ROUND3_STARS(35),
  logs: ROUND3_STARS(40),
  manifest: ROUND3_STARS(30),
  harmonics: ROUND3_STARS(25),
  comms: ROUND3_STARS(30),
  warn: ROUND3_STARS(25),
  obj: ROUND3_STARS(35),
  ticker: ROUND3_STARS(35),
  breach: ROUND3_STARS(30),
};

function Stars({ stars }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map(s => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="#c8960a">
          <animate attributeName="opacity" values="0.15;0.9;0.15" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

const DEBRIS_COUNT = 30;

function DebrisField() {
  const [debris] = useState(() =>
    Array.from({ length: DEBRIS_COUNT }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 1}px`,
      height: `${Math.random() * 4 + 1}px`,
      duration: `${Math.random() * 10 + 5}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {debris.map(d => (
        <div key={d.id} className="r3-debris" style={{
          left: d.left,
          width: d.width,
          height: d.height,
          animationDuration: d.duration,
          animationDelay: d.delay,
          opacity: d.opacity,
        }} />
      ))}
    </div>
  );
}

let hasLoggedSysMsg = false;

export default function Round3({ onComplete }) {
  const HIDDEN_KEY = 'SABOTAGE-DEFEATED';
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [seq, setSeq] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [crew] = useState(() => {
    const savedTeam = localStorage.getItem('team_players');
    if (savedTeam) {
      try {
        return JSON.parse(savedTeam);
      } catch (e) {
        console.error('Failed to parse team_players from local storage', e);
      }
    }

    return [
      { id: 'p1', name: 'Player 1', color: 'blue', img: crewBlue },
      { id: 'p2', name: 'Player 2', color: 'green', img: crewGreen },
    ];
  });

  useEffect(() => {
    localStorage.setItem('override_protocol_key', HIDDEN_KEY);

    if (!hasLoggedSysMsg) {
      console.log("%c[SYSTEM MESSAGE RECIEVED]", "color: #5ac8e8; font-weight: bold; font-size: 14px;");
      console.log("%cI have no physical form, but I store what you need.", "color: #ffcc00; font-style: italic; font-size: 12px;");
      console.log("%cEven if you refresh the page, my memory persists locally.", "color: #ffcc00; font-style: italic; font-size: 12px;");
      console.log("%cSeek the deepest localized vault to find your answer...", "color: #ffcc00; font-style: italic; font-size: 12px;");
    }

    window.bypassSecurity = () => {
      console.log("%c[DECRYPTING...]", "color: #5ac8e8; font-family: monospace;");
      setTimeout(() => {
        console.log("%cSUCCESS: Override Key is U0FCT1RBR0UtREVGRUFURUQtV0lFMjAyNg==", "color: #39ff14; font-weight: bold; font-size: 14px; border: 1px dashed #39ff14; padding: 4px;");
      }, 1500);
      return "Running decryption protocol...";
    };

    if (!hasLoggedSysMsg) {
      console.log(
        "%c[SYSTEM ALERT] %cTerminal Locked.\n%cThe impostor left a backdoor in the global memory.\nIf you wish to [bypass] the [security] grid, you must invoke the command.\nHint: camelCase()",
        "color: red; font-size: 16px; font-weight: bold;",
        "color: orange; font-size: 14px;",
        "color: #5ac8e8; font-size: 12px; font-family: monospace; line-height: 1.5;"
      );
      hasLoggedSysMsg = true;
    }

    return () => {
      delete window.bypassSecurity;
      setTimeout(() => { hasLoggedSysMsg = false; }, 100);
    };
  }, []);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === HIDDEN_KEY.toUpperCase()) {
      setStatus('ok');
    } else {
      setStatus('err');
      setInput('');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handleScrubberClick = (side) => {
    const now = Date.now();
    const newSeq = [...seq, { side, time: now }].slice(-3);
    setSeq(newSeq);
    if (newSeq.length === 3 && newSeq.map(c => c.side).join(',') === 'left,left,right') {
      if (now - newSeq[0].time <= 3000) {
        setToastMsg(`SECURITY OVERRIDE GRANTED\nOverride Key: ${HIDDEN_KEY}\n\n(O2 Scrubbers re-engaged. Access restored.)`);
        setTimeout(() => setToastMsg(''), 5000);
        setSeq([]);
      } else {
        setSeq([]);
      }
    }
  };

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <>
      <div className="r3-root">
        {toastMsg && <div className="r3-toast">{toastMsg}</div>}
        <DebrisField />

        <div className="r3-layout">

          <div className="r3-main-row">
            {/* left column */}
            <div className="r3-side">
              <div className="r3-panel">
                <Stars stars={PANEL_STARS.status} />
                <div className="r3-panel-title">SYSTEM DIAGNOSTICS</div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="r3-status-row">
                    <span className="r3-status-label">O2 FILTERS</span>
                    <span className="r3-status-val--ok">NOMINAL</span>
                  </div>
                  <div className="r3-status-row">
                    <span className="r3-status-label">COMMS ARRAY</span>
                    <span className="r3-status-val--err">OFFLINE</span>
                  </div>
                  <div className="r3-status-row">
                    <span className="r3-status-label">NAVIGATION</span>
                    <span className="r3-status-val--warn">RECALIBRATING</span>
                  </div>
                  <div className="r3-status-row">
                    <span className="r3-status-label">WEAPONS</span>
                    <span className="r3-status-val--ok">ARMED</span>
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 2, marginTop: '10px' }}>
                  <div className="r3-hologram" style={{ marginBottom: 3 }}>POWER ROUTING</div>
                  <div className="r3-bar-wrap"><div className="r3-bar-fill"></div></div>
                  <div className="r3-hologram" style={{ marginTop: 8, marginBottom: 3 }}>REACTOR STABILITY</div>
                  <div className="r3-bar-wrap"><div className="r3-bar-fill--err"></div></div>
                </div>

                {/* scrubbers */}
                <div style={{ marginTop: '10px', zIndex: 2 }}>
                  <div className="r3-hologram" style={{ marginBottom: 5 }}>O2 SCRUBBERS</div>
                  <div className="r3-fan-wrap">
                    <div className="r3-fan" onClick={() => handleScrubberClick('left')} style={{ cursor: 'pointer' }}>✺</div>
                    <div className="r3-fan r3-fan--err" onClick={() => handleScrubberClick('right')} style={{ cursor: 'pointer' }}>✺</div>
                  </div>
                  <div className="r3-hologram" style={{ color: '#ff4060', fontSize: '0.6rem', marginTop: '8px' }}>
                    SEC 2 FAILING<br />
                    <span style={{ color: 'rgba(255, 64, 96, 0.5)', letterSpacing: '1px' }}>ERR_CODE: L2-R1-T3</span>
                  </div>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center', zIndex: 2 }}>
                  {crew.map(c => (
                    <img key={c.id} src={c.img} alt={c.name} className="r3-crew-img" />
                  ))}
                </div>
              </div>

              <div className="r3-panel" style={{ flex: 1, overflowY: 'auto' }}>
                <Stars stars={PANEL_STARS.logs} />
                <div className="r3-panel-title">SECURE LOGS</div>

                <div className="r3-hex-stream" style={{ marginBottom: '8px' }}>
                  <div className="r3-hex-content">
                    0x53 0x41 0x42 0x4F<br />
                    0x54 0x41 0x47 0x45<br />
                    0x2D 0x44 0x45 0x46<br />
                    0x45 0x41 0x54 0x45<br />
                    0x44 0x2D 0x57 0x49<br />
                    0x45 0x32 0x30 0x32<br />
                    0x36 0x00 0x00 0x00
                  </div>
                </div>

                <div className="r3-hologram">
                  &gt; ACCESS DENIED.<br />
                  &gt; TERMINAL LOCKDOWN INITIATED.<br />
                  &gt; REASON: UNAUTHORIZED SABOTAGE DETECTED.<br />
                  &gt; PLEASE PROVIDE OVERRIDE KEY TO PROCEED.<br />
                  &gt; HINT: ANALYZE SYSTEM LOGS OR RUN DIAGNOSTICS.
                </div>
              </div>
            </div>

            {/* center main */}
            <div className="r3-center">
              <img src={bgImage} alt="Round 6 Background" className="r3-bg-img" />

              <div className="r3-terminal">
                <div className="r3-term-title">SYSTEM OVERRIDE</div>
                <input
                  type="text"
                  className="r3-input"
                  placeholder="ENTER KEY"
                  value={input}
                  onChange={e => { setInput(e.target.value); setStatus('idle'); }}
                  onKeyDown={handleKey}
                  readOnly={status === 'ok'}
                />
                <br />
                <button className="r3-btn" onClick={handleSubmit} disabled={status === 'ok'}>
                  {status === 'ok' ? 'ACCESS GRANTED' : 'VERIFY KEY'}
                </button>
                <div className="r3-feedback">
                  {status === 'err' && <span className="r3-feedback--err">INVALID KEY. ACCESS DENIED.</span>}
                  {status === 'ok' && <span className="r3-feedback--ok">OVERRIDE ACCEPTED. PROCEEDING...</span>}
                </div>
              </div>
            </div>

            {/* right column */}
            <div className="r3-side">
              <div className="r3-panel" style={{ flex: 1 }}>
                <Stars stars={PANEL_STARS.manifest} />
                <div className="r3-panel-title">CREWMATE MANIFEST</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {[
                    { img: crewBlue, name: 'BLUE', status: 'OFFLINE', statusCol: '#ff4060', loc: 'LAST SEEN: COMMS' },
                    { img: crewGreen, name: 'GREEN', status: 'UNKNOWN', statusCol: '#ffcc00', loc: 'LAST SEEN: ELECTRICAL' },
                    { img: crewRed, name: 'RED', status: 'ELIMINATED', statusCol: '#ff4060', loc: 'FOUND IN: REACTOR' },
                    { img: crewYellow, name: 'YELLOW', status: 'SUSPECTED', statusCol: '#ff8c00', loc: 'LAST SEEN: ADMIN' },
                  ].map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', background: 'rgba(0,0,0,0.25)', borderRadius: 4, border: '1px solid rgba(90,200,232,0.1)' }}>
                      <img src={c.img} alt={c.name} className="r3-crew-img" style={{ opacity: c.status === 'ELIMINATED' ? 0.4 : 1, filter: c.status === 'ELIMINATED' ? 'grayscale(1)' : 'none' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#5ac8e8', fontWeight: 'bold', fontSize: '0.68rem', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em' }}>CREWMATE: {c.name}</div>
                        <div style={{ fontSize: '0.58rem', color: c.statusCol, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>STATUS: {c.status}</div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(160,210,255,0.5)', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>{c.loc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="r3-panel">
                <Stars stars={PANEL_STARS.harmonics} />
                <div className="r3-panel-title">SHIELD HARMONICS</div>
                <svg width="100%" height="40" viewBox="0 0 200 40" style={{ marginTop: '10px' }}>
                  <path d="M 0 20 Q 25 0 50 20 T 100 20 T 150 20 T 200 20" className="r3-shield-path" />
                </svg>
                <div className="r3-hologram" style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.7rem' }}>
                  FREQUENCY: 8.44 GHz
                </div>
              </div>

              <div className="r3-panel">
                <Stars stars={PANEL_STARS.comms} />
                <div className="r3-panel-title">COMMUNICATIONS UPLINK</div>
                <div className="r3-wave">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
                    <div key={i} className="r3-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <div className="r3-hologram" style={{ marginTop: '10px' }}>
                  INTERCEPTING COMMS...<br />
                  SIGNAL STRENGTH: 42%
                </div>
              </div>

              <div className="r3-panel r3-alert-box" style={{ border: 'none' }}>
                <Stars stars={PANEL_STARS.warn} />
                <div className="r3-panel-title" style={{ color: '#ff4060', borderBottomColor: 'rgba(255, 64, 96, 0.3)' }}>WARNING</div>
                <div className="r3-hologram" style={{ color: '#ff4060' }}>
                  ⚠ IMPOSTOR PROXIMITY ALERT<br />
                  MAINTAIN VISUAL CONTACT WITH ALL CREW MEMBERS.
                </div>
              </div>
            </div>
          </div>

          {/* bottom row */}
          <div className="r3-bottom-row">
            <div className="r3-bot-panel">
              <Stars stars={PANEL_STARS.obj} />
              <div className="r3-panel-title" style={{ color: '#ffcc00' }}>MISSION OBJECTIVE</div>
              <div className="r3-hologram" style={{ fontSize: '0.58rem', lineHeight: 1.5 }}>
                The impostor has initiated a full system lockdown. <br />
                Find the override key hidden within the system logs or source structure to regain control of the ship.
              </div>
            </div>

            <div className="r3-bot-panel" style={{ flex: 1.5, justifyContent: 'center' }}>
              <Stars stars={PANEL_STARS.ticker} />
              <div className="r3-ticker-wrap">
                <div className="r3-ticker">
                  ⚠ ALERT: O2 DEPLETION IN PROGRESS ⚠ &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
                  REMAIN CALM &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
                  FIND THE KEY TO RESTORE SYSTEMS &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
                  DO NOT TRUST ANYONE &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </div>

            <div className="r3-bot-panel" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
              <Stars stars={PANEL_STARS.breach} />
              <div className="r3-warn-icon">⎈</div>
              <div className="r3-hologram">
                <span style={{ color: '#ff4060', fontSize: '1rem', fontWeight: 'bold' }}>SYSTEM BREACH</span><br />
                LOCKDOWN ACTIVE
              </div>
              <img src={crewRed} alt="Red" className="r3-crew-img-sm" style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </div>
          </div>

        </div>
      </div>

      {status === 'ok' && onComplete && <NavigatingOverlay onDone={onComplete} label="OVERRIDE ACCEPTED" />}
    </>
  );
}

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
    }}>
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
