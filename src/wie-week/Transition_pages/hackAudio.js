// Lightweight WebAudio sound effects — no external assets.
let ctx = null;
let masterGain = null;
let volume = 0.7;

function getCtx() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);
    }
    return ctx;
}
function dest() {
    return masterGain || getCtx().destination;
}

export function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (typeof window !== "undefined") localStorage.setItem("hau_volume", String(volume));
    if (masterGain) masterGain.gain.value = volume;
}

export function getVolume() {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hau_volume");
        if (stored !== null) volume = parseFloat(stored);
    }
    return volume;
}

export function playAlarm(duration = 1.2) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    for (let i = 0; i < Math.floor(duration / 0.3); i++) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sawtooth";
        const start = now + i * 0.3;
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 440, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.linearRampToValueAtTime(0, start + 0.28);
        osc.connect(gain).connect(dest());
        osc.start(start);
        osc.stop(start + 0.3);
    }
}

export function playPress() {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(dest());
    osc.start(now);
    osc.stop(now + 0.3);
}

export function playBlip(correct) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(correct ? 660 : 200, now);
    osc.frequency.exponentialRampToValueAtTime(correct ? 990 : 110, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(dest());
    osc.start(now);
    osc.stop(now + 0.2);
}