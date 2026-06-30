import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

import heroBg from '../../assets/images/hero-bg.png';
import wieBadge from '../../assets/images/wie-badge.png';
import wieLogo from '../../assets/images/wie-logo.png';
import dotsImg from '../../assets/images/dots.png';
import mpBg from '../../assets/images/MP-bg.png';
import taskCrewBg from '../../assets/images/task-crew-bg.png';
import redCrew from '../../assets/images/red.png';
import blueCrew from '../../assets/images/blue.png';
import greenCrew from '../../assets/images/green.png';
import pinkCrew from '../../assets/images/pink.png';
import orangeCrew from '../../assets/images/orange.png';
import sp1 from '../../assets/images/SP1.jpeg';
import sp2 from '../../assets/images/SP2.png';
import sp3 from '../../assets/images/SP3.jpg';
import sp4 from '../../assets/images/digimation_flight.jpeg';

/* ── Hero star layer (absolute, sits above overlay, below content) ── */
function HeroStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const items = [];
    for (let i = 0; i < 90; i++) {
      const size = Math.random() * 3 + 0.8;
      items.push({
        type: 'star', id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`, height: `${size}px`,
          '--dur': `${(Math.random() * 3 + 1.5).toFixed(1)}s`,
          '--delay': `${(Math.random() * 4).toFixed(1)}s`,
          opacity: Math.random() * 0.5 + 0.5,
        },
      });
    }
    for (let i = 0; i < 6; i++) {
      items.push({
        type: 'shoot', id: `hs${i}`,
        style: {
          left: `${Math.random() * 65}%`,
          top: `${Math.random() * 50}%`,
          '--shoot-dur': `${(Math.random() * 2 + 1.8).toFixed(1)}s`,
          '--shoot-delay': `${(i * 3.5 + Math.random() * 2).toFixed(1)}s`,
          transform: `rotate(${14 + Math.random() * 10}deg)`,
        },
      });
    }
    requestAnimationFrame(() => setStars(items));
  }, []);
  return (
    <div className="hero-stars" aria-hidden="true">
      {stars.map(s =>
        s.type === 'star'
          ? <div key={s.id} className="star" style={s.style} />
          : <div key={s.id} className="shooting-star" style={s.style} />
      )}
    </div>
  );
}

/* ── Global star field (fixed, visible on every section while scrolling) ── */
function GlobalStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const items = [];
    for (let i = 0; i < 180; i++) {
      const size = Math.random() * 3 + 0.7;
      items.push({
        type: 'star', id: `g${i}`,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 600}vh`,
          width: `${size}px`, height: `${size}px`,
          '--dur': `${(Math.random() * 3 + 1.5).toFixed(1)}s`,
          '--delay': `${(Math.random() * 5).toFixed(1)}s`,
          opacity: Math.random() * 0.45 + 0.4,
        },
      });
    }
    for (let i = 0; i < 8; i++) {
      items.push({
        type: 'shoot', id: `gs${i}`,
        style: {
          left: `${Math.random() * 70}%`,
          top: `${Math.random() * 400}vh`,
          '--shoot-dur': `${(Math.random() * 2 + 2).toFixed(1)}s`,
          '--shoot-delay': `${(i * 4 + Math.random() * 3).toFixed(1)}s`,
          transform: `rotate(${12 + Math.random() * 12}deg)`,
        },
      });
    }
    requestAnimationFrame(() => setStars(items));
  }, []);
  return (
    <div className="global-stars" aria-hidden="true">
      {stars.map(s =>
        s.type === 'star'
          ? <div key={s.id} className="star" style={s.style} />
          : <div key={s.id} className="shooting-star" style={s.style} />
      )}
    </div>
  );
}

/* ── Task data ── */
const TASKS = [
  { id: 1, label: 'TASK 1', name: 'Mission Clearance', img: redCrew, side: 'left', delay: '0s' },
  { id: 2, label: 'TASK 2', name: 'Anomaly Detection', img: blueCrew, side: 'right', delay: '0.5s' },
  { id: 3, label: 'TASK 3', name: 'Beneath the Interface', img: greenCrew, side: 'left', delay: '1s' },
  { id: 4, label: 'TASK 4', name: 'Decode the Echo', img: pinkCrew, side: 'right', delay: '1.5s' },
  { id: 5, label: 'TASK 5', name: 'The Impostor Files', img: orangeCrew, side: 'left', delay: '2s' },
];

const SPONSORS = [
  { id: 1, name: 'AEROSPACE LAB', src: sp1, alt: 'Sponsor 1' },
  { id: 2, name: 'NEBULA TECH', src: sp2, alt: 'Sponsor 2' },
  { id: 3, name: 'STARGRID', src: sp3, alt: 'Sponsor 3' },
  { id: 4, name: 'DIGIMATION FLIGHT', src: sp4, alt: 'Digimation Flight' },
];

const INSTRUCTIONS = [
  { num: '01', text: 'The trail begins in a fractured station where every round reveals a new clue, a new risk, and a new piece of the story.' },
  { num: '02', text: 'Explore the map, solve each puzzle, and piece together the hidden path before the clock runs out.' },
  { num: '03', text: 'Every round carries a fresh challenge, from decoding signals to uncovering secrets buried in the ship’s systems.' },
  { num: '04', text: 'Your time and score are being recorded, so stay sharp, move quickly, and aim for the fastest clean run.' },
  { num: '05', text: 'Follow the narrative, trust your instincts, and survive the mission long enough to uncover the truth at the end.' },
];

/* helpers removed: scrollTo and useRevealOnScroll were unused and caused linter warnings */

/* ── Main Component ── */
export default function LandingPage({ onStart }) {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const goToLogin = () => navigate('/login');

  const howToPlaySteps = [
    'Begin the mission and follow each round as the story unfolds.',
    'Inspect clues, solve puzzles, and piece together the hidden path.',
    'Use your instincts and move quickly to beat the clock and finish the trail.',
  ];

  return (
    <div className="lp-root">
      <GlobalStars />

      {/* ══ HERO ══ */}
      <section className="hero" id="home">
        <img src={heroBg} alt="" className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <HeroStars />
        <div className="hero-content">
          <nav className="navbar" aria-label="Site header">
            <img src={wieBadge} alt="WIE IEEE Badge" className="nav-badge" />
            <img src={wieLogo} alt="Women in Engineering" className="nav-logo" />
          </nav>
          <h1 className="hero-title">CYPHER TRAIL</h1>
          <div className="hero-spacer" />
          <div className="hero-bottom">
            <div className="hero-btns">
              <button className="btn-pixel" id="btn-start-playing" onClick={goToLogin}>Start Playing</button>
              <button className="btn-pixel" id="btn-how-to-play" onClick={() => setShowHowToPlay(true)}>How to Play</button>
            </div>
            <img src={dotsImg} alt="Slide indicators" className="hero-dots-img" />
          </div>
        </div>
      </section>

      {/* ══ MISSION PARTNERS ══ */}
      <section className="lp-section partners-section" id="mission-partners"
        style={{ backgroundImage: `url(${mpBg})` }}>
        <div className="lp-inner">
          <h2 className="section-title">Mission Partners <span aria-hidden="true">🧑‍🚀</span></h2>
          <div className="partners-grid">
            {SPONSORS.map(sponsor => (
              <div key={sponsor.id} className="partner-card">
                <img src={sponsor.src} alt={sponsor.alt} className="partner-logo" />
                <span className="partner-name">{sponsor.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TASKS ══ */}
      <section className="lp-section tasks-section" id="tasks"
        style={{ backgroundImage: `url(${taskCrewBg})` }}>
        <div className="lp-inner">
          <h2 className="section-title">Tasks</h2>

          {/* Tasks zigzag flow */}
          <div className="tasks-flow">

            {/* Absolute SVG connector lines
                Layout: each task-node = 100px tall, 60px margin-bottom, 20px top padding
                Row centers (y): 70, 230, 390, 550, 710   total height: 780
                Left crewmate x ≈ 360 (right edge of 50% col)
                Right crewmate x ≈ 440 (left edge of right 50% col)
            */}
            <svg className="tasks-lines-svg" viewBox="0 0 800 780"
              preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* 1(left)→2(right) */}
              <line x1="360" y1="70" x2="440" y2="230" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="10,5" filter="url(#glow)" />
              {/* 2(right)→3(left) */}
              <line x1="440" y1="230" x2="360" y2="390" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="10,5" filter="url(#glow)" />
              {/* 3(left)→4(right) */}
              <line x1="360" y1="390" x2="440" y2="550" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="10,5" filter="url(#glow)" />
              {/* 4(right)→5(left) */}
              <line x1="440" y1="550" x2="360" y2="710" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="10,5" filter="url(#glow)" />
            </svg>

            {TASKS.map(task => (
              <div key={task.id} className={`task-node task-${task.side}`}>
                {task.side === 'left' ? (
                  <>
                    <div className="task-text left-text">
                      <span className="task-tag">{task.label}:</span>
                      <span className="task-desc" style={{ whiteSpace: 'pre-line' }}>{task.name}</span>
                    </div>
                    <img
                      src={task.img}
                      className="crewmate-img"
                      style={{ '--float-delay': task.delay }}
                      alt={task.label}
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={task.img}
                      className="crewmate-img"
                      style={{ '--float-delay': task.delay }}
                      alt={task.label}
                    />
                    <div className="task-text right-text">
                      <span className="task-tag">{task.label}:</span>
                      <span className="task-desc">{task.name}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CREW INSTRUCTIONS ══ */}
      <section className="lp-section instructions-section" id="crew-instructions"
        style={{ backgroundImage: `url(${mpBg})` }}>
        <div className="lp-inner">
          <h2 className="section-title">Mission Brief</h2>
          <ul className="instructions-list">
            {INSTRUCTIONS.map(inst => (
              <li key={inst.num} className="instr-item">
                <span className="instr-num">{inst.num}</span>
                <p className="instr-text">{inst.text}</p>
              </li>
            ))}
          </ul>
          {/* Tasks Awaits sits at the bottom of this section */}
          <div className="tasks-cta">
            <button className="btn-cta" id="btn-tasks-awaits" onClick={goToLogin}>Tasks Awaits</button>
          </div>
        </div>
      </section>

      {showHowToPlay && (
        <div className="howto-overlay" role="dialog" aria-modal="true" aria-labelledby="howto-title" onClick={() => setShowHowToPlay(false)}>
          <div className="howto-modal" onClick={e => e.stopPropagation()}>
            <button className="howto-close" onClick={() => setShowHowToPlay(false)} aria-label="Close how to play guide">
              ×
            </button>
            <div className="howto-stars" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <span
                  key={index}
                  className="howto-star"
                  style={{
                    left: `${8 + (index % 5) * 18}%`,
                    top: `${12 + (index % 4) * 18}%`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <h3 id="howto-title">How to Play</h3>
            <p className="howto-copy">
              Embark on a mission-driven trail filled with clues, hidden paths, and story-rich rounds.
            </p>
            <ul className="howto-list">
              {howToPlaySteps.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ══ FOOTER ══ */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div>
            <p className="footer-powered">Brought you by:-</p>
            <div className="footer-brand-row">
              <img src={wieBadge} alt="WIE" className="footer-badge" />
              <span className="footer-ieee-text">IEEE GTBIT</span>
            </div>
          </div>
          <div>
            <p className="footer-col-title">Quick Links</p>
            <ul className="footer-links">
              <li><a href="https://www.linkedin.com/company/ieee-student-branch-at-gtbit/" target="_blank" rel="noreferrer">About Us</a></li>
              <li><a href="#mission-partners">Sponsors</a></li>
              <li><a href="#tasks">Get Started</a></li>
            </ul>
          </div>
          <div>
            <p className="footer-col-title">Socials</p>
            <div className="footer-socials">
              <a href="https://www.linkedin.com/company/ieee-student-branch-at-gtbit/" target="_blank" rel="noreferrer" className="social-btn" aria-label="LinkedIn">in</a>
              <a href="https://www.instagram.com/ieeegtbit?igsh=MTQ5ZXR4bjh0bzJqaA==" target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">ig</a>
              <a href="https://share.google/hB9X7nEWwlFiDEvKu" target="_blank" rel="noreferrer" className="social-btn" aria-label="IEEE Societies">soc</a>
            </div>
          </div>
          <p className="footer-bottom">
            &copy; {new Date().getFullYear()} WIE WEEK — Crewmate Protocol. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
