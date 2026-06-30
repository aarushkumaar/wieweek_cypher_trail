import { useState } from 'react';
import './RoundGuidelines.css';
import crewRed    from '../round1/assets/crewmate_red.png';
import crewBlue   from '../round1/assets/crewmate_blue.png';
import crewGreen  from '../round1/assets/crewmate_green.png';
import crewYellow from '../round1/assets/crewmate_yellow.png';

function RgStarfield() {
  const [stars] = useState(() =>
    Array.from({ length: 130 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top:  Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      dur:   5 + Math.random() * 5,
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

export default function Finish({ onRestart }) {
  return (
    <div className="rg-finish-root">
      <RgStarfield />
      <div className="rg-finish-card">
        <div className="rg-finish-trophy">🏆</div>
        <h1 className="rg-finish-title">MISSION COMPLETE</h1>
        <p className="rg-finish-sub">
          All tasks cleared. The impostor has been ejected.<br />
          The crew of the <em>WIE Crewmate Protocol</em> survives.
        </p>
        <div className="rg-finish-crew-row">
          <img src={crewRed}    alt="" className="rg-finish-crew" style={{ animationName:'rg-float-a', animationDuration:'4s',  animationIterationCount:'infinite' }} />
          <img src={crewBlue}   alt="" className="rg-finish-crew" style={{ animationName:'rg-float-b', animationDuration:'5s',  animationIterationCount:'infinite' }} />
          <img src={crewGreen}  alt="" className="rg-finish-crew" style={{ animationName:'rg-float-c', animationDuration:'4.5s',animationIterationCount:'infinite' }} />
          <img src={crewYellow} alt="" className="rg-finish-crew" style={{ animationName:'rg-float-d', animationDuration:'5.5s',animationIterationCount:'infinite' }} />
        </div>
        {onRestart && (
          <button className="rg-finish-btn" onClick={onRestart}>
            PLAY AGAIN
          </button>
        )}
      </div>
    </div>
  );
}
