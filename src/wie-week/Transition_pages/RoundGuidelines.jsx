import { useState } from 'react';
import './RoundGuidelines.css';
import crewRed from '../round1/assets/crewmate_red.png';
import crewBlue from '../round1/assets/crewmate_blue.png';
import crewGreen from '../round1/assets/crewmate_green.png';
import crewYellow from '../round1/assets/crewmate_yellow.png';

const CREW_IMGS = [crewRed, crewBlue, crewGreen, crewYellow];
const FLOAT_ANIMS = ['rg-float-a', 'rg-float-b', 'rg-float-c', 'rg-float-d', 'rg-float-e', 'rg-float-f'];

function RgStarfield() {
  const [stars] = useState(() =>
    Array.from({ length: 130 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      dur: 5 + Math.random() * 5,
    }))
  );
  return (
    <div className="rg-stars">
      {stars.map(s => (
        <span key={s.id} className="rg-star" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.dur}s`,
        }} />
      ))}
    </div>
  );
}

function RgCrewmates() {
  const crew = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    src: CREW_IMGS[i % 4],
    size: 40 + (i * 11) % 40,
    x: (i * 14 + 3) % 88,
    y: (i * 19 + 5) % 85,
    anim: FLOAT_ANIMS[i % FLOAT_ANIMS.length],
    dur: 18 + (i * 6) % 16,
    delay: -(i * 3.8),
    flip: i % 2 === 0,
  }));
  return (
    <div className="rg-crewmates">
      {crew.map(c => (
        <img key={c.id} src={c.src} alt="" className="rg-crew" style={{
          left: `${c.x}%`, top: `${c.y}%`,
          width: c.size,
          animationName: c.anim,
          animationDuration: `${c.dur}s`,
          animationDelay: `${c.delay}s`,
          transform: c.flip ? 'scaleX(-1)' : undefined,
        }} />
      ))}
    </div>
  );
}

export default function RoundGuidelines({ roundNum, title, accent = '#38fedc', icon = '◈', label = 'ROUND', description, rules, onStart }) {
  return (
    <div className="rg-root" style={{ '--rg-accent': accent }}>
      <RgStarfield />
      <RgCrewmates />
      <div className="rg-center">
        <div className="rg-card">
          <div className="rg-round-badge">
            <span className="rg-round-icon">{icon}</span>
            {label} {String(roundNum).padStart(2, '0')}
          </div>
          <h1 className="rg-title">{title}</h1>
          <p className="rg-desc">{description}</p>
          {rules && rules.length > 0 && (
            <ul className="rg-rules">
              {rules.map((r, i) => (
                <li key={i} className="rg-rule">
                  <span className="rg-rule-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rg-rule-text">{r}</span>
                </li>
              ))}
            </ul>
          )}
          <button className="rg-btn" onClick={onStart}>
            BEGIN {label} {String(roundNum).padStart(2, '0')}
          </button>
        </div>
      </div>
    </div>
  );
}
