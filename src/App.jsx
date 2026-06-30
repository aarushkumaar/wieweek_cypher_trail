/**
 * src/App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root component — WIE2026 The Cypher Trail.
 *
 * Routes:
 *   /login          → Login page (Google OAuth — public)
 *   /auth/callback  → OAuth return handler (public)
 *   /game           → Full game flow (requires auth)
 *   /admin          → Admin dashboard (password-gated)
 *   /               → Redirects to /game (requires auth) or /login
 *
 * Mock mode and the DEV SKIP button have been removed entirely.
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './wie-week/Landing/LandingPage';
import HackAmongUs from './wie-week/Transition_pages/HackAmongUs';

import Round1T from './wie-week/Transition_pages/round1t';
import Round1 from './wie-week/round1/round1';

import Round2T from './wie-week/Transition_pages/round2t';
import Round2 from './wie-week/round2/round2';

import Round3T from './wie-week/Transition_pages/round3t';
import Round3 from './wie-week/round3/round3';

import Round4T from './wie-week/Transition_pages/round4t';
import Round4 from './wie-week/round4/round4';

import Round5T from './wie-week/Transition_pages/round5t';
import Round5 from './wie-week/round5/round5';

import Finish from './wie-week/Transition_pages/finish';

// ── Supabase / admin imports ──────────────────────────────────────────────────
import { PlayerProvider } from './lib/PlayerContext.jsx';
import AdminPanel    from './pages/AdminPanel.jsx';
import AuthCallback  from './pages/AuthCallback.jsx';
import Login         from './pages/Login.jsx';
import GameFlow      from './pages/GameFlow.jsx';

import './index.css';

/*
  Full cinematic game flow:
  landing
    → hack_transition [roundNum=1]  (cafeteria — "PRESS TO BEGIN ROUND 01")
    → round1t  (guidelines)
    → round1   (gameplay)
    → hack_transition [roundNum=2]
    → round2t
    → round2
    → hack_transition [roundNum=3]
    → round3t
    → round3
    → hack_transition [roundNum=4]
    → round4t
    → round4
    → hack_transition [roundNum=5]
    → round5t
    → round5
    → finish
*/

const STAGES = [
  'landing',
  'hack1', 'round1t', 'round1',
  'hack2', 'round2t', 'round2',
  'hack3', 'round3t', 'round3',
  'hack4', 'round4t', 'round4',
  'hack5', 'round5t', 'round5',
  'finish',
];

function nextStage(s) {
  const i = STAGES.indexOf(s);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : 'finish';
}

// ── GameApp: landing page shell (rounds now handled by GameFlow at /game) ──────
function GameApp() {
  const [stage, setStage] = useState('landing');
  const advance = () => setStage(s => nextStage(s));

  return (
    <>
      {stage === 'landing' && <LandingPage onStart={advance} />}

      {/* ── Cinematic transition before each round ── */}
      {stage === 'hack1' && <HackAmongUs roundNum={1} onComplete={advance} />}
      {stage === 'hack2' && <HackAmongUs roundNum={2} onComplete={advance} />}
      {stage === 'hack3' && <HackAmongUs roundNum={3} onComplete={advance} />}
      {stage === 'hack4' && <HackAmongUs roundNum={4} onComplete={advance} />}
      {stage === 'hack5' && <HackAmongUs roundNum={5} onComplete={advance} />}

      {/* ── Guidelines pages ── */}
      {stage === 'round1t' && <Round1T onStart={advance} />}
      {stage === 'round2t' && <Round2T onStart={advance} />}
      {stage === 'round3t' && <Round3T onStart={advance} />}
      {stage === 'round4t' && <Round4T onStart={advance} />}
      {stage === 'round5t' && <Round5T onStart={advance} />}

      {/* ── Gameplay rounds ── */}
      {stage === 'round1' && <Round1 onComplete={advance} />}
      {stage === 'round2' && <Round2 onComplete={advance} />}
      {stage === 'round3' && <Round3 onComplete={advance} />}
      {stage === 'round4' && <Round4 onComplete={advance} />}
      {stage === 'round5' && <Round5 onComplete={advance} />}

      {/* ── Finish ── */}
      {stage === 'finish' && <Finish onRestart={() => setStage('landing')} />}


    </>
  );
}

// ── Root: wrap everything in PlayerProvider + router ──────────────────────────
export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Login page (Google OAuth entry — public) ── */}
          <Route path="/login" element={<Login />} />

          {/* ── OAuth callback (public — must be before catch-all) ── */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ── Authenticated game flow ── */}
          <Route path="/game" element={<GameFlow />} />

          {/* ── Admin dashboard (password-gated internally) ── */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* ── Main landing / catch-all ── */}
          <Route path="*" element={<GameApp />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
