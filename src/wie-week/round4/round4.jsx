import { useState, useEffect, useRef, useCallback } from 'react';
import './round4.css';
import mapImage from './assets/map.png';
import navMapImage from './assets/nav_map.png';
import puzzleBg from './assets/board-bg.png';
import qrImage from './assets/qr.png';
import pieceImg0 from './assets/piece-1.png';
import pieceImg1 from './assets/piece-2.png';
import pieceImg2 from './assets/piece-3.png';
import pieceImg3 from './assets/piece-4.png';
import pieceImg4 from './assets/piece-5.png';
import pieceImg5 from './assets/piece-6.png';
import pieceImg6 from './assets/piece-7.png';
import pieceImg7 from './assets/piece-8.png';

const PIECE_IMGS = [pieceImg0, pieceImg1, pieceImg2, pieceImg3, pieceImg4, pieceImg5, pieceImg6, pieceImg7];
const CELL = 68;
const BOARD_COLS = 6;
const BOARD_ROWS = 6;

const PIECE_DEFS = [
  { id: 0, col: 0, row: 0, w: 3, h: 2, color: '#1e5f9f' },
  { id: 1, col: 3, row: 0, w: 3, h: 2, color: '#1e5f9f' },
  { id: 2, col: 0, row: 2, w: 2, h: 2, color: '#1e5f9f' },
  { id: 3, col: 2, row: 2, w: 2, h: 2, color: '#1e5f9f' },
  { id: 4, col: 4, row: 2, w: 2, h: 2, color: '#1e5f9f' },
  { id: 5, col: 0, row: 4, w: 2, h: 2, color: '#1e5f9f' },
  { id: 6, col: 2, row: 4, w: 2, h: 2, color: '#1e5f9f' },
  { id: 7, col: 4, row: 4, w: 2, h: 2, color: '#1e5f9f' },
];

const downMods = import.meta.glob('./assets/players/down_*.png', { eager: true, import: 'default' });
const upMods = import.meta.glob('./assets/players/up_*.png', { eager: true, import: 'default' });
const sideMods = import.meta.glob('./assets/players/passing_*.png', { eager: true, import: 'default' });

function sortedFrames(mods) {
  return Object.keys(mods).sort().map(k => mods[k]);
}

const WALK_FRAMES = {
  down: sortedFrames(downMods),
  up: sortedFrames(upMods),
  side: sortedFrames(sideMods),
};

function pickDirection(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return { dir: 'side', flip: dx < 0 };
  return { dir: dy < 0 ? 'up' : 'down', flip: false };
}

// No collision walls — player moves freely
function clampToWalkable(_fx, _fy, tx, ty) { return { x: tx, y: ty }; }

// ── Room definitions for minimap ─────────────────────────────────────────────
const ROOMS = [
  { id: 'cafeteria', label: 'CAFETERIA', cx: 50, cy: 13, mx: 1, my: 1, mw: 3, mh: 2 },
  { id: 'weapons', label: 'WEAPONS', cx: 74, cy: 12, mx: 7, my: 1, mw: 2, mh: 2 },
  { id: 'navigation', label: 'NAV', cx: 74, cy: 25, mx: 7, my: 2, mw: 2, mh: 2 },
  { id: 'shields', label: 'SHIELDS', cx: 75, cy: 42, mx: 7, my: 3, mw: 2, mh: 2 },
  { id: 'security', label: 'SECURITY', cx: 30, cy: 21, mx: 0, my: 1, mw: 2, mh: 2 },
  { id: 'medbay', label: 'MEDBAY', cx: 30, cy: 37, mx: 0, my: 2, mw: 2, mh: 2 },
  { id: 'reactor', label: 'REACTOR', cx: 11, cy: 45, mx: 0, my: 3, mw: 2, mh: 2 },
  { id: 'electrical', label: 'ELECTRICAL', cx: 34, cy: 58, mx: 1, my: 4, mw: 2, mh: 2 },
  { id: 'storage', label: 'STORAGE', cx: 46, cy: 59, mx: 2, my: 4, mw: 2, mh: 2 },
  { id: 'admin', label: 'ADMIN', cx: 60, cy: 52, mx: 4, my: 3, mw: 2, mh: 2 },
  { id: 'communications', label: 'COMMS', cx: 47, cy: 69, mx: 2, my: 5, mw: 3, mh: 2 },
];

// ── Fragment spawn locations ──────────────────────────────────────────────────
const FRAGMENT_DEFS = [
  { id: 0, roomId: 'cafeteria', x: 50, y: 10 },
  { id: 1, roomId: 'weapons', x: 74, y: 12 },
  { id: 2, roomId: 'navigation', x: 74, y: 25 },
  { id: 3, roomId: 'shields', x: 75, y: 42 },
  { id: 4, roomId: 'reactor', x: 11, y: 45 },
  { id: 5, roomId: 'electrical', x: 34, y: 58 },
  { id: 6, roomId: 'medbay', x: 30, y: 37 },
  { id: 7, roomId: 'communications', x: 47, y: 69 },
];

const MAP_W = 4800;
const MAP_H = 3600;

// ── Main component ────────────────────────────────────────────────────────────
export default function Round4({ onComplete }) {
  const [phase, setPhase] = useState('explore');
  const [collected, setCollected] = useState(new Set());
  const [audioCode, setAudioCode] = useState('');
  const [codeStatus, setCodeStatus] = useState('idle');
  const [minimapOpen, setMinimapOpen] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 13 });
  const [moving, setMoving] = useState(false);
  const [walkDir, setWalkDir] = useState('down');
  const [walkFlip, setWalkFlip] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [placedPieces, setPlacedPieces] = useState(new Set());
  const [piecePos, setPiecePos] = useState({});
  const [dragId, setDragId] = useState(null);

  const targetRef = useRef({ x: 50, y: 13 });
  const posRef = useRef({ x: 50, y: 13 });
  const rafRef = useRef(null);
  const mapRef = useRef(null);
  const mapInnerRef = useRef(null);
  const collRef = useRef(new Set());
  const frameTimerRef = useRef(null);
  const boardRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragIdRef = useRef(null);

  useEffect(() => { collRef.current = collected; }, [collected]);

  // ── Fragment collection check ─────────────────────────────────────────────
  const checkFragments = useCallback((next) => {
    FRAGMENT_DEFS.forEach(f => {
      if (collRef.current.has(f.id)) return;
      const fdx = f.x - next.x;
      const fdy = f.y - next.y;
      if (Math.sqrt(fdx * fdx + fdy * fdy) < 3.5) {
        setCollected(prev => { const n = new Set(prev); n.add(f.id); return n; });
      }
    });
  }, []);

  // ── Animation loop (click-to-move) ───────────────────────────────────────
  const tick = useCallback(function tick() {
    const cur = posRef.current;
    const tgt = targetRef.current;
    const dx = tgt.x - cur.x;
    const dy = tgt.y - cur.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.15) {
      posRef.current = { ...tgt };
      setPos({ ...tgt });
      setMoving(false);
      rafRef.current = null;
      return;
    }

    const speed = 0.18;
    const next = { x: cur.x + dx * speed, y: cur.y + dy * speed };
    posRef.current = next;
    setPos({ ...next });
    const { dir, flip } = pickDirection(dx, dy);
    setWalkDir(dir);
    setWalkFlip(flip);
    checkFragments(next);
    rafRef.current = requestAnimationFrame(tick);
  }, [checkFragments]);

  const startMove = useCallback((tx, ty) => {
    const clamped = clampToWalkable(posRef.current.x, posRef.current.y, tx, ty);
    targetRef.current = clamped;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFrameIdx(0);
    setMoving(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    if (!moving) {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
      return;
    }

    frameTimerRef.current = setInterval(() => setFrameIdx(f => (f + 1) % 6), 90);
    return () => {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    };
  }, [moving]);

  // Auto-advance to puzzle
  useEffect(() => {
    if (collected.size === 8 && phase === 'explore') {
      setTimeout(() => setPhase('puzzle'), 800);
    }
  }, [collected.size, phase]);

  // ── Arrow key / WASD movement ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'explore') return;
    const STEP = 0.6;

    const handleKey = (e) => {
      const cur = posRef.current;
      let tx = cur.x, ty = cur.y;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': ty -= STEP; setWalkDir('up'); setWalkFlip(false); break;
        case 'ArrowDown': case 's': case 'S': ty += STEP; setWalkDir('down'); setWalkFlip(false); break;
        case 'ArrowLeft': case 'a': case 'A': tx -= STEP; setWalkDir('side'); setWalkFlip(true); break;
        case 'ArrowRight': case 'd': case 'D': tx += STEP; setWalkDir('side'); setWalkFlip(false); break;
        default: return;
      }
      e.preventDefault();

      // Cancel any in-progress click-to-move
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

      const next = { x: tx, y: ty };
      posRef.current = next;
      targetRef.current = next;
      setPos({ ...next });
      if (!e.repeat) setFrameIdx(0);
      setMoving(true);
      checkFragments(next);

      clearTimeout(window._r4KeyTimeout);
      window._r4KeyTimeout = setTimeout(() => setMoving(false), 150);
    };

    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); clearTimeout(window._r4KeyTimeout); };
  }, [phase, checkFragments]);

  // ── Camera follow ─────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = mapRef.current;
    const inner = mapInnerRef.current;
    if (!wrap || !inner) return;
    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;
    const px = (pos.x / 100) * MAP_W;
    const py = (pos.y / 100) * MAP_H;
    const camX = Math.min(0, Math.max(wrapW - MAP_W, wrapW / 2 - px));
    const camY = Math.min(0, Math.max(wrapH - MAP_H, wrapH / 2 - py));
    inner.style.transform = `translate(${camX}px, ${camY}px)`;
  }, [pos]);

  // ── Click to move ──────────────────────────────────────────────────────
  const handleMapClick = useCallback((e) => {
    if (phase !== 'explore') return;
    const inner = mapInnerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / MAP_W) * 100;
    const y = ((e.clientY - rect.top)  / MAP_H) * 100;
    startMove(x, y);
  }, [phase, startMove]);

  // ── Teleport (minimap popup) ──────────────────────────────────────────────
  const teleport = ({ cx, cy }) => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    posRef.current = { x: cx, y: cy };
    targetRef.current = { x: cx, y: cy };
    setPos({ x: cx, y: cy });
    setFrameIdx(0);
    setMoving(false);
    setMinimapOpen(false);
  };

  // ── Puzzle ────────────────────────────────────────────────────────────────
  const BOARD_W = CELL * BOARD_COLS;
  const BOARD_H = CELL * BOARD_ROWS;

  const initPiecePositions = useCallback(() => {
    const positions = {};
    PIECE_DEFS.forEach((p, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      positions[p.id] = {
        x: side < 0 ? -(p.w * CELL) - 20 : BOARD_W + 20,
        y: i * 55,
      };
    });
    setPiecePos(positions);
  }, [BOARD_W]);

  useEffect(() => { initPiecePositions(); }, [initPiecePositions]);

  const resetPuzzle = () => {
    setPlacedPieces(new Set());
    setDragId(null);
    initPiecePositions();
  };

  const startDrag = useCallback((e, id) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const cur = piecePos[id] || { x: 0, y: 0 };
    dragOffset.current = {
      x: clientX - rect.left - cur.x,
      y: clientY - rect.top - cur.y,
    };
    dragIdRef.current = id;
    setDragId(id);

    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const nx = cx - rect.left - dragOffset.current.x;
      const ny = cy - rect.top - dragOffset.current.y;
      setPiecePos(prev => ({ ...prev, [id]: { x: nx, y: ny } }));
      const def = PIECE_DEFS.find(d => d.id === id);
      const pcx = nx + (def.w * CELL) / 2;
      const pcy = ny + (def.h * CELL) / 2;
      const zcx = def.col * CELL + (def.w * CELL) / 2;
      const zcy = def.row * CELL + (def.h * CELL) / 2;
      const dist = Math.sqrt((pcx - zcx) ** 2 + (pcy - zcy) ** 2);
      void dist;
    };

    const onUp = () => {
      setPiecePos(prev => {
        const def = PIECE_DEFS.find(d => d.id === id);
        const pos = prev[id] || { x: 0, y: 0 };
        const pcx = pos.x + (def.w * CELL) / 2;
        const pcy = pos.y + (def.h * CELL) / 2;
        const zcx = def.col * CELL + (def.w * CELL) / 2;
        const zcy = def.row * CELL + (def.h * CELL) / 2;
        const dist = Math.sqrt((pcx - zcx) ** 2 + (pcy - zcy) ** 2);
        if (dist < CELL * 1.1) {
          setPlacedPieces(p => {
            const n = new Set(p);
            n.add(id);
            return n;
          });
        }
        return prev;
      });
      setDragId(null);
      dragIdRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [piecePos]);

  // ── Audio ─────────────────────────────────────────────────────────────────
  const submitCode = () => {
    if (audioCode.trim().toUpperCase() === 'NEBULA') {
      setCodeStatus('ok');
      setTimeout(() => setPhase('complete'), 1200);
    } else {
      setCodeStatus('err');
      setTimeout(() => setCodeStatus('idle'), 2000);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="r4-root">

      {/* ── EXPLORE ── */}
      {phase === 'explore' && (
        <div className="r4-explore">

          {/* HUD */}
          <div className="r4-hud">
            <span className="r4-hud-title">ROUND 04 — NAVIGATION SYSTEMS</span>
            <div className="r4-hud-frags">
              {FRAGMENT_DEFS.map(f => (
                <div key={f.id} className={`r4-frag-dot${collected.has(f.id) ? ' r4-frag-dot--found' : ''}`} />
              ))}
            </div>
            <span className="r4-hud-count">{collected.size} / 8 FRAGMENTS</span>
          </div>

          {/* Map viewport */}
          <div className="r4-map-wrap" ref={mapRef} onClick={handleMapClick}>
            <div className="r4-map-inner" ref={mapInnerRef}>
              <img src={mapImage} alt="ship map" className="r4-map-img" draggable={false} />

              {/* Fragments — show actual piece images */}
              {FRAGMENT_DEFS.map(f => !collected.has(f.id) && (
                <div key={f.id} className="r4-fragment" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                  <img src={PIECE_IMGS[f.id]} alt={`fragment ${f.id}`} className="r4-fragment-piece-img" draggable={false} />
                  <div className="r4-fragment-label">FRAG {f.id + 1}</div>
                </div>
              ))}

              {/* Sparkles on collected */}
              {FRAGMENT_DEFS.map(f => collected.has(f.id) && (
                <div key={`sp-${f.id}`} className="r4-collected-spark"
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}>✦</div>
              ))}

              {/* Player */}
              <img
                src={WALK_FRAMES[walkDir][frameIdx]}
                alt="player"
                className="r4-player"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scaleX(${walkFlip ? -1 : 1})`,
                }}
                draggable={false}
              />

              {/* Room labels */}
              {ROOMS.map(r => (
                <div key={r.id} className="r4-room-label"
                  style={{ left: `${r.cx}%`, top: `${r.cy + 4}%` }}>
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          {/* Minimap thumbnail */}
          <div className="r4-minimap-thumb" onClick={() => setMinimapOpen(o => !o)} title="Click to expand map">
            <img src={navMapImage} alt="minimap" className="r4-minimap-thumb-img" draggable={false} />
            <div className="r4-minimap-thumb-blip" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
          </div>

          {/* Expanded minimap popup */}
          {minimapOpen && (
            <div className="r4-minimap-popup" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              teleport({ cx: x, cy: y });
            }}>
              <img src={navMapImage} alt="full map" className="r4-minimap-popup-img" draggable={false} />
              <div className="r4-minimap-popup-blip" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
              <div className="r4-minimap-popup-hint">CLICK ANYWHERE TO TELEPORT</div>
              <button className="r4-minimap-popup-close"
                onClick={e => { e.stopPropagation(); setMinimapOpen(false); }}>✕</button>
            </div>
          )}

          <div className="r4-tip">CLICK TO MOVE · WASD / ARROW KEYS · THUMBNAIL → TELEPORT</div>
        </div>
      )}

      {/* ── PUZZLE ── */}
      {phase === 'puzzle' && (
        <div className="r4-puzzle">
          <img src={puzzleBg} alt="" className="r4-puzzle-bgimg" draggable={false} />
          <div className="r4-puzzle-overlay">
            <div className="r4-puzzle-title-bar">
              <div className="r4-puzzle-title-badge">PUT THE PIECES TOGETHER</div>
              <button className="r4-puzzle-reset" onClick={resetPuzzle}>↺ RESET</button>
            </div>

            <div className="r4-puzzle-main">
              <div className="r4-board-wrap">
                <div className={`r4-board${placedPieces.size === 8 ? ' r4-board--complete' : ''}`} ref={boardRef} style={{ width: BOARD_W, height: BOARD_H }}>
                  {PIECE_DEFS.map(p => (
                    <div
                      key={'zone-' + p.id}
                      className="r4-snap-zone"
                      style={{
                        left: p.col * CELL + 'px',
                        top: p.row * CELL + 'px',
                        width: p.w * CELL + 'px',
                        height: p.h * CELL + 'px',
                      }}
                    />
                  ))}

                  {PIECE_DEFS.map(p => placedPieces.has(p.id) && (
                    <div
                      key={'placed-' + p.id}
                      className="r4-piece r4-piece--placed r4-piece--block"
                      style={{
                        left: p.col * CELL + 'px',
                        top: p.row * CELL + 'px',
                        width: p.w * CELL + 'px',
                        height: p.h * CELL + 'px',
                        backgroundColor: p.color,
                        zIndex: 5 + p.id,
                      }}
                    />
                  ))}

                  {PIECE_DEFS.map(p => !placedPieces.has(p.id) && (
                    <div
                      key={'piece-' + p.id}
                      className={`r4-piece r4-piece--block${dragId === p.id ? ' r4-piece--dragging' : ''}`}
                      style={{
                        left: (piecePos[p.id]?.x ?? 0) + 'px',
                        top: (piecePos[p.id]?.y ?? 0) + 'px',
                        width: p.w * CELL + 'px',
                        height: p.h * CELL + 'px',
                        backgroundColor: p.color,
                        zIndex: dragId === p.id ? 999 : 10 + p.id,
                      }}
                      onMouseDown={e => startDrag(e, p.id)}
                      onTouchStart={e => startDrag(e, p.id)}
                    />
                  ))}

                  {placedPieces.size === 8 && (
                    <div className="r4-qr-overlay">
                      <img src={qrImage} alt="QR code" className="r4-qr-img" draggable={false} />
                    </div>
                  )}
                </div>

                {placedPieces.size === 8 && (
                  <div className="r4-qr-answer-wrap">
                    <p className="r4-qr-answer-hint">📡 Scan the QR code and enter the phrase</p>
                    <div className="r4-audio-row">
                      <input
                        className={`r4-code-input${codeStatus === 'ok' ? ' r4-code-input--ok' : codeStatus === 'err' ? ' r4-code-input--err' : ''}`}
                        type="text"
                        placeholder="ENTER DECODED PHRASE..."
                        value={audioCode}
                        onChange={e => { setAudioCode(e.target.value); setCodeStatus('idle'); }}
                        onKeyDown={e => e.key === 'Enter' && submitCode()}
                        readOnly={codeStatus === 'ok'}
                        autoFocus
                      />
                      <button className="r4-btn r4-btn--primary" onClick={submitCode} disabled={codeStatus === 'ok'}>
                        SUBMIT
                      </button>
                    </div>
                    {codeStatus === 'err' && <div className="r4-feedback r4-feedback--err">✗ INCORRECT — TRY AGAIN</div>}
                    {codeStatus === 'ok' && <div className="r4-feedback r4-feedback--ok">✓ DECODED — IMPOSTOR IDENTIFIED</div>}
                  </div>
                )}
              </div>

              <div className="r4-side-panel">
                <div className="r4-side-panel-title">PIECES</div>
                <div className="r4-progress-bar-wrap">
                  <div className="r4-progress-bar" style={{ width: (placedPieces.size / 8 * 100) + '%' }} />
                </div>
                {PIECE_DEFS.map(p => (
                  <div
                    key={'tray-' + p.id}
                    className={`r4-tray-slot${placedPieces.has(p.id) ? ' r4-tray-slot--placed' : ''}`}
                  >
                    <div className="r4-tray-block" style={{ backgroundColor: p.color }} />
                    {placedPieces.has(p.id) && <span className="r4-tray-check">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIO ── */}
      {phase === 'audio' && (
        <div className="r4-audio-phase">
          <div className="r4-audio-card">
            <div className="r4-audio-tag">TRANSMISSION RECEIVED</div>
            <h2 className="r4-audio-title">DECODE THE SIGNAL</h2>
            <p className="r4-audio-desc">
              The audio file contains a hidden message. Listen carefully — the impostor's
              identity is encoded within. Decode the transmission and enter the override phrase.
            </p>
            <div className="r4-waveform">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="r4-wave-bar"
                  style={{ animationDelay: `${i * 0.055}s`, height: `${18 + Math.abs(Math.sin(i * 0.9)) * 22}px` }} />
              ))}
            </div>
            <p className="r4-audio-hint">🔊 Delivered via QR scan · Decode the hidden phrase · Enter below</p>
            <div className="r4-audio-row">
              <input
                className={`r4-code-input${codeStatus === 'ok' ? ' r4-code-input--ok' : codeStatus === 'err' ? ' r4-code-input--err' : ''}`}
                type="text"
                placeholder="ENTER DECODED PHRASE..."
                value={audioCode}
                onChange={e => { setAudioCode(e.target.value); setCodeStatus('idle'); }}
                onKeyDown={e => e.key === 'Enter' && submitCode()}
                readOnly={codeStatus === 'ok'}
              />
              <button className="r4-btn r4-btn--primary" onClick={submitCode} disabled={codeStatus === 'ok'}>
                SUBMIT
              </button>
            </div>
            {codeStatus === 'err' && <div className="r4-feedback r4-feedback--err">✗ INCORRECT — LISTEN AGAIN</div>}
            {codeStatus === 'ok' && <div className="r4-feedback r4-feedback--ok">✓ DECODED — IMPOSTOR IDENTIFIED</div>}
            <button className="r4-btn r4-btn--ghost" onClick={() => setPhase('puzzle')} style={{ marginTop: 12 }}>
              ← BACK TO PUZZLE
            </button>
          </div>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {phase === 'complete' && (
        <div className="r4-complete">
          <div className="r4-complete-card">
            <div className="r4-complete-tag">MISSION COMPLETE</div>
            <h2 className="r4-complete-title">IMPOSTOR UNMASKED</h2>
            <p className="r4-complete-desc">
              All 8 QR fragments recovered. Transmission decoded. The impostor has been ejected.
            </p>
            <div className="r4-stat-row">
              <div className="r4-stat"><div className="r4-stat-lbl">FRAGMENTS</div><div className="r4-stat-val">8 / 8</div></div>
              <div className="r4-stat"><div className="r4-stat-lbl">STATUS</div><div className="r4-stat-val r4-stat-val--ok">CLEARED</div></div>
            </div>
            {onComplete && (
              <button className="r4-btn r4-btn--primary" style={{ marginTop: 16 }} onClick={onComplete}>
                CONTINUE TO ROUND 5 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}