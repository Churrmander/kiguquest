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

// PolyBLEP residual: band-limits the steps of naive saw/pulse waves (WebAudio's oscillators are band-limited too)
function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

// voice -> temp mono buffer (envelope applied, then the optional lowpass)
function renderOsc(N, v, rate, len) {
  const out = new Float32Array(len);
  const pts = N.envPoints(v.env, v.dur, v.amp);
  const st = { k: 0 };
  const pulse = v.wave === 'pulse' || v.wave === 'square';
  const d = v.wave === 'pulse' ? N.DUTY[v.duty === undefined ? 2 : v.duty] : 0.5;
  const hi = v.wave === 'pulse' ? 1 / Math.max(d, 1 - d) : 1;
  const sweep = v.f2 && v.f2 !== v.f;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / rate;
    let f = sweep ? v.f * Math.pow(v.f2 / v.f, Math.min(1, t / v.dur)) : v.f;
    if (v.vib) f += v.vib.depth * (v.vib.delay ? Math.min(1, t / v.vib.delay) : 1) * Math.sin(2 * Math.PI * v.vib.rate * t);
    const dt = Math.min(0.5, Math.abs(f) / rate);
    let x;
    if (pulse) {
      // DC-free, peak-normalised: what a PeriodicWave / native square gives
      let y = ph < d ? 1 : -1;
      y += blep(ph, dt);
      let p2 = ph - d; if (p2 < 0) p2 += 1;
      y -= blep(p2, dt);
      x = v.wave === 'pulse' ? ((y + 1) / 2 - d) * hi : y;
    } else if (v.wave === 'sawtooth') x = 2 * ph - 1 - blep(ph, dt);
    else if (v.wave === 'triangle') x = ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph;
    else x = Math.sin(2 * Math.PI * ph);
    out[i] = x * envAt(pts, st, t);
    ph += f / rate;
    ph -= Math.floor(ph);
  }
  if (v.lp) {
    // WebAudio lowpass: Q in dB (default -3 = Butterworth); exponential cutoff ramp lp -> lp2 over lpt, then held
    const q = v.q === undefined ? -3 : v.q;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, c;
    for (let i = 0; i < len; i++) {
      if ((i & 31) === 0) {
        const t = i / rate;
        const fc = v.lp2 ? v.lp * Math.pow(v.lp2 / v.lp, Math.min(1, t / (v.lpt || v.dur))) : v.lp;
        c = biquadCoefs('lp', Math.min(Math.max(fc, 30), rate * 0.45), q, rate);
      }
      const x = out[i];
      const y = c[0] * x + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      out[i] = y;
    }
  }
  return out;
}

function renderNoise(N, v, rate, len, seed) {
  const out = new Float32Array(len);
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
    out[i] = y * envAt(pts, st, t);
  }
  return out;
}

// ---------- FFT convolution (the engine's ConvolverNode, normalize = false) ----------
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < h; k++) {
        const a = i + k, b = a + h;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
/** Mono send x convolved with the stereo impulse [hL, hR], added into L and R (overlap-add; one complex FFT gives both channels). */
function convolveInto(x, hL, hR, L, R) {
  const m = hL.length;
  let size = 1;
  while (size < 2 * m) size <<= 1;
  const blk = size - m + 1;
  const HL = [new Float64Array(size), new Float64Array(size)], HR = [new Float64Array(size), new Float64Array(size)];
  HL[0].set(hL); HR[0].set(hR); fft(HL[0], HL[1], false); fft(HR[0], HR[1], false);
  const re = new Float64Array(size), im = new Float64Array(size);
  for (let s0 = 0; s0 < x.length; s0 += blk) {
    let any = false;
    re.fill(0); im.fill(0);
    for (let i = 0; i < blk && s0 + i < x.length; i++) { re[i] = x[s0 + i]; if (re[i]) any = true; }
    if (!any) continue;
    fft(re, im, false);
    for (let k = 0; k < size; k++) { // Y = X*HL + i*X*HR
      const xr = re[k], xi = im[k];
      const lr = xr * HL[0][k] - xi * HL[1][k], li = xr * HL[1][k] + xi * HL[0][k];
      const rr = xr * HR[0][k] - xi * HR[1][k], ri = xr * HR[1][k] + xi * HR[0][k];
      re[k] = lr - ri; im[k] = li + rr;
    }
    fft(re, im, true);
    const lim = Math.min(size, L.length - s0);
    for (let i = 0; i < lim; i++) { L[s0 + i] += re[i] / size; R[s0 + i] += im[i] / size; }
  }
}

/** Render compiled events in stereo. Returns { L, R, ch, rate, n }.
 *  Unpanned voices go to both sides at full level (WebAudio mono->stereo up-mix); panned ones use the StereoPanner equal-power law.
 *  Voices with `rev` feed the shared reverb. opts.perChannel keeps a mono dry buffer per channel (for level measurements). */
export function renderEvents(NP, events, seconds, opts = {}) {
  const N = NP.audio.notation;
  const rate = opts.rate || RATE;
  const n = Math.ceil(seconds * rate);
  const L = new Float32Array(n), R = new Float32Array(n);
  let send = null;
  const ch = {};
  let idx = 0;
  for (const e of events) {
    idx++;
    const s0 = Math.round(e.t * rate);
    if (s0 >= n) continue;
    const cb = opts.perChannel ? ch[e.ch] || (ch[e.ch] = new Float32Array(n)) : null;
    N.voices(e).forEach((v, vi) => {
      const len = Math.min(Math.floor(v.dur * rate), n - s0);
      if (len <= 0) return;
      const buf = v.k === 'osc' ? renderOsc(N, v, rate, len) : renderNoise(N, v, rate, len, ((idx * 2654435761) ^ (vi * 40503)) >>> 0);
      let gl = 1, gr = 1;
      if (v.pan !== undefined) { const x = (Math.max(-1, Math.min(1, v.pan)) + 1) / 2; gl = Math.cos(x * Math.PI / 2); gr = Math.sin(x * Math.PI / 2); }
      for (let i = 0; i < len; i++) { L[s0 + i] += buf[i] * gl; R[s0 + i] += buf[i] * gr; }
      if (v.rev) {
        send = send || new Float32Array(n);
        for (let i = 0; i < len; i++) send[s0 + i] += buf[i] * v.rev;
      }
      if (cb) {
        const k = v.pan !== undefined ? Math.SQRT1_2 : 1;
        for (let i = 0; i < len; i++) cb[s0 + i] += buf[i] * k;
      }
    });
  }
  if (send && opts.reverb !== false) {
    const [hL, hR] = N.reverbIR(rate);
    convolveInto(send, hL, hR, L, R);
  }
  return { L, R, ch, rate, n };
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

/** K-weighted channels of a render ([L, R]) or of one mono buffer. */
export function kWeightAll(r, rate = RATE) { return r.L ? [kWeight(r.L, rate), kWeight(r.R, rate)] : [kWeight(r, rate)]; }
/** Mono-equivalent signal power: channel mean squares averaged, so a centred source reads the same as the old mono renders. */
function powerMix(xks) {
  const n = xks[0].length, out = new Float32Array(n);
  for (const x of xks) for (let i = 0; i < n; i++) out[i] += (x[i] * x[i]) / xks.length;
  return out;
}
function lufsFromPow(pw, rate, short, seconds) {
  const sq = new Float32Array(pw.length);
  for (let i = 0; i < pw.length; i++) sq[i] = Math.sqrt(pw[i]); // so the existing gating code (which squares) can be reused
  return short ? shortLufs(sq, rate, seconds) : integratedLufs(sq, rate);
}
/** Loudness (LUFS, mono-equivalent BS.1770) of a stereo render. short: energy over the sound's length instead of gated blocks. */
export function renderLufs(r, short = false, seconds = 0) { return lufsFromPow(powerMix(kWeightAll(r, r.rate)), r.rate, short, seconds); }
export function renderPeak(r) {
  let peak = 0;
  for (const b of [r.L, r.R]) for (let i = 0; i < b.length; i++) { const a = Math.abs(b[i]); if (a > peak) peak = a; }
  return peak;
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
  const r = renderEvents(NP, events, seconds, Object.assign({ perChannel: !short }, opts));
  const peak = renderPeak(r);
  const lufs = renderLufs(r, short, seconds - 0.05);
  const ch = {};
  if (!short) for (const [c, buf] of Object.entries(r.ch)) ch[c] = activeLevel(kWeight(buf, r.rate), r.rate) - lufs;
  return { lufs, peak, crest: 20 * Math.log10(peak + 1e-9) - lufs, ch, seconds, fp, render: r };
}

// ---------- WAV output ----------
/** 16-bit WAV. buf: Float32Array (mono) or a render / [L, R] (stereo). limit: the engine's master soft limiter. */
export function writeWav(file, buf, rate = RATE, limit = true) {
  const chs = buf.L ? [buf.L, buf.R] : Array.isArray(buf) ? buf : [buf];
  const nc = chs.length, n = chs[0].length;
  const b = Buffer.alloc(44 + n * 2 * nc);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2 * nc, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(nc, 22); b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2 * nc, 28); b.writeUInt16LE(2 * nc, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2 * nc, 40);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      const v = limit ? softLimit(chs[c][i]) : chs[c][i];
      b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + (i * nc + c) * 2);
    }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, b);
}
