// Tiny Web Audio synth for UI sound effects — no audio files needed.
// Mute preference persists in localStorage under 'duo-sound'.

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isSoundOn() {
  try { return localStorage.getItem('duo-sound') !== 'off'; } catch { return true; }
}

export function setSoundOn(on) {
  try { localStorage.setItem('duo-sound', on ? 'on' : 'off'); } catch {}
}

// Play a sequence of [frequency, startOffset, duration] notes
function playNotes(notes, { type = 'sine', volume = 0.15 } = {}) {
  if (!isSoundOn()) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  notes.forEach(([freq, start, dur]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  });
}

export const sounds = {
  tap:      () => playNotes([[660, 0, 0.06]], { type: 'triangle', volume: 0.08 }),
  correct:  () => playNotes([[784, 0, 0.12], [1047, 0.09, 0.22]], { type: 'triangle' }),
  wrong:    () => playNotes([[220, 0, 0.18], [175, 0.12, 0.25]], { type: 'square', volume: 0.07 }),
  complete: () => playNotes([[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.15], [1047, 0.36, 0.4]], { type: 'triangle' }),
  badge:    () => playNotes([[880, 0, 0.1], [1175, 0.08, 0.1], [1568, 0.16, 0.35]], { type: 'sine', volume: 0.18 }),
};
