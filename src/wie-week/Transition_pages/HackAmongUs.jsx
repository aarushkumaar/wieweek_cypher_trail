import { useEffect, useRef, useState } from "react";
import cafeteriaImg from "./assets/cafeteria.png";
import buttonImg from "./assets/emergency-button.png";
import meetingImg from "./assets/emergency-meeting.png";
import { playAlarm, playPress, playBlip, setVolume, getVolume } from "./hackAudio";
import { anomalies, debugs } from "./hackChallenges";
import "./HackAmongUs.css";
import crewRed from "../round1/assets/crewmate_red.png";
import crewBlue from "../round1/assets/crewmate_blue.png";
import crewGreen from "../round1/assets/crewmate_green.png";
import crewYellow from "../round1/assets/crewmate_yellow.png";

// ─── Phase type ───────────────────────────────────────────────────────────────
// "landing" | "zoom" | "press" | "meeting" | "briefing" | "anomaly" | "debug" | "results"

export default function HackAmongUs({ onComplete, roundNum = 1 }) {
    const [phase, setPhase] = useState("landing");
    return (
        <div className="hack-root">
            <Starfield />
            <FloatingCrewmates />
            {phase === "landing" && <Landing onStart={() => setPhase("zoom")} roundNum={roundNum} />}
            {(phase === "zoom" || phase === "press") && (
                <ButtonSequence phase={phase} onAdvance={(p) => setPhase(p)} />
            )}
            {phase === "meeting" && <MeetingOverlay onDone={onComplete} />}
        </div>
    );
}

/* ── Starfield ──────────────────────────────────────────────────────────────── */
function Starfield() {
    const stars = Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        delay: Math.random() * 8,
        dur: 5 + Math.random() * 5,
    }));
    return (
        <div className="hack-starfield">
            {stars.map((s) => (
                <span
                    key={s.id}
                    className="hack-star"
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        width: s.size,
                        height: s.size,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.dur}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Floating Crewmates ─────────────────────────────────────────────────────── */
const FLOAT_ANIMS = [
    'hack-cfloat-a', 'hack-cfloat-b', 'hack-cfloat-c',
    'hack-cfloat-d', 'hack-cfloat-e', 'hack-cfloat-f',
];

function FloatingCrewmates() {
    const imgs = [crewRed, crewBlue, crewGreen, crewYellow];
    const crewmates = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        src: imgs[i % imgs.length],
        size: 42 + (i * 9) % 36,          // 42–78 px
        x: (i * 13 + 4) % 88,             // spread across viewport
        y: (i * 19 + 6) % 82,
        anim: FLOAT_ANIMS[i % FLOAT_ANIMS.length],
        dur: 20 + (i * 5) % 16,           // 20–36 s
        delay: -(i * 4.2),                 // stagger so they don't sync
        flip: i % 2 !== 0,
    }));
    return (
        <div className="hack-crewmates-layer">
            {crewmates.map(c => (
                <img
                    key={c.id}
                    src={c.src}
                    alt=""
                    className="hack-crewmate"
                    style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        width: c.size,
                        height: 'auto',
                        animationName: c.anim,
                        animationDuration: `${c.dur}s`,
                        animationDelay: `${c.delay}s`,
                        transform: c.flip ? 'scaleX(-1)' : undefined,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Landing ────────────────────────────────────────────────────────────────── */
/* ── Landing ────────────────────────────────────────────────────────────────── */
const EMERGENCY = { x: 48.8, y: 48.4, w: 5, h: 4 };

function Landing({ onStart, roundNum }) {
    return (
        <section className="hack-landing">
            <div className="hack-cafeteria-wrap">
                <div className="hack-cafeteria-stage hack-camera-drift">
                    <img src={cafeteriaImg} alt="Cafeteria" className="hack-cafeteria-img" draggable={false} />
                    <EmergencyHotspot onClick={onStart} />
                    {/* Task pips — horizontal row below the lower two tables */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '75%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 'clamp(6px, 1.2vw, 14px)',
                        zIndex: 6,
                        pointerEvents: 'none',
                    }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <div
                                key={n}
                                className={`hack-task-pip ${
                                    n < roundNum ? 'hack-task-pip--done'
                                    : n === roundNum ? 'hack-task-pip--active'
                                    : ''
                                }`}
                                style={{ position: 'relative', left: 'unset', top: 'unset', transform: 'none' }}
                            >
                                <span className="hack-task-pip-num">{n}</span>
                                <span className="hack-task-pip-label">TASK {n}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hack-vignette" />

            <div className="hack-hero">
                <h1 className="hack-title">ARE YOU READY?</h1>
            </div>

            <div className="hack-press-prompt">
                <span className="hack-press-arrow">↓</span>
                PRESS THE EMERGENCY BUTTON TO BEGIN ROUND {String(roundNum).padStart(2, '0')}
                <span className="hack-press-arrow">↓</span>
            </div>
        </section>
    );
}

function EmergencyHotspot({ onClick }) {
    return (
        <button
            onClick={onClick}
            aria-label="Press the emergency button"
            className="hack-emergency-hotspot"
            style={{
                left: `${EMERGENCY.x}%`,
                top: `${EMERGENCY.y}%`,
                width: `${EMERGENCY.w}%`,
                height: `${EMERGENCY.h * 1.25}%`,
            }}
        />
    );
}

function TableHotspot({ label, x, y, w, h, onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            aria-label={label}
            className="hack-table-hotspot"
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
        >
            <span className={`hack-table-glow-ring ${hover ? "hack-table-glow-ring--active" : ""}`} />
            <span className={`hack-table-label ${hover ? "hack-table-label--visible" : ""}`}>
                {label.toUpperCase()}
            </span>
        </button>
    );
}

function TableModal({ id, onClose }) {
    return (
        <div className="hack-modal-backdrop" onClick={onClose}>
            <div className="hack-modal-bg" />
            <div className="hack-modal-box" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close" className="hack-modal-close">✕</button>
                {id === "settings" && <SettingsPanel />}
                {id === "about" && <AboutPanel />}
            </div>
        </div>
    );
}

function PanelTitle({ tag, title }) {
    return (
        <>
            <span className="hack-panel-tag">{tag}</span>
            <h3 className="hack-panel-title hack-glow-cyan">{title}</h3>
        </>
    );
}

function SettingsPanel() {
    const [reduce, setReduce] = useState(() => localStorage.getItem("hau_reduce") === "1");
    const [shake, setShake] = useState(() => localStorage.getItem("hau_shake") !== "0");
    useEffect(() => { localStorage.setItem("hau_reduce", reduce ? "1" : "0"); }, [reduce]);
    useEffect(() => { localStorage.setItem("hau_shake", shake ? "1" : "0"); }, [shake]);
    const reset = () => {
        sessionStorage.removeItem("hau_anomaly");
        sessionStorage.removeItem("hau_debug");
    };
    return (
        <div>
            <PanelTitle tag="Table 01" title="Settings" />
            <div className="hack-panel-body">
                <Toggle label="Reduce motion" value={reduce} onChange={setReduce} />
                <Toggle label="Screen shake" value={shake} onChange={setShake} />
                <button onClick={reset} className="hack-btn hack-btn--primary hack-btn--full hack-mt">
                    RESET MISSION PROGRESS
                </button>
            </div>
        </div>
    );
}

function Toggle({ label, value, onChange }) {
    return (
        <label className="hack-toggle">
            <span className="hack-toggle-label">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`hack-toggle-track ${value ? "hack-toggle-track--on" : ""}`}
            >
                <span className={`hack-toggle-thumb ${value ? "hack-toggle-thumb--on" : ""}`} />
            </button>
        </label>
    );
}

function AboutPanel() {
    return (
        <div>
            <PanelTitle tag="Table 02" title="About" />
            <p className="hack-muted hack-mt-sm">
                <span className="hack-accent">Hack Among Us</span> is a hackathon-style mission portal where crewmates
                hunt the impostor hiding in code, logs, and AI outputs. Press the central emergency button to begin Round 2 —
                spot the anomalies, squash the bugs, and earn your rank aboard the ship.
            </p>
            <div className="hack-meta-grid hack-mt">
                <Meta k="Edition" v="v1.0" />
                <Meta k="Rounds" v="2" />
                <Meta k="Challenges" v="10" />
                <Meta k="Mode" v="Solo" />
            </div>
        </div>
    );
}
function Meta({ k, v }) {
    return (
        <div className="hack-meta-card">
            <div className="hack-meta-key">{k}</div>
            <div className="hack-meta-val">{v}</div>
        </div>
    );
}

function VolumePanel() {
    const [vol, setVol] = useState(() => Math.round(getVolume() * 100));
    useEffect(() => { setVolume(vol / 100); }, [vol]);
    return (
        <div>
            <PanelTitle tag="Table 03" title="Volume" />
            <p className="hack-muted hack-mt-sm">Adjust the ship's siren and effects.</p>
            <div className="hack-volume-row hack-mt">
                <span className="hack-muted hack-small">0</span>
                <input
                    type="range" min={0} max={100} value={vol}
                    onChange={(e) => setVol(parseInt(e.target.value, 10))}
                    className="hack-slider"
                />
                <span className="hack-accent hack-small">{vol}</span>
            </div>
            <button onClick={() => playBlip(true)} className="hack-btn hack-btn--accent hack-btn--full hack-mt">
                TEST SOUND
            </button>
        </div>
    );
}

function HelpPanel() {
    return (
        <div>
            <PanelTitle tag="Table 04" title="How To Play" />
            <ol className="hack-help-list hack-mt-sm">
                <li><span className="hack-step-num">01</span>Hover over the center table and press the emergency button.</li>
                <li><span className="hack-step-num">02</span>Survive the meeting cinematic — the ship is in danger.</li>
                <li><span className="hack-step-num">03</span>Round 2: identify 5 anomalies hidden in system data.</li>
                <li><span className="hack-step-num">04</span>Debugging mission: find the buggy line in 5 snippets.</li>
                <li><span className="hack-step-num">05</span>Earn your rank — from Crewmate to Elite Investigator.</li>
            </ol>
        </div>
    );
}

/* ── Button Sequence ────────────────────────────────────────────────────────── */
function ButtonSequence({ phase, onAdvance }) {
    const [coverOpen, setCoverOpen] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [burst, setBurst] = useState(false);

    useEffect(() => {
        if (phase === "zoom") {
            playAlarm(0.8);
            const t = setTimeout(() => onAdvance("press"), 1000);
            return () => clearTimeout(t);
        }
        if (phase === "press") {
            const t1 = setTimeout(() => setCoverOpen(true), 150);
            const t2 = setTimeout(() => { setPressed(true); setBurst(true); playPress(); }, 650);
            const t3 = setTimeout(() => onAdvance("meeting"), 1300);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [phase, onAdvance]);

    return (
        <div className="hack-button-seq">
            <div
                className="hack-btn-backdrop"
                style={{
                    backgroundImage: `url(${cafeteriaImg})`,
                    transform: phase === "zoom" ? "scale(2)" : "scale(3.2)",
                }}
            />
            <div className="hack-radial-overlay" />
            <div className={`hack-btn-asset ${pressed ? "hack-btn-asset--pressed" : ""}`}>
                <img
                    src={buttonImg}
                    alt="Emergency button"
                    className="hack-btn-img"
                    draggable={false}
                    style={{ filter: coverOpen ? "drop-shadow(0 0 40px rgba(255,40,40,0.8))" : "none" }}
                />
                {burst && <span className="hack-burst" />}
                {pressed && <span className="hack-alarm-flash" />}
            </div>
        </div>
    );
}

/* ── Meeting Overlay ────────────────────────────────────────────────────────── */
function MeetingOverlay({ onDone }) {
    useEffect(() => {
        playAlarm(2.4);
        const t = setTimeout(onDone, 2600);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div className="hack-meeting">
            <div className="hack-meeting-streaks">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="hack-streak"
                        style={{ top: `${i * 13}%`, animationDelay: `${i * 0.07}s`, animationDuration: `${0.5 + (i % 3) * 0.2}s` }}
                    />
                ))}
            </div>
            <div className="hack-alarm-overlay" />
            <img src={meetingImg} alt="Emergency meeting" className="hack-meeting-img" />
            <div className="hack-meeting-title-wrap">
                <h2 className="hack-meeting-title hack-glow-red">EMERGENCY<br />MEETING</h2>
            </div>
        </div>
    );
}

/* ── Briefing ───────────────────────────────────────────────────────────────── */
function Briefing({ onBegin }) {
    return (
        <section className="hack-section">
            <div className="hack-card hack-card--lg">
                <span className="hack-panel-tag">Round 02</span>
                <h2 className="hack-panel-title hack-glow-cyan">ANOMALY DETECTION</h2>
                <p className="hack-muted hack-mt-sm">
                    The spaceship AI has detected irregularities across its systems. Participants must
                    inspect technical evidence and identify hidden anomalies before the ship fails.
                </p>
                <div className="hack-skill-grid hack-mt">
                    {["Analytical Thinking", "Attention To Detail", "Technical Reasoning", "Pattern Recognition"].map((s) => (
                        <div key={s} className="hack-skill-tag">{s}</div>
                    ))}
                </div>
                <div className="hack-meta-row hack-mt-sm">
                    <span><span className="hack-accent">Difficulty:</span> Medium → Hard</span>
                    <span><span className="hack-accent">Advance:</span> By accuracy + speed</span>
                </div>
                <button onClick={onBegin} className="hack-btn hack-btn--primary hack-mt">
                    BEGIN INVESTIGATION
                </button>
            </div>
        </section>
    );
}

/* ── Shared HUD ─────────────────────────────────────────────────────────────── */
function HUD({ index, total, score, time, label }) {
    return (
        <div className="hack-hud">
            <div className="hack-hud-inner">
                <div className="hack-hud-left">
                    <div className="hack-hud-sublabel">{label}</div>
                    <div className="hack-hud-task">Task {index + 1} / {total}</div>
                </div>
                <div className="hack-hud-stats">
                    <Stat label="Time" value={`${time}s`} />
                    <Stat label="Score" value={String(score)} />
                </div>
            </div>
            <div className="hack-hud-bar">
                <div className="hack-hud-progress" style={{ width: `${(index / total) * 100}%` }} />
            </div>
        </div>
    );
}
function Stat({ label, value }) {
    return (
        <div className="hack-stat">
            <div className="hack-stat-label">{label}</div>
            <div className="hack-stat-value">{value}</div>
        </div>
    );
}

/* ── Anomaly Round ──────────────────────────────────────────────────────────── */
function AnomalyRound({ onDone }) {
    const [i, setI] = useState(0);
    const [selected, setSelected] = useState(null);
    const [reason, setReason] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0);
    const startRef = useRef(Date.now());

    useEffect(() => {
        const id = setInterval(() => setTime(Math.floor((Date.now() - startRef.current) / 1000)), 500);
        return () => clearInterval(id);
    }, []);

    const ch = anomalies[i];
    const submit = () => {
        if (!selected) return;
        const ok = selected === ch.correct;
        playBlip(ok);
        if (ok) setScore((s) => s + 100);
        setFeedback({ ok, text: ch.reason });
    };
    const next = () => {
        setFeedback(null); setSelected(null); setReason("");
        if (i + 1 >= anomalies.length) {
            sessionStorage.setItem("hau_anomaly", JSON.stringify({ score, time, total: anomalies.length }));
            onDone();
        } else setI(i + 1);
    };

    return (
        <div className="hack-round-wrap">
            <HUD index={i} total={anomalies.length} score={score} time={time} label="Anomaly Detection" />
            <div className="hack-round-inner">
                <div className="hack-card">
                    <span className="hack-panel-tag">{ch.category}</span>
                    <h3 className="hack-question">{ch.question}</h3>
                    <div className="hack-options hack-mt">
                        {ch.options.map((o) => {
                            const active = selected === o.id;
                            return (
                                <button
                                    key={o.id}
                                    disabled={!!feedback}
                                    onClick={() => setSelected(o.id)}
                                    className={`hack-option ${active ? "hack-option--active" : ""}`}
                                >
                                    <div className="hack-option-label">{o.label}</div>
                                    <pre className="hack-option-content">{o.content}</pre>
                                </button>
                            );
                        })}
                    </div>
                    <label className="hack-field-label hack-mt">Your reasoning</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={!!feedback}
                        placeholder="Explain why this is the anomaly…"
                        className="hack-textarea"
                    />
                    {!feedback ? (
                        <button onClick={submit} disabled={!selected} className="hack-btn hack-btn--primary hack-mt">
                            SUBMIT
                        </button>
                    ) : (
                        <div className={`hack-feedback hack-mt ${feedback.ok ? "hack-feedback--ok" : "hack-feedback--fail"}`}>
                            <div className="hack-feedback-title">{feedback.ok ? "ANOMALY CONFIRMED" : "FALSE LEAD"}</div>
                            <p className="hack-muted hack-mt-xs">{feedback.text}</p>
                            <button onClick={next} className="hack-btn hack-btn--accent hack-mt-sm">
                                {i + 1 >= anomalies.length ? "PROCEED →" : "NEXT TASK →"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Debug Round ────────────────────────────────────────────────────────────── */
function DebugRound({ onDone }) {
    const [i, setI] = useState(0);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0);
    const startRef = useRef(Date.now());

    useEffect(() => {
        const id = setInterval(() => setTime(Math.floor((Date.now() - startRef.current) / 1000)), 500);
        return () => clearInterval(id);
    }, []);

    const ch = debugs[i];
    const submit = () => {
        const n = parseInt(guess, 10);
        const ok = n === ch.buggyLine;
        playBlip(ok);
        if (ok) setScore((s) => s + 100);
        setFeedback({ ok, text: ch.explanation });
    };
    const next = () => {
        setFeedback(null); setGuess("");
        if (i + 1 >= debugs.length) {
            sessionStorage.setItem("hau_debug", JSON.stringify({ score, time, total: debugs.length }));
            onDone();
        } else setI(i + 1);
    };

    return (
        <div className="hack-round-wrap">
            <HUD index={i} total={debugs.length} score={score} time={time} label="Debugging Mission" />
            <div className="hack-round-inner">
                <div className="hack-card">
                    <span className="hack-panel-tag">{ch.topic} · {ch.language}</span>
                    <h3 className="hack-question">Identify the buggy line</h3>
                    <div className="hack-code-block hack-mt">
                        {ch.code.map((line, idx) => (
                            <div key={idx} className="hack-code-row">
                                <div className="hack-line-num">{idx + 1}</div>
                                <pre className="hack-line-code">{line}</pre>
                            </div>
                        ))}
                    </div>
                    <label className="hack-field-label hack-mt">Buggy line #</label>
                    <input
                        type="number"
                        min={1}
                        max={ch.code.length}
                        value={guess}
                        disabled={!!feedback}
                        onChange={(e) => setGuess(e.target.value)}
                        className="hack-number-input"
                    />
                    {!feedback ? (
                        <div className="hack-mt">
                            <button onClick={submit} disabled={!guess} className="hack-btn hack-btn--primary">
                                SUBMIT
                            </button>
                        </div>
                    ) : (
                        <div className={`hack-feedback hack-mt ${feedback.ok ? "hack-feedback--ok" : "hack-feedback--fail"}`}>
                            <div className="hack-feedback-title">
                                {feedback.ok ? "BUG SQUASHED" : `BUG WAS LINE ${ch.buggyLine}`}
                            </div>
                            <p className="hack-muted hack-mt-xs">{feedback.text}</p>
                            <button onClick={next} className="hack-btn hack-btn--accent hack-mt-sm">
                                {i + 1 >= debugs.length ? "VIEW RESULTS →" : "NEXT MISSION →"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Results ────────────────────────────────────────────────────────────────── */
function Results({ onReturn, onComplete }) {
    const a = JSON.parse(sessionStorage.getItem("hau_anomaly") || '{"score":0,"time":0,"total":5}');
    const d = JSON.parse(sessionStorage.getItem("hau_debug") || '{"score":0,"time":0,"total":5}');
    const total = a.score + d.score;
    const totalQs = a.total + d.total;
    const correct = (a.score + d.score) / 100;
    const accuracy = Math.round((correct / totalQs) * 100);
    const time = a.time + d.time;
    const rank =
        accuracy >= 90 ? "Elite Investigator" :
            accuracy >= 70 ? "Security Chief" :
                accuracy >= 50 ? "Detective" : "Crewmate";

    return (
        <section className="hack-section">
            <div className="hack-card hack-card--center">
                <span className="hack-panel-tag">Mission Debrief</span>
                <h2 className="hack-rank-title hack-glow-red">{rank}</h2>
                <div className="hack-metric-grid hack-mt">
                    <Metric label="Accuracy" value={`${accuracy}%`} />
                    <Metric label="Total Score" value={String(total)} />
                    <Metric label="Time Taken" value={`${time}s`} />
                    <Metric label="Correct" value={`${correct} / ${totalQs}`} />
                </div>
                <div className="hack-results-btns hack-mt">
                    <button onClick={onReturn} className="hack-btn hack-btn--accent">
                        RETURN TO CAFETERIA
                    </button>
                    {onComplete && (
                        <button onClick={onComplete} className="hack-btn hack-btn--primary">
                            CONTINUE →
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
function Metric({ label, value }) {
    return (
        <div className="hack-metric-card">
            <div className="hack-metric-label">{label}</div>
            <div className="hack-metric-value">{value}</div>
        </div>
    );
}