// Offline synth + loudness measurement for NP.audio. It renders the very same voice model that src/audio/engine.js plays through WebAudio
// (NP.audio.notation.voices / envPoints), including RBJ biquads with WebAudio's coefficient definitions, so "tune by numbers" means something.
// Loudness follows ITU-R BS.1770 (K-weighting at 48 kHz, 400 ms gated blocks for music; energy over >= 250 ms for short sounds).
import fs from 'node:fs';
import path from 'node:path';
import { loadNP, ROOT } from './load.mjs';

export const RATE = 48000;
export const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];

/** Load the audio scripts (files.json order) into a fresh NP. opts.skip: regex of files to leave out (the tuner skips levels.js). */
export function loadAudio(opts = {}) {
  const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/audio/files.json'), 'utf8')).filter((f) => !(opts.skip && opts.skip.test(f)));
  const { NP } = loadNP({ files: [...CORE, ...list], quiet: true });
  return NP;
}

// ---------- voice rendering ----------
function biquadCoefs(type, fc, q, rate) {
  const w0 = (2 * Math.PI * fc) / rate;
  const cos = Math.cos(w0), sin = Math.sin(w0);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'bp') {
    const al = sin / (2 * q);
    b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cos; a2 = 1 - al;
  } else {
    const al = sin / (2 * Math.pow(10, q / 20)); // WebAudio: Q of lowpass/highpass is in dB
    if (type === 'lp') { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = b0; } else { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = b0; }
    a0 = 1 + al; a1 = -2 * cos; a2 = 1 - al;
  }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}

function envAt(pts, state, t) {
  let k = state.k;
  while (k < pts.length - 2 && t >= pts[k + 1][0]) k++;
  state.k = k;
  const [t0, a0] = pts[k], [t1, a1] = pts[k + 1];
  if (t1 <= t0) return a1;
  const u = (t - t0) / (t1 - t0);
  return a0 + (a1 - a0) * (u < 0 ? 0 : u > 1 ? 1 : u);
}

function renderOsc(N, out, s0, v, rate) {
  const len = Math.min(Math.floor(v.dur * rate), out.length - s0);
  if (len <= 0) return;
  const pts = N.envPoints(v.env, v.dur, v.amp);
  const st = { k: 0 };
  const d = v.wave === 'pulse' ? N.DUTY[v.duty] : 0;
  const hi = v.wave === 'pulse' ? 1 / Math.max(d, 1 - d) : 1;
  const sweep = v.f2 && v.f2 !== v.f;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / rate;
    let f = sweep ? v.f * Math.pow(v.f2 / v.f, t / v.dur) : v.f;
    if (v.vib) f += v.vib.depth * (v.vib.delay ? Math.min(1, t / v.vib.delay) : 1) * Math.sin(2 * Math.PI * v.vib.rate * t);
    ph += f / rate;
    ph -= Math.floor(ph);
    let x;
    if (v.wave === 'pulse') x = (ph < d ? 1 - d : -d) * hi; // DC-free, peak-normalised: what a PeriodicWave gives
    else if (v.wave === 'triangle') x = ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph;
    else x = Math.sin(2 * Math.PI * ph);
    out[s0 + i] += x * envAt(pts, st, t);
  }
}

function renderNoise(N, out, s0, v, rate, seed) {
  const len = Math.min(Math.floor(v.dur * rate), out.length - s0);
  if (len <= 0) return;
  const pts = N.envPoints(v.env, v.dur, v.amp);
  const st = { k: 0 };
  const sweep = v.fc2 && v.fc2 !== v.fc;
  let s = seed >>> 0 || 1;
  let c = [0, 0, 0, 0, 0];
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / rate;
    if ((i & 31) === 0) {
      const fc = sweep ? v.fc * Math.pow(v.fc2 / v.fc, t / v.dur) : v.fc;
      c = biquadCoefs(v.filt, Math.min(Math.max(fc, 30), rate * 0.45), v.q, rate);
    }
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const x = s / 2147483648 - 1;
    const y = c[0] * x + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[s0 + i] += y * envAt(pts, st, t);
  }
}

/** Render compiled events. Returns { mix, ch:{p1,p2,tri,noi,sin}, rate, n }. seconds = length of the buffer (tails are cut). */
export function renderEvents(NP, events, seconds, opts = {}) {
  const N = NP.audio.notation;
  const rate = opts.rate || RATE;
  const n = Math.ceil(seconds * rate);
  const ch = {};
  let idx = 0;
  for (const e of events) {
    idx++;
    const s0 = Math.round(e.t * rate);
    if (s0 >= n) continue;
    const out = ch[e.ch] || (ch[e.ch] = new Float32Array(n));
    N.voices(e).forEach((v, vi) => {
      if (v.k === 'osc') renderOsc(N, out, s0, v, rate);
      else renderNoise(N, out, s0, v, rate, ((idx * 2654435761) ^ (vi * 40503)) >>> 0);
    });
  }
  const mix = new Float32Array(n);
  for (const c of Object.values(ch)) for (let i = 0; i < n; i++) mix[i] += c[i];
  return { mix, ch, rate, n };
}

/** The master soft limiter of engine.js (linear below 0.7, tanh knee above). */
export function softLimit(x) {
  const k = 0.7, a = Math.abs(x);
  if (a <= k) return x;
  return Math.sign(x) * (k + (1 - k) * Math.tanh((a - k) / (1 - k)));
}

// ---------- loudness ----------
function biquadRun(x, b, a) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
    y[i] = v;
  }
  return y;
}
/** BS.1770 K-weighting (coefficients are the standard 48 kHz ones). */
export function kWeight(x, rate = RATE) {
  if (rate !== 48000) throw new Error('K-weighting coefficients are for 48 kHz');
  const s = biquadRun(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]);
  return biquadRun(s, [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]);
}
const LU = (ms) => -0.691 + 10 * Math.log10(Math.max(ms, 1e-14));

function blockMs(xk, blk, hop) {
  const cs = new Float64Array(xk.length + 1);
  for (let i = 0; i < xk.length; i++) cs[i + 1] = cs[i] + xk[i] * xk[i];
  const out = [];
  for (let s = 0; s + blk <= xk.length; s += hop) out.push((cs[s + blk] - cs[s]) / blk);
  return { ms: out, total: cs[xk.length] };
}
/** Gated integrated loudness (LUFS) of a K-weighted signal. */
export function integratedLufs(xk, rate = RATE) {
  const { ms, total } = blockMs(xk, Math.round(0.4 * rate), Math.round(0.1 * rate));
  if (!ms.length) return LU(total / Math.max(1, xk.length));
  const g1 = ms.filter((m) => LU(m) > -70);
  if (!g1.length) return -70;
  const mean1 = g1.reduce((a, b) => a + b, 0) / g1.length;
  const g2 = g1.filter((m) => LU(m) > LU(mean1) - 10);
  return LU(g2.reduce((a, b) => a + b, 0) / g2.length);
}
/** Loudness of a short sound: energy averaged over max(duration, minWin). */
export function shortLufs(xk, rate, seconds, minWin = 0.25) {
  let e = 0;
  for (let i = 0; i < xk.length; i++) e += xk[i] * xk[i];
  return LU(e / (rate * Math.max(seconds, minWin)));
}
/** Average level (LUFS-style) over the 100 ms blocks in which the signal is audible: how loud a channel is when it plays. */
export function activeLevel(xk, rate = RATE) {
  const { ms } = blockMs(xk, Math.round(0.1 * rate), Math.round(0.05 * rate));
  const on = ms.filter((m) => LU(m) > -75);
  if (!on.length) return -99;
  return LU(on.reduce((a, b) => a + b, 0) / on.length);
}

/**
 * Measure one id. kind: 'music' (songs + jingles), 'sfx', 'cry' (id = cry parameter object).
 * opts: { levels:false -> measure without the stored gains, window: seconds of a song to render (default 30) }
 */
export function measure(NP, kind, id, opts = {}) {
  const A = NP.audio;
  const lv = opts.levels !== false;
  let events, seconds, fp, short = false;
  if (kind === 'music') {
    const c = A.compile(id, { levels: lv });
    const win = Math.min(c.total, opts.window || 30);
    events = c.events.filter((e) => e.t < win);
    seconds = win;
    fp = c.fp;
  } else if (kind === 'sfx') {
    const c = A.sfxEvents(id, { levels: lv });
    events = c.events; seconds = c.seconds + 0.05; fp = c.fp; short = true;
  } else {
    events = id.events; seconds = id.seconds + 0.05; short = true;
  }
  const r = renderEvents(NP, events, seconds, opts);
  let peak = 0;
  for (let i = 0; i < r.mix.length; i++) { const a = Math.abs(r.mix[i]); if (a > peak) peak = a; }
  const xk = kWeight(r.mix, r.rate);
  const lufs = short ? shortLufs(xk, r.rate, seconds - 0.05) : integratedLufs(xk, r.rate);
  const ch = {};
  if (!short) for (const [c, buf] of Object.entries(r.ch)) ch[c] = activeLevel(kWeight(buf, r.rate), r.rate) - lufs;
  return { lufs, peak, crest: 20 * Math.log10(peak + 1e-9) - lufs, ch, seconds, fp, render: r };
}

// ---------- WAV output ----------
export function writeWav(file, buf, rate = RATE, limit = true) {
  const b = Buffer.alloc(44 + buf.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + buf.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) {
    const v = limit ? softLimit(buf[i]) : buf[i];
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, b);
}
